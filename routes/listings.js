const express = require('express');
const router = express.Router();
const data = require('../data');
const listingData = data.listings;
const bcrypt = require('bcryptjs');

router.get('/', async (req,res)=>{
    if(!req.session.user){
        res.render('login',{title:"Log in"});
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
                //Convert the ObjectId to a string for usage in HTML id.
                listinginfo.comments[i].s_id = listinginfo.comments[i]._id.valueOf();
            }
            let maxbid = 0;
            listinginfo.bids.forEach(bid => {
                if (bid.bid > maxbid){
                    maxbid = bid.bid;
                }
            });
            listinginfo.highestbid = maxbid;
            res.render('NFT', {title: "NFT Listing: " + listinginfo.description, NFT:listinginfo});
        } catch(e){
            res.status(401).render('listings',{error:e, haserror:true});
        }
    }
});

router.post('/',async (req,res)=>{
    let nftdata = req.body;
    let errors=[];
    if(!nftdata.url) errors.push('url is not provided');
    if(!nftdata.description) errors.push('description is not provided');
    if(!nftdata.expdate) errors.push('expire date is not provided');
    if(errors.length>0){
        res.status(401).render('listings',{errors:errors, posterror:true});
    }
    try{
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = mm + '/' + dd + '/' + yyyy;
        const newlisting = await listingData.createListing(today, nftdata.expdate, nftdata.url, nftdata.description);
        res.render('listing',{listinginfo:newlisting});
    }catch(e){
        res.status(401).render('listings',{error:e, haserror:true});
    }
});

module.exports=router;