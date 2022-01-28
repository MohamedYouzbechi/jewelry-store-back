const router = require('express').Router();
const categoryModel = require('../models/category');
const {verifyTokenAdmin} = require('../helpers/helpers');

/* GET ALL CATEGORIES */
router.get('/categories', (req, res)=>{
    categoryModel.getAllCategories().then((cats)=>{
        // console.log('111')
        res.status(200).json(cats);
    }).catch((err)=>{
        // console.log('222')
        res.status(500).json(err);
    });
});

/* DELETE CATEGORY */
router.delete('/category/:catId', verifyTokenAdmin, (req, res)=>{
    let catId = req.params.catId;

    if (!isNaN(catId)) {
        categoryModel.deleteCategoryById(catId).then((msg)=>{
            res.status(200).json(msg);
        }).catch((err)=>{
            res.status(500).json(err);
        });
    } else {
        res.status(500).json({ message: "ID is not a valid number", status: "failure" });
    }

});

/* EDIT CATEGORY */
router.patch('/category/:catId', verifyTokenAdmin, (req, res)=>{
    let catId = req.params.catId;

    if (!isNaN(catId)) {
        categoryModel.editCategoryById(catId, req.body).then((msg)=>{
            res.status(200).json(msg);
        }).catch((err)=>{
            res.status(500).json(err);
        });
    } else {
        res.status(500).json({ message: "ID is not a valid number", status: "failure" });
    }
   
});


/* ADD CATEGORY */
router.post('/addCategory', verifyTokenAdmin, (req, res)=>{
    let {title} = req.body;
    if (title !== null) {
        categoryModel.addCategory(req.body).then((docs)=>{
            res.status(200).json(docs);
        }).catch((err)=>{
            res.status(400).json({eerr:err});
        });
    } else {
        res.status(400).json({message: 'New category failed', success: false});
    }

});


module.exports = router;