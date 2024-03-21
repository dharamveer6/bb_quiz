const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define StudyMaterial schema
const StudyMaterialSchema = new Schema({
    cat_id: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
    },
    material_type: {
        type: String,
    },
    filename: {
        type: String,
    },
    display_name: {
        type: String,
    }
});

// Create and export StudyMaterial model
const StudyMaterial = mongoose.model('StudyMaterial', StudyMaterialSchema);

module.exports = {StudyMaterial};
