const express = require('express');
const { route } = require('../../lab10/routes/login');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const bcrypt = require('bcryptjs');

router.get('/', async (req,res)=>{
    if(!req.session.user){
        res.render('login',{title:"Log in"});
    } else{
        res.render('homepage',{title:"Home Page"});
    }
});

router.post('/login', async (req,res) =>{
    let logindata = req.body;
    let errors = [];
    if(!logindata.username) errors.push('Username needs to provide');
    if(!logindata.password) errors.push('password needs to provide');
    let validuser = false;
    let user = {};
    const userlist = await userData.getAll();
    for (x of userlist){
        const hashpw = await bcrypt.compare(logindata.password, x.password);
        if(hashpw && x.username===logindata.username){
            validuser= true;
            user = x;
        }
    }
    if(!validuser){
        errors.push('Username or password not correct');
    }
    if(errors.length>0){
        res.status(401).render('login',{errors:errors, hasserror:true, title:'Log in'});
        return;
    }
    try{
        req.session.user = user;
        res.redirect('/');
    } catch(e){
        console.log(e);
        res.status(500).json({error:e});
    }
});

router.post('/register', async (req,res)=>{
    
});
