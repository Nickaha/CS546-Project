const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const bids = data.bids;
const comments = data.comments;
const listings = data.listings;
const users = data.users;


//seeding file in order to have intial data to work with in testing
async function main(){
    const db = await dbConnection();

    await db.dropDatabase();

    const jimbo = await users.createUser('Jimbo', 'Smith', 'jimbosmith', 'jimbo@smith.com', 'United States', 35, 'password1', '1234567890001234');
    const jimnboid = jimbo._id;
    //https://en.wikipedia.org/wiki/Image where the image is from
    const listing1 = await listings.createListing('05/02/2021', '05/12/2021', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
    'Man with phone older than himself');

    const sally = await users.createUser('Sally', 'Lee', 'sallylee', 'sally@lee.com', 'Canada', 29, 'superpassword!', '0000111122223333');
    const sallyid = sally._id;
    await bids.createBid(sallylee, 50, listing1._id);
    const sallyname = sally.firstName + sally.lastName;
    await comments.createComment(sallyname, 'This make me feel young, I think this phone is even older than me!');
    
    console.log('Done seeding database');
    await db.serverConfig.close();
}


main().catch((error) => {
    console.error(error);
    return dbConnection().then((db) => {
      return db.serverConfig.close();
    });
  });