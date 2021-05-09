const mongoCollections = require('../config/mongoCollections');
const listings = mongoCollections.listings;
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

    if(!endDate) throw `post date needs to provide`;
    if(typeof endDate !== 'string') throw `end date needs to be string`;
    if(isNaN(Date.parse(endDate))) throw `not a valid end date`;

    if(!url) throw "url needs to be provided";
    if(typeof url !== 'string') throw 'url is not string';
    if(!isURL(url)) throw 'invalid url';

    if(!description) throw "discription needs to be provided";
    if(typeof description !== 'string') throw "description needs to be string";
    if(description.trim().length===0) throw 'description can not be empty';

    const listingCollection = await listings();

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
    //console.log(newId);
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
    const updateInfo = await userCollection.updateOne({_id:listingId},{$pull:{comments:{_id:id}}});
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount){
        throw 'Update failed';
      }
    return true;
}
async function removeBids(id){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.trim().length===0) throw `emptry string of id`;

    const listingCollection = await listings();
    let listingId = "";
    const lisinglist = await listingCollection.find({},{projection: {_id:1, bids:1}}).toArray();
    for (l of lisinglist){
        for(lists of l.bids){
            if(lists._id === id){
                listingId = l._id;
            }
        }
    }
    const updateInfo = await userCollection.updateOne({_id:listingId},{$pull:{bids:{_id:id}}});
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount){
        throw 'Update failed';
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