const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const Quiz = new Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'subcategories' },
    subjects: {
        type: Array,
        items: {
            type: Schema.Types.ObjectId,
            ref: 'subjects'
        }
    },
    totalQuestions: { type: Number },
    timePerQuestion: { type: Number },
    scheduleDateTime: { type: Date },
    image: { type: String }, 
    rules: { type: String },
    entryFees: { type: Number }
});

const quiz = mongoose.model('Quiz', Quiz);

module.exports = quiz;