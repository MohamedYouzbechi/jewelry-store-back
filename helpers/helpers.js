const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;
const secretKeyCustomer = process.env.SECRET_KEY_CUSTOMER;

var url = process.env.URL;

/********************************** */

mongoose.connect(url,
{
    useNewUrlParser: true,
    useUnifiedTopology: true
}
);

const db = mongoose.connection;

db.once('open',()=>{
    console.log("Connected to MongoDB successfully!");
})

db.on('error',(err)=>{
    console.log('Error : ', err);
});

/********************************** */

//verify token for admin
exports.verifyTokenAdmin = (req, res, next)=>{
    let token = req.headers.authorization
    let role = req.headers.role
    if (!token || role !='Admin') {
        res.status(400).json({msg:'Acces rejected !!'})
    }else{
        try {
            jwt.verify(token, secretKey)
            next()
        } catch (err) {
            res.status(400).json({msg: err})
        }
    }
}

//verify token for user
exports.verifyTokenCustomerAdmin = (req, res, next)=>{
    let token = req.headers.authorization
    

    if (!token) {
        res.status(400).json({msg:'Acces rejected !!'})
    }else{
        try {
            jwt.verify(token, secretKeyCustomer)
            next()
        } catch (err) {
            let role = req.headers.role
            if (role) {
                if ( role == 'Admin') {
                    try {
                        jwt.verify(token, secretKey)
                        next()
                    } catch (err) {
                        res.status(400).json({msg: err})
                    }
                }
            }
            console.log('from her')
            res.status(400).json({msg: err})
        }
    }
}