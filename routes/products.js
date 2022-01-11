const router = require('express').Router();
const productModel = require('../models/product');


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
    productModel.addProduct(req.body).then((docs)=>{
        res.status(200).json(docs);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

/* DELETE PRODUCT */
router.delete('/product/:prodId', (req, res)=>{
    productModel.deleteProductById(req.params.prodId).then((docs)=>{
        res.status(200).json(docs);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

/* EDIT PRODUCT */
router.patch('/product/:prodId', (req, res)=>{
    productModel.editProductById(req.params.prodId, req.body).then((docs)=>{
        res.status(200).json(docs);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});


module.exports = router;