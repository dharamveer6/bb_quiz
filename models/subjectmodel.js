const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define SubCategory schema
const SubjectSchema = new Schema({
  sub_name: {
    type: String
  },
  cat_id: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
},

sub_cat_id: [{
    type: Schema.Types.ObjectId,
    ref: 'SubCategory'
  }]


});

// Create and export SubCategory model
const Subject = mongoose.model('Subject', SubjectSchema);

module.exports = Subject;
