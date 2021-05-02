const userRoute = require('./users');
const listingRoute = require('./listings');
const commentRoute = require('./comments');
const bidRoute = require('./bids');

const constructorMethod = (app) => {
  app.use('/user', userRoute);
  app.use('/listing',listingRoute);
  app.use('/comment', commentRoute);
  app.use('/bid',bidRoute);

  app.use('*', (req, res) => {
    res.redirect('/user');
  });
};

module.exports = constructorMethod;