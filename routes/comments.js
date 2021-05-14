const express = require('express');
const router = express.Router();
const data = require('../data');
const commentData = data.comments;
const listingData = data.listings;
const xss = require('xss');
// POST
router.post( '/:id', async (req, res) => {
    // Returns JSON for use with AJAX.
    // The idea is that we modify the DOM with JQuery after the request, but
    // on page reload the new post will also be fetched.
    if (!xss(req.session.user)){
        return res.status(401).json({message: "Unauthorized."});
    }

    const listid = xss(req.params.id);
    const comment = xss(req.body.comment); // POST body MUST have attribute "comment"!
    const username = xss(req.session.user.userName);

    if (listid === undefined || listid === ""){
        return res.status(400).json({message: "Listing ID undefined."});
    }

    if (!username){
        return res.status(500).json({message: "Username missing from session data."});
    }

    if (comment === undefined || comment.trim() === ""){
        return res.status(400).json({message: "Comment must be a non-empty string of characters containing more than spaces."});
    }
    try {
        const insertion = await commentData.createComment(username, comment, listid);
        return res.status(200).json({message: "Comment posted successfully."});
    } catch (error) {
        return res.status(500).json({message: "Failed to post comment."});
    }

});

// DELETE
router.delete('/:id', async (req, res) =>{
    // Return JSON for use with AJAX. Delete the element with JQuery on the page,
    // and remove from the database so that on reload it is missing.
    if (!xss(req.session.user)){
        return res.status(401).json({message: "Unauthorized."});
    }
    const commentid = xss(req.params.id);
    if (commentid === undefined || commentid === ""){
        return res.status(400).json({message: "Comment ID undefined."});
    }
    const comment = await commentData.getCommentById(commentid);
    if (xss(req.session.user.userName) !== comment.name){
        return res.status(403).json({message: "Forbidden: Cannot delete other user's comment."});
    }

    try {
        const deletion = await commentData.deleteComment(commentid);
        return res.status(200).json({message: "Comment successfully deleted."});
    } catch (error) {
        return res.status(500).json({message: "Failed to delete comment."});
    }

});