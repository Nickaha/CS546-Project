const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const bcrypt = require('bcryptjs');

router.get('/', async (req,res)=>{
    console.log(req.session);
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
    console.log(userlist);
    for (x of userlist){
        console.log(x.password);
        const hashpw = await bcrypt.compare(logindata.password, x.password);
        //console.log(hashpw);
        if(hashpw && x.userName===logindata.username){
            validuser= true;
            //Whole user is stored in session currently - Should we remove hashed passwords from the cookie?
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
        console.log(req.session);
        res.redirect('/');
    } catch(e){
        console.log(e);
        res.status(500).json({error:e});
    }
});

router.post('/register', async (req,res)=>{
    let registedata = req.body;
    let errors = [];
    if(!registedata.firstname) errors.push('firstname is not provided');
    if(!registedata.lastname) errors.push('lastname is not provided');
    if(!registedata.username) errors.push('username is not provided');
    if(!registedata.email) errors.push('email is not provided');
    if(!registedata.age) errors.push('age is not provided');
    if(!registedata.email) errors.push(`email is not provided`);
    if(!registedata.country) errors.push('country is not provided');
    if(!registedata.bank) errors.push('bank information is not provided');
    if(!registedata.password1) errors.push('password is not provided');
    if(!registedata.password2) errors.push('password re-enter is not provided');

    if(registedata.password1!==registedata.password2) errors.push('passwords are not same when re-enter');
    if(errors.length>0){
        res.status(401).render('login',{errors:errors, hasserror:true, title:'Log in',register:true});
        return;
    }
    try{
        const newuser = userData.createUser(registedata.firstname, registedata.lastname, registedata.username, registedata.email, registedata.country, registedata.age, registedata.password1, registedata.bank);
        req.session.user = newuser;
        res.redirect('/');
    } catch(e){
        errors.push(e);
        res.status(401).render('login',{errors:errors, hasserror:true, title:'Log in', register:true});
    }
});

router.post('/changepw',async(req,res)=>{
    let changedata = req.body;
    let errors=[];
    if(!changedata.username) errors.push('username is not provided');
    if(!changedata.password1) errors.push("new password is not provided");
    if(!changedata.password2) errors.push("re-enter new password is not provided");
    if(changedata.password1 === changedata.password2) errors.push("password doesn't match");
    if(errors.length>0){
        res.status(401).render('accountdashboard',{errors:errors, hasserror:true, title:'Dash Board'});
        return;
    }
    try{
        const updateuser = userData.updateUser(req.session.user._id,{password:password1});
        req.session.user = updateuser;
        res.redirect('/');
    } catch(e){
        errors.push(e);
        res.status(401).render('accountdashbaord',{errors:[e], hasserror:true, title:'Dash Board'});
    }
});

router.get('/dashboard',async (req,res)=>{
    if(!req.session.user){
        res.redirect('/');
    } else{
        res.render('accountdashboard',{title:"Dash Board"});
    }
});

router.get('/logout', async(req,res)=>{
    req.session.destroy();
    res.render('logout', {title:'Log out'});
});

module.exports = router;
