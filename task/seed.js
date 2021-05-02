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

    const jimbo = await users.createUser('Jimbo', 'Smith', 'jimbosmith', 'jimbo@smith.com', 'United States', '35', 'password1', '1234567890001234');
    const jimnboid = jimbo._id;

    const listing1 = await listings.createListing('05/02/2021', '05/12/2021', 'data:image/jpeg;base64,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',
    'Man with phone older than himself');

    const sally = await users.createUser('Sally', 'Lee', 'sallylee', 'sally@lee.com', 'Canada', '29', 'superpassword!', '0000111122223333');
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