const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

async function createUser(firstName, lastName, userName, email, country, age, password, BankInfo){
    if(!firstName) throw "first name needs to provide";
    if(!lastName) throw "last name needs to provide";
    if(!userName) throw "username needs to provide";
    if(!email) throw "email needs to provide";
    if(!country) throw "country needs to provide";
    if(!age) throw "age needs to provide";
    if(!password) throw `password needs to provide`;
    if(!BankInfo) throw "bank information needs to provide";

    if(typeof firstName !== 'string' || firstName.trim().length===0) throw `first name should be string and not all spaces`;
    if(typeof lastName !== 'string' || lastName.trim().length===0) throw `last name should be string and not all spaces`;
    if(typeof userName !== 'string' || userName.trim().length===0) throw `user name should be string and not all spaces`;
    if(typeof email !== 'string' || email.trim().length===0) throw `email should be string and not all spaces`;
    if(typeof country !== 'string' || country.trim().length===0) throw `country should be string and not all spaces`;
    if(typeof password !== 'string' || password.trim().length===0) throw `password should be string and not all spaces`;
    if(typeof BankInfo !== 'string' || BankInfo.trim().length===0) throw `Bank information should be string and not all spaces`;

    if(typeof age !== 'number' || isNaN(age)) throw "age should be number";
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(String(email).toLowerCase())) throw "invalid email type";
    const userListings = [];
    const userBids = [];

    const userCollection = await users();
    let newUser = {
        _id:uuid.v4(),
        firstName:firstName,
        lastName:lastName,
        userName:lastName,
        email:email,
        age:age,
        country:country,
        BankInfo:bcrypt.hash(BankInfo,16),
        userBids:userBids,
        userListings:userListings,
        password: bcrypt.hash(password,16)
    };
    const insertInfo = await userCollection.insertOne(newUser);
    if (insertInfo.insertedCount === 0) throw 'Could not add user';

    const newId = insertInfo.insertedId;
    ////console.log(newId);
    const nu = await this.getUserById(newId.toString());
    nu._id = nu._id.toString();
    return nu;

}

async function getAll(){
    const userCollection = await users();
    const userlist = await userCollection.find({},{projection:{_id:1,password:0, BankInfo:0}}).toArray();
    return userlist;
}

async function getUserById(id){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.trim().length===0) throw `emptry string of id`;
    const userCollection = await users();
    const user = await userCollection.findOne({_id:id});
    if(!user) throw `user not found`;
    return user;
}

async function removeUser(id){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.trim().length===0) throw `emptry string of id`;
    const userCollection = await users();
    const user = userCollection.findOne({_id:id});
    if (user === null) throw 'No user with that id';
    const deleteinfo = await userCollection.deleteOne({_id:id});
    if(deleteinfo.deletedCount===0) throw "could not delete the user";
    return true;
}

async function updateUser(id, updateInfo){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.trim().length===0) throw `emptry string of id`;

    if(!updateInfo || typeof updateInfo !== 'object') throw 'update information needs to be object with content inside';
    const userCollection = await users();
    let userUpdate = {};
    if(updateInfo.firstName){
        if(typeof updateInfo.firstName !== 'string' || updateInfo.firstName.trim().length===0) throw `first name should be string and not all spaces`;
        userUpdate.firstName = updateInfo.firstName;
    }
    if(updateInfo.lastName){
        if(typeof updateInfo.lastName !== 'string' || updateInfo.lastName.trim().length===0) throw `last name should be string and not all spaces`;
        userUpdate.lastName = updateInfo.lastName;
    }
    if(updateInfo.userName){
        if(typeof updateInfo.userName !== 'string' || updateInfo.userName.trim().length===0) throw `username should be string and not all spaces`;
        userUpdate.userName = updateInfo.userName;
    }
    if(updateInfo.email){
        if(typeof updateInfo.email !== 'string' || updateInfo.email.trim().length===0) throw `email should be string and not all spaces`;
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!re.test(String(updateInfo.email).toLowerCase())) throw "invalid email type";
        userUpdate.email = updateInfo.email;
    }
    if(updateInfo.age){
        if(typeof updateInfo.age !== 'number') throw `age should be int`;
        userUpdate.age = updateInfo.age;
    }
    if(updateInfo.country){
        if(typeof updateInfo.country !== 'string' || updateInfo.country.trim().length===0) throw `country should be string and not all spaces`;
        userUpdate.country = updateInfo.country;
    }
    if(updateInfo.BankInfo){
        if(typeof updateInfo.BankInfo !== 'string' || updateInfo.BankInfo.trim().length===0) throw `Bank information should be string and not all spaces`;
        userUpdate.BankInfo = bcyrpt.hash(updateInfo.BankInfo,16);
    }
    if(updateInfo.userBids){
        if(!Array.isArray(updateInfo.userBids)) throw `userBids should be array`;
        updateInfo.userBids.forEach(x => {
            if(typeof x !== 'string' || x.trim().length === 0) throw `Invalid user bid ${x}`;
        });
        userUpdate.userBids = updateInfo.userBids;
    }
    if(updateInfo.userListings){
        if(!Array.isArray(updateInfo.userListings)) throw `Listings should be array`;
        updateInfo.userListings.forEach(x => {
            if(typeof x !== 'string' || x.trim().length === 0) throw `Invalid user listing ${x}`;
        });
        userUpdate.userListings = updateInfo.userListings;
    }
    if(updateInfo.password){
        if(typeof updateInfo.password !== 'string' || updateInfo.password.trim().length===0) throw `password should be string and not all spaces`;
        userUpdate.password = updateInfo.bcrypt.hash(password,16);
    }

    await userCollection.updateOne({_id:id},{$set: userUpdate});
    let result = this.getUserById(id);
    return result;
}

async function removeBid(id){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.trim().length===0) throw `emptry string of id`;

    const userCollection = await users();
    let userId = "";
    const userList = await userCollection.find({},{projection: {_id:1, userBids:1}}).toArray();
    for (u of userList){
        for(bid of u.userBids){
            if(bid === id){
                userId = u._id;
            }
        }
    }
    const updateInfo = await userCollection.updateOne({_id:userId},{$pull:{userBids:id}});
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount){
        throw 'Update failed';
      }
    return true;
}
async function removeListing(id){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.trim().length===0) throw `emptry string of id`;

    const userCollection = await users();
    let userId = "";
    const userList = await userCollection.find({},{projection: {_id:1, userListings:1}}).toArray();
    for (u of userList){
        for(listid of u.userListings){
            if(listid === id){
                userId = u._id;
            }
        }
    }
    const updateInfo = await userCollection.updateOne({_id:userId},{$pull:{userListings:id}});
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount){
        throw 'Update failed';
      }
    return true;
}
module.exports = {
    createUser,
    getUserById,
    getAll,
    removeUser,
    updateUser,
    removeBid,
    removeListing
};