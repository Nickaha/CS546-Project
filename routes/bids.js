const express = require('express');
const router = express.Router();
const data = require('/data');
const bidData = data.bids;
const listingData = data.listings


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

router.post('/:id', async (req, req) => {
    //TODO - Check user authentication
    
    console.log("POST bids/:id");
    const listid = req.params.id;
    // Also needed -- request body data with bid price.
    
    
    //Check that id is provided, attempt to add bid to the listing,
    // Go to ??? page with message "Bid was successfully placed."
    if (listid === undefined || listid === ""){
        return //res.render -- Not sure which page to visit
    }
    let retval = await bidData.createBid();
    // TODO - Return to some page after request finishes.
});

router.delete('/:id', async (req, req) => {
    //TODO - Check user authentication
    
    const bidId = req.params.id;
    //TODO - get user bids
    
    //Check that id is provided, attempt to delete, go to bids with message:
    //"Bid was succcessfully deleted."
    if (bidId === undefined || bidId === ""){
        return //res.render -- How do I pass the message to the '/' route?
    }

    /*TODO - Only delete the bid if, after looping through user bids for the currently
    authenticated user, bid of matching id is found. Otherwise, return with an error.
     */ 

    let retval = await bidData.deleteBid(bidId);
    // TODO - return to some page after request finishes.
});