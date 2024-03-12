const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define SubCategory schema
const SubCategorySchema = new Schema({
  sub_category_name: {
    type: String
  },
  cat_id: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
}
});

// Create and export SubCategory model
const SubCategory = mongoose.model('SubCategory', SubCategorySchema);

module.exports = SubCategory;
