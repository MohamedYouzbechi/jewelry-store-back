const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
require('dotenv').config();


let schemaUser = mongoose.Schema({
    id:String,
    username:String,
    email:String,
    password:String,
    fname:String,
    lname:String,
    age:String,
    role:String,
    photoUrl:String,
    type:String,
})

let User = mongoose.model('user', schemaUser);
var url = process.env.URL;

/* SIGNUP. */
exports.register=(email, username, password, fname, lname, typeOfUser, photoUrl)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
                return User.findOne({$or:[{email: email}, {username: username}]});
        }).then((user)=>{
            if(user){
                mongoose.disconnect()
                reject('Email / Username already exists, choose another one.')
            }else{
                bcrypt.hash(password, 10).then((hPassword)=>{
                    let user = new User({
                        username: username,
                        password: hPassword,
                        email: email,
                        role: 2,
                        lname: lname,
                        fname: fname,
                        type: typeOfUser || 'local',
                        photoUrl: photoUrl
                    })
                    user.save().then((user)=>{
                        mongoose.disconnect()
                        resolve(user)
                    }).catch((err)=>{
                        mongoose.disconnect()
                        reject(err)
                    })
                }).catch((err)=>{mongoose.disconnect(); reject(err)})
            }    
        }).catch((err)=>{reject(err)})
    })
}

/* LOGIN */
exports.login = (email, password)=>{
    return new Promise((resolve, reject)=>{
        mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
            return User.findOne({$or:[{email: email}, {username: email}]});
        }).then((user)=>{
            if(user){
                bcrypt.compare(password, user.password).then((match)=>{
                    if(match){
                        mongoose.disconnect()
                        resolve(user)
                    }else{
                        mongoose.disconnect()
                        reject('Username or password incorrect')
                    }
                }).catch((err)=>{reject(err)})
            }else{
                mongoose.disconnect()
                reject("Username or password incorrect")
            }
        }).catch((err)=>{reject(err)})
    })
}

/* GET ALL USERS. */
exports.getAllUsers = () => {
    return new Promise((resolve, reject)=>{
        mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
          return User.aggregate([
              {
                $project: {
                    username: 1,
                    email: 1,
                    fname: 1,
                    lname: 1,
                    age: 1,
                    role: 1,
                    id: 1
                }
              }
            ]);
        }).then((docs)=>{
          mongoose.disconnect();
          if (docs.length > 0) {
            resolve({users: docs})
        } else {
            resolve({message: 'NO USER FOUND'})
        }
        }).catch((err)=>{mongoose.disconnect(); reject(err)})
      })
};

/* GET USER BY ID. */
exports.getUserById = (userId) => {
    return new Promise((resolve, reject)=>{
        mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
            return User.aggregate([
                { $match: {id: userId}},
                {
                    $project: {
                        username: 1,
                        email: 1,
                        fname: 1,
                        lname: 1,
                        age: 1,
                        role: 1,
                        id: 1
                    }
                }
            ]);
        }).then((user)=>{
            mongoose.disconnect();
            if (user) {
                resolve({user});
            } else {
                resolve({message: `NO USER FOUND WITH ID : ${userId}`});
            }
        }).catch((err)=>{mongoose.disconnect(); reject(err)})
    })
};

/* GET ONE USER WITH EMAIL MATCH  */
exports.getUserByEmail = (email) => {
    return new Promise((resolve, reject)=>{
        mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
            return User.findOne({email: email})
        }).then((user)=>{
            mongoose.disconnect();
            if (user) {
                resolve({user: user, status: true});
            } else {
                resolve({status: false, user: null});
            }
        }).catch((err)=>{mongoose.disconnect(); reject(err)})
    })
	
};

/* EDIT USER DATA */
exports.editUserById = function(userId, user){
    return new Promise((resolve, reject)=>{
      mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
        return User.findOne({id:userId})
    }).then(async (userDB)=>{
        if(userDB){
            let email = user.email !== undefined ? user.email : userDB.email;
            let username = user.username !== undefined ? user.username : userDB.username;
            let password = user.password !== undefined ? await bcrypt.hash(user.password, 10) : userDB.password;
            let fname = user.fname !== undefined ? user.fname : userDB.fname;
            let lname = user.lname !== undefined ? user.lname : userDB.lname;
            let age = user.age !== undefined ? user.age : userDB.age;

            return User.updateOne({id:userId}, {email: email, username: username, password: password, fname: fname, lname: lname, age: age});
        }else{
            reject("USER NOT FOUND")
        }

    }).then((doc)=>{
        mongoose.disconnect();
        resolve('User updated successfully');
    }).catch((err)=>{
        mongoose.disconnect();
        reject(err)});
    });
};