const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const bcrypt = require('bcryptjs');
const listingData = data.listings;
router.get('/', async (req,res)=>{
    //console.log(req.session);
    if(!req.session.user){
        res.render('login',{title:"Log in", haserror:false, haserror2:false,hidelogin:true,hidereg:false});
    } else{
        try{

            const listinglist = await listingData.getAll();
            
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
            res.render('homepage',{title:"Home Page",NFT:renderData});
        } catch(e){
            res.status(401).render('homepage',{error:e, haserror:true});
        }
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
    //console.log(userlist);
    for (x of userlist){
        //console.log(x.password);
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
        res.status(401).render('login',{errors:errors, haserror:true, title:'Log in', haserror2:false,hidelogin:true,hidereg:false});
        return;
    }
    try{
        req.session.user = user;
        //console.log(req.session);
        res.redirect('/');
    } catch(e){
        console.log(e);
        res.status(500).json({error:e});
    }
});

router.post('/register', async (req,res)=>{
    let registedata = req.body;
    let errors = [];
    if(!registedata.first) errors.push('firstname is not provided');
    if(!registedata.last) errors.push('lastname is not provided');
    if(!registedata.username) errors.push('username is not provided');
    if(!registedata.email) errors.push('email is not provided');
    if(!registedata.age) errors.push('age is not provided');
    if(!registedata.email) errors.push(`email is not provided`);
    if(!registedata.country) errors.push('country is not provided');
    if(!registedata.bank) errors.push('bank information is not provided');
    if(!registedata.password1) errors.push('password is not provided');
    if(!registedata.password2) errors.push('password re-enter is not provided');
    if(registedata.password1!==registedata.password2) errors.push('passwords are not same when re-enter');
    if(parseInt(registedata.age) < 18) errors.push('age must be >= 18');
    if(errors.length>0){
        res.status(401).render('login',{errors:errors, haserror:false, title:'Log in', haserror2:true,hidelogin:false,hidereg:true});
        return;
    }
    try{
        const newuser = await userData.createUser(registedata.first, registedata.last, registedata.username, registedata.email, registedata.country, parseInt(registedata.age), registedata.password1, registedata.bank);
        req.session.user = newuser;
        res.redirect('/user/register');
    } catch(e){
        errors.push(e);
        res.status(401).render('login',{errors:errors, haserror:false, title:'Log in', haserror2:true,hidelogin:false,hidereg:true});
    }
});

router.post('/changepw',async(req,res)=>{
    let changedata = req.body;
    let errors=[];
    //console.log(req.session.user);
    if(!changedata.username) errors.push('username is not provided');
    if(!changedata.password1) errors.push("new password is not provided");
    if(!changedata.password2) errors.push("re-enter new password is not provided");
    if(changedata.password1 !== changedata.password2) errors.push("password doesn't match");
    if(changedata.username !== req.session.user.userName) errors.push("Username not matching current user");
    const changehw = await bcrypt.compare(changedata.password1,req.session.user.password);
    if(changehw) errors.push('Enter a different password from the current password');
    if(errors.length>0){
        res.status(401).render('changepassword',{errors:errors, haserror:true, title:'Change Password'});
        return;
    }
    try{
        const updateuser = await userData.updateUser(req.session.user._id,{password:changedata.password1});
        req.session.user = updateuser;
        //console.log(updateuser);
        res.redirect('/');
    } catch(e){
        errors.push(e);
        res.status(401).render('changepassword',{errors:[e], haserror:true, title:'Change Password'});
    }
});
router.get('/changepw',async (req,res)=>{
    if(!req.session.user){
        res.render('login',{title:"Log in", haserror:false, haserror2:false, hidelogin:true,hidereg:false});
    } else{
        res.render('changepassword',{title:"Change Password"});
    }
});
router.get('/register', async(req,res)=>{
    //console.log(req.session);
    if(!req.session.user){
        res.render('login',{title:"Log in", haserror:false, haserror2:false, hidelogin:false,hidereg:true});
    } else{
        res.render('homepage',{title:"Home Page"});
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
