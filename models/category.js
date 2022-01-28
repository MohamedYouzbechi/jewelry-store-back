const mongoose = require('mongoose');



const schemaCategory = mongoose.Schema({
  id: String,
  title: String,
});

const Category = mongoose.model('Category', schemaCategory, 'categories');
exports.Category = Category;



exports.getAllCategories = ()=>{
  return new Promise((resolve, reject)=>{
    Category.find({},{_id:0,__v:0}).sort({id: 1}).collation({ locale: "en_US", numericOrdering: true }).then((cats)=>{
        if (cats) {
          if (cats.length > 0) {
            resolve(cats)
          } else {
            reject({message: "No categories found"});
          }
        } else {
          reject({message: "No categories found"});
        }
    }).catch((err)=>{
        reject({err:err, msg: 'error from find catch'})
    })
  })
}


exports.deleteCategoryById = (catId)=>{
  return new Promise((resolve, reject)=>{
    Category.deleteOne({id: catId}).then((res)=>{
      if (res.deletedCount == 1) {
        resolve({
          message: `Record deleted with category id ${catId}`,
          status: 'success'
        });
      } else {
        reject({status: 'failure', message: 'Cannot delete the category'});
      }
      
    }).catch((err)=>{
      reject(err);
    });
  });
};


exports.editCategoryById = (catId, cat)=>{
  return new Promise((resolve, reject)=>{
      Category.updateOne({id: catId}, {title: cat.title}).then((res)=>{
        if (res.modifiedCount == 1) {
          resolve({
            message: `Record updated with category id ${catId}`,
            status: 'success'
          });
        } else {
          reject({status: 'failure', message: 'Cannot update the category'});
        }
      }).catch((err)=>{
        reject(err)
      });
  });
};

exports.addCategory = (cat)=>{
  return new Promise(async(resolve, reject)=>{
      let latestCat = await Category.findOne({}, { _id: 0, id: 1 })
                .sort({ id: -1 })
                .collation({ locale: "en_US", numericOrdering: true });
      let maxId = 0;
      if(latestCat){
        maxId = parseInt(latestCat.id);
      }

      let category = new Category({
        title : cat.title,
        id : maxId + 1
      })

      category.save().then((doc)=>{
        resolve({message: 'Registration successful', success: true})
      }).catch((err)=>{
        reject({message: 'New category failed', success: false})
      })
  })
}