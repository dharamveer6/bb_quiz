const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const Quiz = new Schema({
    quiz_name: { type: String },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categories' },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'subcategories' },
    subject_id: {
        type: Array,
        items: {
            type: Schema.Types.ObjectId,
            ref: 'subjects'
        },
    },
    question_composition: {
        type: Array,
        items: {
            type: Schema.Types.ObjectId,
            ref: 'subjects'
        }
    },
    totalQuestions: { type: Number },
    timePerQuestion: { type: Number },
    scheduleDateTime: { type: Date },
    createdDate: { type: Date },
    image: { type: String },
    quiz_repeat : { type: String },
    total_slots: { type: Number },
    rules: { type: Array },
    entryFees: { type: Number }
});

const quiz = mongoose.model('Quiz', Quiz);

module.exports = quiz;