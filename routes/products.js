const router = require('express').Router();
const productModel = require('../models/products');
require('dotenv').config();


/* GET ALL PRODUCTS */
router.get('/products', (req, res)=>{
    productModel.getAllProducts().then((docs)=>{
        res.status(200).json(docs);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

/* GET ONE PRODUCT*/
router.get('/product/:prodId', (req, res)=>{
    productModel.getProductById(req.params.prodId).then((docs)=>{
        res.status(200).json(docs);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

/* GET ALL PRODUCTS FROM ONE CATEGORY */
router.get('/products/category/:catName', (req, res)=>{
    productModel.getProductsByCat(req.params.catName).then((docs)=>{
        res.status(200).json(docs);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

/* ADD PRODUCT */
router.post('/addProduct', (req, res)=>{
    productModel.addProduct().then((docs)=>{
        res.status(200).json(docs);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

/* DELETE PRODUCT */
router.delete('/product/:prodId', (req, res)=>{
    productModel.deleteProductById().then((docs)=>{
        res.status(200).json(docs);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

/* EDIT PRODUCT */
router.patch('/product/:prodId', (req, res)=>{
    productModel.editProductById().then((docs)=>{
        res.status(200).json(docs);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});



module.exports = router;