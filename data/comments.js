const mongoCollections = require('../config/mongoCollections');
const comments = mongoCollections.comments;
const listings = require('./listings');
const uuid = require('uuid');

async function createComment(name, comment, listingid){
    if(!name) throw "name needs to be provided";
    if(typeof name !== 'string') throw 'name needs to be string';
    if(name.trim().length===0) throw 'name can not be empty';

    if(!comment) throw "comment needs to be provided";
    if(typeof comment !== 'string') throw 'comment needs to be string';
    if(comment.trim().length===0) throw 'comment can not be empty';

    const commentCollection = await comments();
    // Listing info for updating listing with new comments. 
    const listingObject = await listings.getLisingById(listingid);
    let listingComments = listingObject.comments;

    const newComment = {
        _id:uuid.v4(),
        name: name,
        comment:comment,
        listid: listingid
    };

    const insertInfo = await commentCollection.insertOne(newComment);
    if (insertInfo.insertedCount === 0) throw 'Could not add comment';
    //console.log(insertInfo);
    const newId = insertInfo.insertedId;
    //console.log(newId);
    const rv = await this.getCommentById(newId.toString());
    rv._id = rv._id.toString();
    // Add to subdocument as well and updatelisting.
    listingComments.push(newComment);
    await listings.updateListing(listingid, {comments:listingComments});
    return rv;
}

async function getAll(){
    const commentCollection = await comments();
    const commentList = await commentCollection.find({}).toArray();
    return commentList;
}

async function getListingComments(listingid){
    const listinginfo = await listings.getLisingById(listingid);
    const commentlist = listinginfo.comments;
    return commentlist;
}

async function getCommentById(id){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.trim().length===0) throw `emptry string of id`;
    const commentCollection = await comments();
    const result = await commentCollection.findOne({_id:id});
    if(result===null) throw 'No comment with that id';
    return result;
}

async function deleteComment(id){
    if(!id) throw `no id provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.length === 0) throw `id is empty`;
    const commentCollection = await comments();
    const comment = await commentCollection.findOne({_id:id});
    if (comment===null) throw 'no comment with that id';
    await listings.removeComments(id);
    const deleteinfo = await commentCollection.deleteOne({ _id: id });
    if (deleteinfo.deletedCount === 0) {
        throw `Could not delete comment with id of ${id}`;
    }
    return true;
}

module.exports = {
    createComment,
    getAll,
    getCommentById,
    getListingComments,
    deleteComment
};