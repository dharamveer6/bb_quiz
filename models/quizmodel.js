const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    subjects: [subjectSchema], // Array of subjects
    totalQuestions: { type: Number, required: true },
    timePerQuestion: { type: Number, required: true },
    scheduleDateTime: { type: Date, required: true },
    image: { type: String }, // Assuming image is a URL
    rules: { type: String },
    entryFees: { type: Number, required: true }
});

const quiz = mongoose.model('Quiz', quizSchema);

module.exports = quiz;