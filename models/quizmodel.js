const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const Quiz = new Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
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
        total_slots: { type: Number },
        quiz_name: { type: String },
        rules: { type: Array },
        entryFees: { type: Number }
    });

const quiz = mongoose.model('Quiz', Quiz);

module.exports = quiz;