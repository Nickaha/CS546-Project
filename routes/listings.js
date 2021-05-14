const express = require('express');
const router = express.Router();
const data = require('../data');
const listingData = data.listings;
const userData = data.users;
const bcrypt = require('bcryptjs');

router.get('/', async (req,res)=>{
    if(!req.session.user){
        res.render('login',{title:"Log in", haserror:false, haserror2:false,hidelogin:true,hidereg:false});
    } else{
        try{

            const listinglist = await listingData.getallofuser(req.session.user._id);
            
            // Since the handlebars view doesn't use the same variable names, we rename.
            let renderData = [];
            listinglist.forEach(listing => {
                // Also need to calculate maximum bid.
                let maxbid = 0;
                listing.bids.forEach(bid => {
                    if (bid.bid > maxbid){
                        maxbid = bid.bid;
                    }
                });
                renderData.push({
                    id: listing._id,
                    url: '/listing/'+listing._id,
                    image: listing.URL,
                    expire: listing.endDate,
                    desc: listing.description,
                    highestbid: maxbid
                });
            });
            res.render('listings', {title: "Your Listings", NFT:renderData});
        } catch(e){
            res.status(401).render('listings',{error:e, haserror:true});
        }
    }
});

router.get('/:id', async (req,res)=>{
    if(!req.session.user){
        res.render('login', {title:"Log in"});
    } else {
        try{
            const listinginfo = await listingData.getLisingById(req.params.id);
            // Need to add id strings to the comments
            for (let i = 0; i < listinginfo.comments.length; i++){
                listinginfo.comments[i].s_id = listinginfo.comments[i]._id;
            }
            let maxbid = 0;
            listinginfo.bids.forEach(bid => {
                if (bid.bid > maxbid){
                    maxbid = bid.bid;
                }
            });
            listinginfo.highestbid = maxbid;
            res.render('NFT', {title: "NFT Listing: " + listinginfo.description, NFT:listinginfo,userid:req.session.user._id});
        } catch(e){
            res.status(401).render('listings',{error:e, haserror:true});
        }
    }
});

router.post('/',async (req,res)=>{
    if(!req.session.user){
        return res.render('login',{title:"Log in", haserror:false, haserror2:false,hidelogin:true,hidereg:false});
    }
    
    let nftdata = req.body;
    //console.log(nftdata);
    let errors=[];
    if(!nftdata.url) errors.push('url is not provided');
    if(!nftdata.description) errors.push('description is not provided');
    if(!nftdata.datetime) errors.push('expire date is not provided');
    if(errors.length>0){
        res.status(401).render('listings',{errors:errors, posterror:true});
    }
    try{
        let today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
       
        
        today = mm + '/' + dd + '/' + yyyy;
        const newlisting = await listingData.createListing(today, nftdata.datetime, nftdata.url, nftdata.description);
        // Add Listing to User sub-collection.
     
        let currentUser = await userData.getUserById(req.session.user._id);
       
        currentUser.userListings.push(newlisting._id);
        let updateInfo = {userListings: currentUser.userListings};
        const update = await userData.updateUser(req.session.user._id, updateInfo);
    
        res.redirect('/');
    }catch(e){
        res.status(401).render('postNFT',{errors:[e], haserror:true,title:"create NFT"});
        
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

    let listId = req.params.id;
    const userListings = await listingData.getallofuser(req.session.user._id);

    //Check that id is provided
    if (listId === undefined || listId === ""){
        return res.status(400).json({message: "List id missing."});
    }

    /* Only delete the bid if, after looping through user bids for the currently
    authenticated user, bid of matching id is found. Otherwise, return with an error.
     */ 
    let found = false;
    for (let i = 0; i < userListings.length; i++){
        if (listId === userListings[i]._id){
            found = true;
        }
    }
    // Return error if no matching bid is found.
    if (!found){
        return res.status(403).json({message: "Listing ID not found or not authorized for current user."});
    }

    //return OK status and JSON if delete successful, otherwise 500 and JSON
    try {
        const deletion = await listingData.deleteListing(listId);
        return res.status(200).json({message: "Listing successfully deleted."});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Listing deletion failed."});
    }
});

module.exports=router;