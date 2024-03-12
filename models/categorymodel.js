const mongoose = require('mongoose');
const Schema = mongoose.Schema;



// Define Category schema
const categorySchema = new Schema({
  category_name: {
    type: String
  }
 
});

// Create and export Category model
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
