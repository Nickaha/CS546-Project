const express = require('express');
const router = express.Router();
const data = require('../data');
const bidData = data.bids;
const listingData = data.listings
let { ObjectId } = require('mongodb');

router.get( '/', async (req, res) =>{
    if (!req.session.user){
        res.render('login',{title: "Log In"});
    } else{
        const user = req.session.user;
        // Fetch all the bids for that user.
        const userBids = await bidData.getUserBids(user._id);
        //Get myBid onto the NFT listings, get highestBid as well.
        let bidListings = [];
        for (let i = 0; i < userBids.length; i++){
            //For each bid, get the listing, its highest bid, and append into bidListings.
            
            const listid = userBids[i].listid;
            const listing = await listingData.getLisingById(listid);
            const listbids = listing.bids;

            //Find highestBid (as a currency amount)
            let topBid = 0
            listbids.forEach(bid => {
                if (bid.highestBid){
                    topBid = bid.bid; 
                }
            });

            //If, for some reason, we still have no topBid, select user bid as top
            if (topBid === 0){
                topBid = userBids[i].bid;
            }

            // Get data into format for passing into handlebars
            bidListings.append({
                image: listing.URL,
                expire: listing.endDate,
                desc: listing.description,
                highestbid: topBid,
                mybid: userBids[i].bid
            });
        }
        res.render('bids', {title: "Your Bids", NFT: bidListings});
    }
} );

router.post('/:id', async (req, res) => {
    // This route will not return HTML - it returns JSON and a status code.
    // Will be called through AJAX on listing pages.
    // Check user authentication and data integrity. 

    if (!req.session.user){
        return res.status(401).json({message: "Unauthorized."});
    }
    let listid = req.params.id;
    const bid = req.body.bid; // POST body MUST contain attribute "bid"!
    const username = req.session.user.userName;
    const userId = req.session.user._id;

    try {
        if (!listid || listid === ""){
            throw "Listing ID missing.";
        }else if (!bid || typeof(bid) !== 'number'){
            throw "Bid missing or of invalid type.";
        }else if (!username){
            throw "Username not found.";
        }
    } catch (error) {
        return res.status(400).json({message: error});
    }
    //Convert listid to ObjectID.
    try {
        listid = ObjectId(listid);
    } catch (error) {
        return res.status(400).json({message: "Invalid Object ID."});
    }
    listid = ObjectId(listid);

    // After getting all our data, authenticate user to post to the bid. User cannot post to their own listing.
    
    const userListings = await listingData.getallofuser(userId);
    for (let i = 0; i < userListings.length; i++){
        // Verify that it is not the user's own bid.
        if (listid.equals(userListings[i]._id)){
            return res.status(403).json({message: "Forbidden: Cannot bid on own listing."});
        }
    }
    // Post the bid.
    try {
        const bidMade = await bidData.createBid(username, bid, listid);
        return res.status(200).json({message: "Bid successful."});
    } catch (error) {
        return res.status(500).json({message: "Failed to post bid."});
    }
});

router.delete('/:id', async (req, res) => {
    // This route will not return HTML - it returns JSON and a status code.
    // Will be called through AJAX on listing/bids pages.
    // Check user authentication and data integrity.
    if (!req.session.user){
        return res.status(401).json({message: "Unauthorized."});
    }
    if (!req.session.user._id){
        return res.status(500).json({message: "User ID missing from session."});
    }

    let bidId = req.params.id;
    const userBids = await bidData.getUserBids(req.session.user._id);

    //Check that id is provided
    if (bidId === undefined || bidId === ""){
        return res.status(400).json({message: "Bid id missing."});
    }
    
    //Convert bidId to ObjectID.
    try {
        bidId = ObjectId(bidId);
    } catch (error) {
        return res.status(400).json({message: "Invalid Object ID."});
    }
    bidId = ObjectId(bidId);

    /* Only delete the bid if, after looping through user bids for the currently
    authenticated user, bid of matching id is found. Otherwise, return with an error.
     */ 
    let found = false;
    for (let i = 0; i < userBids.length; i++){
        if ( bidId.equals(userBids[i]._id) ){
            found = true;
        }
    }
    // Return error if no matching bid is found.
    if (!found){
        return res.status(403).json({message: "Bid ID not found or not authorized for current user."});
    }

    //return OK status and JSON if delete successful, otherwise 500 and JSON
    try {
        const deletion = await bidData.deleteBid(bidId);
        return res.status(200).json({message: "Bid successfully deleted."});
    } catch (error) {
        return res.status(500).json({message: "Bid deletion failed."});
    }
});

module.exports =router;