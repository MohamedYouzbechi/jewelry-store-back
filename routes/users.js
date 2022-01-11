const router = require('express').Router();
const userModel = require('../models/user');

/* GET All users. */
router.get('/', (req, res) => {
    userModel.getAllUsers().then((docs)=>{
        res.status(200).json(docs);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

/* GET USER BY ID */
router.get('/:userId', (req, res) => {
    let userId = req.params.userId;

    userModel.getUserById(userId).then((doc)=>{
        res.status(200).json(doc);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

/* GET ONE USER WITH EMAIL MATCH  */
router.get('/validate/:email', (req, res) => {
	let email = req.params.email;
	
    userModel.getUserByEmail(email).then((doc)=>{
        res.status(200).json(doc);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

/* EDIT USER DATA */
router.patch('/:userId', async (req, res) => {
    let userId = req.params.userId;

    userModel.editUserById(userId, req.body).then((msg)=>{
        res.status(200).json(msg);
    }).catch((err) => 
        res.status(404).json(err)
    );
});

module.exports = router;