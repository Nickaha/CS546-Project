const mongoCollections = require('../config/mongoCollections');
const listings = mongoCollections.listings;
const usercol = mongoCollections.users;
const bidcol = mongoCollections.bids;
const commcol = mongoCollections.comments;
const users = require('./users');
const uuid = require('uuid');

function isURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return pattern.test(str);
  }

async function createListing(postDate, endDate, url, description){

    if(!postDate) throw `post date needs to provide`;
    if(typeof postDate !== 'string') throw `post date needs to be string`;
    if(isNaN(Date.parse(postDate))) throw `not a valid post date`;

    if(!endDate) throw `end date needs to provide`;
    if(typeof endDate !== 'string') throw `end date needs to be string`;
    if(isNaN(Date.parse(endDate))) throw `not a valid end date`;
    if((Date.parse(endDate)-Date.parse(postDate))<0) throw 'end date has to be date in the future';

    if(!url) throw "url needs to be provided";
    if(typeof url !== 'string') throw 'url is not string';
    if(!isURL(url)) throw 'invalid url';

    if(!description) throw "discription needs to be provided";
    if(typeof description !== 'string') throw "description needs to be string";
    if(description.trim().length===0) throw 'description can not be empty';

    const listingCollection = await listings();

    const alllisting = await this.getAll();

    alllisting.forEach(x => {
        if(url===x.URL) throw "The URL has been used before";
    });

    const comments = [];
    const bids = [];
    const newListing = {
        _id: uuid.v4(),
        postDate: postDate,
        endDate:endDate,
        URL:url,
        description:description,
        comments:comments,
        bids:bids
    };
    const insertInfo = await listingCollection.insertOne(newListing);
    if (insertInfo.insertedCount === 0) throw 'Could not add listing';

    const newId = insertInfo.insertedId;

    const rv = await this.getLisingById(newId.toString());

    rv._id = rv._id.toString();
    return rv;
}

async function getAll(){
    const listingCollection = await listings();
    const listingsarray = await listingCollection.find({}).toArray();
    return listingsarray;
}

async function getallofuser(userid){
    const userinfo = await users.getUserById(userid);
    const {userListings} = userinfo;
    let result = [];
    for (listingsinfo of userListings){
        const addlist = await this.getLisingById(listingsinfo);
        result.push(addlist);
    }
    return result;
}

//Listing is misspelled
async function getLisingById(id){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.trim().length===0) throw `emptry string of id`;
    const listingCollection = await listings();
    const result = await listingCollection.findOne({_id:id});
    if(result === null) throw "No listing with that id";
    return result;
}

async function updateListing(id, updateInfo){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.trim().length===0) throw `emptry string of id`;

    let updateList = {};

    if(updateInfo.url){
        if(typeof updateInfo.url !== 'string') throw 'url is not string';
        const regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
        if(!regexp.test(updateInfo.url)) throw 'invalid url';
        updateList.URL = updateInfo.url;
    }
    if(updateInfo.description){
        if(typeof updateInfo.description !== 'string') throw "description needs to be string";
        if(updateInfo.description.trim().length===0) throw 'description can not be empty';
        updateList.description = updateInfo.description;
    }

    if(updateInfo.comments){
        if(!Array.isArray(updateInfo.comments)) throw "comments needs to be array";
        updateInfo.comments.forEach(x => {
            if(typeof x !=='object') throw `comment ${x} is not an object`;
        });
        updateList.comments = updateInfo.comments;
    }
    if(updateInfo.bids){
        if(!Array.isArray(updateInfo.bids)) throw "bids needs to be array";
        updateInfo.bids.forEach(x => {
            if(typeof x !=='object') throw `bid ${x} is not an object`;
        });
        updateList.bids = updateInfo.bids;
    }
    const listingCollection = await listings();
    await listingCollection.updateOne({_id:id},{$set:updateList});
    let result = await this.getLisingById(id);
    return result;
}

async function deleteListing(id){
    if(!id) throw `no id provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.length === 0) throw `id is empty`;
    const listingCollection = await listings();
    const listing = await listingCollection.findOne({_id:id});
    if(listing===null) throw 'no listing with that id';

    for (let i = 0; i < listing.bids.length; i++){
        try {
            //await bids.deleteBid(listing.bids[i]._id);
            let bid_id = listing.bids[i]._id
            // This is a hacky attempt to avoid a circular dependency error.
            // This code is bids.deleteBid.
            if(!bid_id) throw `no id provided`;
            if(typeof bid_id !== 'string') throw `id is not string`;
            if(bid_id.length === 0) throw `id is empty`;
            const bidCollection = await bidcol();
            const bid = await bidCollection.findOne({_id:bid_id});
            if (bid===null) throw 'no bid with that id';
            await this.removeBids(bid_id, bid.listid);
            await users.removeBid(bid_id);
            const deleteinfo = await bidCollection.deleteOne({ _id: bid_id });
            if (deleteinfo.deletedCount === 0) {
                throw `Could not delete bid with id of ${bid_id}`;
            }
        } catch (error) {
            throw `Error: ${error}, during listing deletion for id ${id}`;
        }
        
    }
    for (let i = 0; i < listing.comments.length; i++){
        try {
            // Another hacky circular dependency fix.
            //await comments.deleteComment(listing.comments[i]._id);
            let comment_id = listing.comments[i]._id;
            let commentCollection = await commcol();
            await commentCollection.deleteOne( {_id: comment_id} );
        } catch (error) {
            throw `Error: ${error}, during listing deletion for id ${id}`;
        }
        
    }
    await users.removeListing(id);
    const deleteinfo = await listingCollection.deleteOne({ _id: id });
    if (deleteinfo.deletedCount === 0) {
        throw `Could not delete listing with id of ${id}`;
    }
    return true;
}

async function removeComments(id){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.trim().length===0) throw `emptry string of id`;

    const listingCollection = await listings();
    let listingId = "";
    const lisinglist = await listingCollection.find({},{projection: {_id:1, comments:1}}).toArray();
    for (l of lisinglist){
        for(lists of l.comments){
            if(lists._id === id){
                listingId = l._id;
            }
        }
    }
    const userCollection = await usercol();
    const updateInfo = await userCollection.updateOne({_id:listingId},{$pull:{comments:{_id:id}}});
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount){
        throw 'Update failed';
      }
    return true;
}
async function removeBids(bid_id, list_id){
    // Does not seem to be working given the proper id.
    if(!bid_id) throw `id is not provided`;
    if(typeof bid_id !== 'string') throw `id is not string`;
    if(bid_id.trim().length===0) throw `emptry string of id`;

    // Get specific listing, remove the bid_id, update the listing.
    const listingCollection = await listings();

    const listing = await listingCollection.findOne({ _id: list_id});
    if (listing === null){
        throw 'Bid Delete: Listing not found!';
    }
    
    for (let i = 0; i < listing.bids.length; i++){
        if (listing.bids[i]._id === bid_id){
            let newlistbids = listing.bids;
            newlistbids.splice(i, 1);

            const targetListingUpdate = await listingCollection.updateOne(
                {_id: list_id},
                {$set: {bids: newlistbids}}
            );

            if (targetListingUpdate.modifiedCount === 0){
                throw `could not update listing id ${list_id} during bid delete.`;
            }

            break;
        }
    }


    return true;
}

module.exports = {
    createListing,
    getAll,
    getLisingById,
    getallofuser,
    updateListing,
    deleteListing,
    removeBids,
    removeComments
};