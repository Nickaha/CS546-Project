const mongoCollections = require('../config/mongoCollections');
const bids = mongoCollections.bids;
const listings = require('./listings');
const users = require('./users');
const uuid = require('uuid');

async function createBid(username, bid, listid, userid){
    if(!username) throw "username needs to be provided";
    if(typeof username !== 'string') throw 'username needs to be string';
    if(username.trim().length===0) throw 'username can not be empty';

    if(!bid) throw "bid needs to be provided";
    if(typeof bid !== 'number' || isNaN(bid)) throw 'bid needs to be number';
    // Potentially: remove old bids if listid is the same.
    const bidCollection = await bids();
    const bidlist =  await listings.getLisingById(listid);
    const bidoflist = bidlist.bids;
    const bidlist2 = await users.getUserById(userid);
    const bidoflist2 = bidlist2.userBids;
    let maxbid = 0;
    bidoflist.forEach(x => {
        if(x.bid>maxbid){
            maxbid = x.bid;
        }
    });
    let highestBid = true;
    if(bid<maxbid){
        highestBid = false;
    }
    if(!highestBid) throw 'The current bid is not higher than the highest bid.';
    const newBid = {
        _id:uuid.v4(),
        username:username,
        bid:bid,
        highestBid:highestBid,
        listid:listid
    };
    const insertInfo = await bidCollection.insertOne(newBid);
    if (insertInfo.insertedCount === 0) throw 'Could not add bid';

    const newId = insertInfo.insertedId;
    //console.log(newId);
    const rv = await this.getBidById(newId.toString());
    rv._id = rv._id.toString();
    if(highestBid){
        bidoflist.forEach(x => {
            x.highestBid = false;
        });
    }
    // Add to subdocument and update listing.
    bidoflist.push(newBid);
    bidoflist2.push(newBid._id);
    await listings.updateListing(listid, {bids:bidoflist});
    await users.updateUser(userid,{userBids:bidoflist2});
    return rv;
}

async function getAll(){
    const bidCollection = await bids();
    const result = await bidCollection.find({}).toArray();
    return result;
}

async function getListingBids(listid){
    const listinfo = await listings.getLisingById(listid);
    const bidlist = listinfo.bids;
    return bidlist;
}

async function getUserBids(userid){
    const userinfo =await users.getUserById(userid);
    const bidlist = userinfo.userBids;
    return bidlist;
}

async function getBidById(id){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.trim().length===0) throw `emptry string of id`;
    const bidCollection = await bids();
    const result = await bidCollection.findOne({_id:id});
    if(result===null) throw 'No bid with that id';
    return result;
}

async function deleteBid(id){
    if(!id) throw `no id provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.length === 0) throw `id is empty`;
    const bidCollection = await bids();
    const bid = await bidCollection.findOne({_id:id});
    if (bid===null) throw 'no bid with that id';
    await listings.removeBids(id, bid.listid);
    await users.removeBid(id);
    const deleteinfo = await bidCollection.deleteOne({ _id: id });
    if (deleteinfo.deletedCount === 0) {
        throw `Could not delete bid with id of ${id}`;
    }
    return true;
}

module.exports={
    createBid,
    getAll,
    getBidById,
    getListingBids,
    getUserBids,
    deleteBid
};