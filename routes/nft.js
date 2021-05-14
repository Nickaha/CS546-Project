const express = require('express');
const router = express.Router();
const data = require('../data');
const xss = require('xss');

router.get('/',async(req,res)=>{
    if(!xss(req.session.user)){
        res.render('login',{title:"Log in", haserror:false, haserror2:false, hidelogin:true,hidereg:false});
    } else{
        res.render('postNFT',{title:"create NFT"});
    }
});

module.exports=router;