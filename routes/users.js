const router = require('express').Router();
const userModel = require('../models/user');
const {verifyTokenAdmin} = require('../helpers/helpers');
const {verifyTokenCustomerAdmin} = require('../helpers/helpers');



/* GET All users. */
router.get('/users', verifyTokenAdmin, (req, res) => {
    userModel.getAllUsers().then((users)=>{
        res.status(200).json(users);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

/* GET USER BY ID */
router.get('/user/:userId', verifyTokenCustomerAdmin, (req, res) => {
    let userId = req.params.userId;

    userModel.getUserById(userId).then((doc)=>{
        res.status(200).json(doc);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

/* GET ONE USER WITH EMAIL MATCH  */
router.get('/users/validate/:email', (req, res) => {
	let email = req.params.email;
	
    userModel.getUserByEmail(email).then((doc)=>{
        res.status(200).json(doc);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

/* EDIT USER DATA */
router.patch('/user/:userId', verifyTokenCustomerAdmin, async (req, res) => {
    let userId = req.params.userId;

    userModel.editUserById(userId, req.body).then((msg)=>{
        res.status(200).json(msg);
    }).catch((err) => 
        res.status(404).json(err)
    );
});

/* DELETE USER DATA */
router.delete('/user/:userId', verifyTokenAdmin, async (req, res) => {
    let userId = req.params.userId;
    if (!isNaN(userId)) {
        userModel.deleteUserById(userId).then((msg)=>{
            res.status(200).json(msg);
        }).catch((err) => 
            res.status(500).json(err)
        );
    } else {
        res.status(500).json({ message: "ID is not a valid number", status: "failure" });
    }
    
});

module.exports = router;