const userRoute = require('./users');
const listingRoute = require('./listings');
const bidRoute = require('./bids');
const path = require('path');

const constructorMethod = (app) => {
  app.use('/user', userRoute);
  app.use('/listing',listingRoute);
  app.use('/bids',bidRoute);

  app.get('/aboutus', (req,res) =>{
    res.render('aboutus',{title:'About Us'});
  });
  app.use('*', (req, res) => {
    res.redirect('/user');
  });
};

module.exports = constructorMethod;