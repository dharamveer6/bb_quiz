const mongoose = require("mongoose");



const Quiz = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
    subjects: {type : String}, // Array of subjects
    totalQuestions: { type: Number },
    timePerQuestion: { type: Number },
    scheduleDateTime: { type: Date },
    image: { type: String }, // Assuming image is a URL
    rules: { type: String },
    entryFees: { type: Number }
});

const quiz = mongoose.model('Quiz', Quiz);

module.exports = {quiz};