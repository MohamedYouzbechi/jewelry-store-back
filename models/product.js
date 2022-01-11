const mongoose = require('mongoose');
const Category = require('./category');
require('dotenv').config();

let schemaProduct = mongoose.Schema({
  title: String,
  image: String,
  images: String,
  description: String,
  price: Number,
  quantity: Number,
  short_desc: String,
  cat_id: Number
});

var Product = mongoose.model('Product', schemaProduct);
var url = process.env.URL;

exports.getAllProducts = ()=>{
  return new Promise((resolve, reject)=>{
    mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
      return Product.find()
    }).then((docs)=>{
      mongoose.disconnect();
      resolve(docs)
    }).catch((err)=>{mongoose.disconnect(); reject(err)})
  })
}

exports.getProductById = (prodId)=>{
  return new Promise((resolve, reject)=>{
    mongoose.connect(url,{useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
      return Product.findById(prodId)
    }).then((doc)=>{
      mongoose.disconnect();
      resolve(doc)
    }).catch((err)=>{
      mongoose.disconnect();
      reject(err)})
  })
}

exports.getProductsByCat = (cat)=>{
  return new Promise((resolve, reject)=>{
    mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{

      let strRegEx =`.*${cat}.*`;  //set regex with variables
      let regEx = new RegExp(strRegEx, 'g'); //create new regex object
      return Category.aggregate([
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
            id: "$p.id"
          }
        },
        { $sort: { id: -1 } },
        { $limit: 5 }
      ]);

    }).then((doc)=>{
      mongoose.disconnect();
      resolve(doc)
    }).catch((err)=>{
      mongoose.disconnect();
      reject(err)})
  })
}

exports.addProduct = (prod)=>{
  return new Promise((resolve, reject)=>{
    mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
      let product = new Product({
        title : prod.title,
        image : prod.image,
        images : prod.images,
        description : prod.description,
        price : prod.price,
        quantity : prod.quantity,
        short_desc : prod.short_desc,
        cat_id : prod.cat_id
      })
      product.save().then((doc)=>{
        mongoose.disconnect();
        resolve(doc)
      }).catch((err)=>{
        mongoose.disconnect();
        reject(err)
      })
    }).catch((err)=>{
      reject(err)
    });
  })
}

exports.deleteProductById = (prodId)=>{
  return new Promise((resolve, reject)=>{
    mongoose.connect(url,{useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
      return Product.deleteOne({id: prodId});
    }).then((doc)=>{
      mongoose.disconnect();
      resolve(doc);
    }).catch((err)=>{
      mongoose.disconnect();
      reject(err);
    });
  });
};

exports.editProductById = (prodId, prod)=>{
  return new Promise((resolve, reject)=>{
    mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
      return Student.updateOne({_id: prodId}, {title: prod.title, image: prod.image, images: prod.images, description: prod.description, price: prod.price, quantity: prod.quantity, short_desc: prod.short_desc, cat_id: prod.cat_id});
    }).then((doc)=>{
      mongoose.disconnect();
      resolve(doc);
    }).catch((err)=>{
      mongoose.disconnect();
      reject(err)});
  });
};