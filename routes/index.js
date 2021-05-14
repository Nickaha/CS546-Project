const userRoute = require('./users');
const listingRoute = require('./listings');
const bidRoute = require('./bids');
const commentRoute = require('./comments');
const nftroute = require('./nft');
const path = require('path');
const xss = require('xss');

const constructorMethod = (app) => {
  app.use('/user', userRoute);
  app.use('/listing',listingRoute);
  app.use('/bids',bidRoute);
  app.use('/comment',commentRoute);
  app.use('/NFT', nftroute);

  app.get('/aboutus', (req,res) =>{
    res.render('aboutus',{title:'About Us'});
  });
  app.use('*', (req, res) => {
    res.redirect('/user');
  });
};

module.exports = constructorMethod;