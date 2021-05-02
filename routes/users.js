const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;

router.get('/', async (req,res)=>{
    if(!req.session.user){
        res.render('login',{title:"Log in"});
    } else{
        res.render('homepage',{title:"DashBoard"});
    }
});
