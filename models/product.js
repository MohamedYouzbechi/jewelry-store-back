const { string } = require('joi');
const mongoose = require('mongoose');
const {Category} = require('./category');


let schemaProduct = mongoose.Schema({
  id: String,
  title: String,
  image: String,
  images: String,
  description: String,
  price: Number,
  quantity: Number,
  short_desc: String,
  cat_id: String
});

var Product = mongoose.model('Product', schemaProduct);
exports.Product = Product;



exports.getAllProducts = (qPage, qLimit)=>{
  return new Promise((resolve, reject)=>{
      let page = (qPage !== undefined && qPage !== 0) ? qPage : 1;
      const limit = (qLimit !== undefined && qLimit !== 0) ? parseInt(qLimit) : 70;
      let startValue;
      if (page > 0) {
        startValue = (page * limit) - limit;
      } else {
        startValue = 0;
      }

      Product.aggregate([
        {
            $lookup: { 
                from: "categories",
                localField: "cat_id",
                foreignField: "id",
                as: "cat"
            }
        },
        { $unwind: "$cat" },
        {
            $project: {
                category: "$cat.title",
                name: "$title",
                price: 1,
                quantity: 1,
                description: "$short_desc",
                image: 1,
                id: 1,
                _id: 0,
            }
        },
        { $sort: {id:-1} },
        { $skip : startValue },
        { $limit : limit },
      ]).collation({ locale: "en_US", numericOrdering: true }).then((prods)=>{
        resolve(prods)
      }).catch((err)=>{reject(err)});
  })
}

exports.getProductById = (prodId)=>{
  return new Promise((resolve, reject)=>{
    Product.aggregate([
      { $match: {id : prodId} },
      {
          $lookup: { 
              from: "categories",
              localField: "cat_id",
              foreignField: "id",
              as: "cat"
          }
      },
      { $unwind: "$cat" },
      {
          $project: {
              category: "$cat.title",
              cat_id: "$cat.id",
              title: "$title",
              price: 1,
              quantity: 1,
              description: 1,
              short_desc: 1,
              image: 1,
              images: 1,
              id: 1,
              _id: 0,
          }
      }
    ]).then((product)=>{
      if (product.length > 0) {
        resolve(product[0]);
      }else{
        reject({message: `NO PRODUCT FOUND WITH ID : ${prodId}`});
      }
    }).catch((err)=>{
      console.log(err)
      reject({message: 'Error from BE catch'})})
    });
}

exports.getProductsByCat = (cat, qPage, qLimit)=>{
  return new Promise((resolve, reject)=>{
    let page = (qPage !== undefined && qPage !== 0) ? qPage : 1;
      const limit = (qLimit !== undefined && qLimit !== 0) ? parseInt(qLimit) : 12;
      let startValue;
      if (page > 0) {
        startValue = (page * limit) - limit;
      } else {
        startValue = 0;
      }

      let strRegEx =`.*${cat}.*`;  //set regex with variables
      let regEx = new RegExp(strRegEx, 'i'); //create new regex object i:for make case insensative
      Category.aggregate([
        // { $match: {title: { $regex: /michael/i }}},
        { $match: {title: regEx}},
        {
          $lookup: { 
            from: "products",
            localField: "id",
            foreignField: "cat_id",
            as: "p"
          }
        },
        { $unwind: "$p" },
        {
          $project: {
            category: "$title",
            name: "$p.title",
            price: "$p.price",
            quantity: "$p.quantity",
            description: "$p.description",
            image: "$p.image",
            id: "$p.id",
            _id: 0
          }
        },
        { $sort: { id: -1 } },
        { $skip : startValue },
        { $limit : limit },
      ]).collation({ locale: "en_US", numericOrdering: true }).then((prods)=>{
        resolve(prods)
      }).catch((err)=>{reject(err)});
  })
}

exports.addProduct = (prod)=>{
  return new Promise(async(resolve, reject)=>{
    let latestProd = await Product.findOne({}, { _id: 0, id: 1 })
                .sort({ id: -1 })
                .collation({ locale: "en_US", numericOrdering: true });

      let maxId = 0;
      if(latestProd){
        maxId = parseInt(latestProd.id);
      }

      let product = new Product({
        id : maxId + 1,
        title : prod.title,
        image : prod.imgUrl || null,
        images : prod.images || null,
        description : prod.description || null,
        price : prod.price || null,
        quantity : prod.quantity || null,
        short_desc : prod.short_desc || null,
        cat_id : prod.cat_id
      })
      // console.log('before save')
      product.save().then((doc)=>{
        resolve({message: 'Registration successfully', status: 'success'})
      }).catch((err)=>{
        console.log('from catch save', err)
        reject({message: 'New product failed', status: 'failure'})
      })
  })
}

exports.deleteProductById = (prodId)=>{
  return new Promise((resolve, reject)=>{
    Product.deleteOne({id: prodId}).then((res)=>{
      if (res.deletedCount == 1) {
        resolve({
          message: `Record deleted with product id ${prodId}`,
          status: 'success'
        });
      } else {
        reject({status: 'failure', message: 'Cannot delete the product'});
      }
      
    }).catch((err)=>{
      reject(err);
    });
  });
};

exports.editProductById = (prodId, prod)=>{
  return new Promise((resolve, reject)=>{
    Product.updateOne(
      { id: prodId },
      {
        title : prod.title,
        image : prod.imgUrl,
        images : prod.images,
        description : prod.description,
        price : prod.price,
        quantity : prod.quantity,
        short_desc : prod.short_desc,
        cat_id : prod.cat_id
      }
    ).then((res)=>{
        if (res.modifiedCount == 1) {
          resolve({
            message: `Record updated with product id ${prodId}`,
            status: 'success'
          });
        } else {
          reject({status: 'failure', message: 'Cannot update the product'});
        }
    }).catch((err)=>{reject(err)});
  });
};