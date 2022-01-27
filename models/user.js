const mongoose = require('mongoose')
const bcrypt = require('bcrypt')


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

/* SIGNUP. */
exports.register=(email, username, password, fname, lname, typeOfUser, photoUrl)=>{
    return new Promise((resolve,reject)=>{
        User.findOne({$or:[{email: email}, {username: username}]}).then((user)=>{
            if(user){
                reject('Email / Username already exists, choose another one.')
            }else{
                bcrypt.hash(password, 10).then(async(hPassword)=>{
                    let latestUser = await User.findOne({}, { _id: 0, id: 1 })
                        .sort({ id: -1 })
                        .collation({ locale: "en_US", numericOrdering: true });
                    let maxId = 0;
                    if(latestUser){
                        maxId = parseInt(latestUser.id);
                    }

                    let user = new User({
                        id: maxId + 1,
                        username: username,
                        password: hPassword,
                        email: email,
                        role: "Customer",
                        lname: lname,
                        fname: fname,
                        type: typeOfUser || 'local',
                        photoUrl: photoUrl
                    })
                    user.save().then((user)=>{
                        resolve(user)
                    }).catch((err)=>{
                        reject(err)
                    })
                }).catch((err)=>{reject(err)})
            }    
        }).catch((err)=>{reject(err)});
    })
}

/* LOGIN */
exports.login = (email, password)=>{
    return new Promise((resolve, reject)=>{
        User.findOne({$or:[{email: email}, {username: email}]}).then((user)=>{
            if(user){
                bcrypt.compare(password, user.password).then((match)=>{
                    if(match){
                        resolve(user)
                    }else{
                        reject('Username or password incorrect1')
                    }
                }).catch((err)=>{reject(err)})
            }else{
                reject("Username or password incorrect2")
            }
        }).catch((err)=>{reject(err)});
    })
}

/* GET ALL USERS. */
exports.getAllUsers = () => {
    return new Promise((resolve, reject)=>{
        User.aggregate([
            {
                $project: {
                    username: 1,
                    email: 1,
                    fname: 1,
                    lname: 1,
                    age: 1,
                    role: 1,
                    type: 1,
                    photoUrl: 1,
                    id: 1,
                    _id: 0
                }
            },
            { $sort: {id:1} }
            ]).collation({ locale: "en_US", numericOrdering: true }).then((usrs)=>{
                if (usrs.length > 0) {
                    resolve({users: usrs})
                } else {
                    resolve({message: 'NO USER FOUND'})
                }
            }).catch((err)=>{reject(err)});
    })
};

/* GET USER BY ID. */
exports.getUserById = (userId) => {
    return new Promise((resolve, reject)=>{
        User.aggregate([
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
        ]).then((user)=>{
            if (user) {
                resolve({user});
            } else {
                resolve({message: `NO USER FOUND WITH ID : ${userId}`});
            }
        }).catch((err)=>{reject(err)});
    })
};

/* GET ONE USER WITH EMAIL MATCH  */
exports.getUserByEmail = (email) => {
    return new Promise((resolve, reject)=>{
        User.findOne({$or:[{email: email}, {username: email}]}).then((user)=>{
            if (user) {
                resolve({user: user, status: true});
            } else {
                resolve({status: false, user: null});
            }
        }).catch((err)=>{reject(err)})
    })
	
};

/* EDIT USER DATA */
exports.editUserById = function(userId, user){
    return new Promise((resolve, reject)=>{
        User.findOne({id:userId}).then(async (userDB)=>{
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
            resolve('User updated successfully');
        }).catch((err)=>{ reject(err)});
    });
};

exports.deleteUserById = (userId)=>{
    return new Promise((resolve, reject)=>{
        User.deleteOne({id: userId}).then((res)=>{
            if (res.deletedCount == 1) {
              resolve({
                message: `Record deleted with user id ${userId}`,
                status: 'success'
              });
            } else {
              reject({status: 'failure', message: 'Cannot delete this user'});
            }
            
        }).catch((err)=>{reject(err)});
    });
};