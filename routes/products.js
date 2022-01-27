const router = require('express').Router();
const productModel = require('../models/product');
//import multer module
const multer = require('multer');
const {verifyTokenAdmin} = require('../helpers/helpers');


//multer configuration
//type media à accepter
const MIME_TYPE = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
}

const storageConfig = multer.diskStorage({
    //il va sauvegarder l'image dans cette destination après la modif de son nom
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE[file.mimetype];
        let error = new Error("Mime type is invalid");
        if (isValid) {
        error = null;
        }
        cb(null, 'images')
    },
    // c'est pour la modif de nom de l'image
    filename: (req, file, cb) => { //cb : call back
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const extension = MIME_TYPE[file.mimetype];
        const imgName = name + '-' + Date.now() + '.' + extension;
        cb(null, imgName);
    }
});


/* GET ALL PRODUCTS */
router.get('/products', (req, res)=>{
    productModel.getAllProducts(req.query.page, req.query.limit).then((prods)=>{
        res.status(200).json({
            count: prods.length,
            products: prods
        });
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

/* GET ONE PRODUCT*/
router.get('/product/:prodId', (req, res)=>{
    let prodId = req.params.prodId;

    if (!isNaN(prodId)) {
        productModel.getProductById(prodId).then((product)=>{
            res.status(200).json(product);
        }).catch((err)=>{
            res.status(400).json(err);
        });
    } else {
        res.status(500).json({ message: "ID is not a valid number"});
    }
    
});

/* GET ALL PRODUCTS FROM ONE CATEGORY */
router.get('/products/category/:catName', (req, res)=>{
    productModel.getProductsByCat(req.params.catName, req.query.page, req.query.limit).then((prods)=>{
        res.status(200).json({
            count: prods.length,
            products: prods
        });
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

/* ADD PRODUCT */
router.post('/addProduct', verifyTokenAdmin, multer({ storage: storageConfig }).single('image'), (req, res)=>{
    let product = req.body;
    if (product) {
        let url = req.protocol + '://' + req.get('host'); //construire URL (http/https + Nom Domaine): http://localhost:3000
        let imgUrl = url + '/images/' + req.file.filename;
        product.imgUrl = imgUrl;
        // console.log(product.imgUrl)
        productModel.addProduct(product).then((docs)=>{
            res.status(200).json(docs);
        }).catch((err)=>{
            res.status(400).json(err);
        });
    } else {
        res.status(400).json({message: 'New product failed', status: 'failure'});
    }


});

/* DELETE PRODUCT */
router.delete('/product/:prodId', verifyTokenAdmin, (req, res)=>{
    let prodId = req.params.prodId;

    if (!isNaN(prodId)) {
        productModel.deleteProductById(prodId).then((msg)=>{
            res.status(200).json(msg);
        }).catch((err)=>{
            res.status(500).json(err);
        });
    } else {
        res.status(500).json({ message: "ID is not a valid number", status: "failure" });
    }

});

/* EDIT PRODUCT */
router.patch('/product/:prodId', verifyTokenAdmin, multer({ storage: storageConfig }).single('image'), (req, res)=>{
    let prodId = req.params.prodId;
    let product = req.body;
    if (!isNaN(prodId)) {
        if (req.file) {
            let url = req.protocol + '://' + req.get('host');
            let imgUrl = url + '/images/' + req.file.filename;
            product.imgUrl = imgUrl
        }
        productModel.editProductById(prodId, product).then((msg)=>{
            res.status(200).json(msg);
        }).catch((err)=>{
            res.status(400).json(err);
        });
    } else {
        res.status(500).json({ message: "ID is not a valid number", status: "failure" });
    }
   
});


module.exports = router;