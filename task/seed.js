const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const bids = data.bids;
const comments = data.comments;
const listings = data.listings;
const users = data.users;


//seeding file in order to have intial data to work with in testing
async function main(){
    const db = await dbConnection();

    // await db.dropDatabase();
    const bid1 = await bids.createBid('weeboy',80,"6dd3e9ae-5b79-4f2d-88a3-c81dfacd7158","5f7c0484-a3f5-413a-9eb7-728491101970");
    //const bid2 = await bids.createBid('weeboy',30,"6dd3e9ae-5b79-4f2d-88a3-c81dfacd7158","5f7c0484-a3f5-413a-9eb7-728491101970");
    // const jimbo = await users.createUser('Jimbo', 'Smith', 'jimbosmith', 'jimbo@smith.com', 'United States', 35, 'password1', '1234567890001234');
    // const jimnboid = jimbo._id;
    // //https://en.wikipedia.org/wiki/Image where the image is from
    // const listing1 = await listings.createListing('05/02/2021', '05/12/2021', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
    // 'Man with phone older than himself');
    // //console.log(listing1)
    // const sally = await users.createUser('Sally', 'Lee', 'sallylee', 'sally@lee.com', 'Canada', 29, 'superpassword!', '0000111122223333');
    
    // const sallyid = sally._id;
    // const newbid = await bids.createBid("jimbosmith", 50, listing1._id, sallyid);
    // sally.userBids.push(newbid._id);
    // const res = await users.updateUser(sallyid,{userBids:sally.userBids});
    // //console.log(res);
    // const sallyname = sally.firstName + sally.lastName;
    // const newcomment = await comments.createComment(sallyname, 'This make me feel young, I think this phone is even older than me!',listing1._id);
    // // listing1.comments.push(newcomment);
    // // const res2 = await listings.updateListing(listing1._id,{comments:listing1.comments});
    // sally.userListings.push(listing1._id);
    // const res3 = await users.updateUser(sallyid,{userListings:sally.userListings});
    console.log('Done seeding database');
    await db.serverConfig.close();
}


main().catch((error) => {
    console.error(error);
    return dbConnection().then((db) => {
      return db.serverConfig.close();
    });
  });