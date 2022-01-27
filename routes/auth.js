// const {check, validationResult, body} = require('express-validator');
const router = require('express').Router();
const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const joi =require('joi');
require('dotenv').config();


var secretKey = process.env.SECRET_KEY
const secretKeyCustomer = process.env.SECRET_KEY_CUSTOMER;

const schemaValidation = joi.object({
    email:joi.string().email({minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr'] }}).required(),
    password: joi.string().min(3).max(15).required().label('Password'),
    // password_confirmation: Joi.any().equal(Joi.ref('password'))
    //     .required()
    //     .label('Confirm password')
    //     .options({ messages: { 'any.only': '{{#label}} does not match'} })
})

validateRegister = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    let validation = schemaValidation.validate({email:email, password:password});
    
    if (validation.error) {
        res.status(400).json({msg: validation.error.details[0].message})
    } else{
        next();
    }
};

/* REGISTER ROUTE */
router.post('/register', validateRegister, (req, res) => {
    let email = req.body.email;
    let username = email.split("@")[0];
    let password = req.body.password;
    let fname = req.body.fname || null;
    let lname = req.body.lname || null;
    let typeOfUser = req.body.typeOfUser;
    let photoUrl = req.body.photoUrl === null ? 'https://image.shutterstock.com/image-vector/person-gray-photo-placeholder-man-260nw-1259815156.jpg' : req.body.photoUrl

    userModel.register(email, username, password, fname, lname, typeOfUser, photoUrl).then((user)=>{
        res.status(201).json({message: 'Registration successful'});
    }).catch((err) => 
        res.status(433).json({error: err})
    );
});

hasLoginFields = (req, res, next) => {
    let errors = [];

    if (req.body) {
        if (!req.body.email) {
            errors.push('Missing email field');
        }
        if (!req.body.password && req.body.typeOfUser !== 'social') {
            errors.push('Missing password field');
        }

        if (errors.length) {
            return res.status(400).send({errors: errors.join(',')});
        } else {
            return next();
        }
    } else {
        return res.status(400).send({errors: 'Missing email and password fields'});
    }
}

/* LOGIN ROUTE */
router.post('/login', hasLoginFields, (req, res)=>{
    userModel.login(req.body.email, req.body.password).then((user) => {
        let token = jwt.sign({state: 'true', email: req.body.email}, user.role =='Admin' ? secretKey : secretKeyCustomer, {
            algorithm: 'HS512',
            expiresIn: '2h'
        });
        res.json({
            token: token,
            auth: true,
            email: user.email,
            username: user.username,
            fname: user.fname,
            lname: user.lname,
            photoUrl: user.photoUrl,
            userId: user.userId,
            type: user.type,
            role: user.role
        });
    }).catch((err) =>
        res.status(401).json({message: err, status: false})
    );
});


module.exports = router;
