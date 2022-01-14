const mongoose = require('mongoose');

const schemaCategory = mongoose.Schema({
  title: String,
});

const Category = mongoose.model('Category', schemaCategory);

module.exports = Category;