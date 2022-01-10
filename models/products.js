const mongoose = require('mongoose');
const Category = require('./categories');
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

exports.getProductById = (id)=>{
  return new Promise((resolve, reject)=>{
    mongoose.connect(url,{useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
      return Product.findById(id)
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

exports.addProduct = (title, image, images, description, price, quantity, short_desc, cat_id)=>{
  return new Promise((resolve, reject)=>{
    mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
      let product = new Product({
        title : title,
        image : image,
        images : images,
        description : description,
        price : price,
        quantity : quantity,
        short_desc : short_desc,
        cat_id : cat_id
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


exports.deleteProductById = (id)=>{
  return new Promise((resolve, reject)=>{
    mongoose.connect(url,{useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
      return Product.deleteOne({_id:id});
    }).then((doc)=>{
      mongoose.disconnect();
      resolve(doc);
    }).catch((err)=>{
      mongoose.disconnect();
      reject(err);
    });
  });
};

exports.editProductById = (id, title, image, images, description, price, quantity, short_desc, cat_id)=>{
  return new Promise((resolve, reject)=>{
    mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
      return Student.updateOne({_id:id}, {title: title, image: image, images: images, description: description, price: price, quantity: quantity, short_desc: short_desc, cat_id: cat_id});
    }).then((doc)=>{
      mongoose.disconnect();
      resolve(doc);
    }).catch((err)=>{
      mongoose.disconnect();
      reject(err)});
  });
};