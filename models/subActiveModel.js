const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ActiveQuizSchema = new Schema(
    {
        quiz_name: { type: String },
        category_id: {
            type: Schema.Types.ObjectId,
            ref: 'categories'
        },
        sub_cat_id: {
            type: Schema.Types.ObjectId,
            ref: 'subcategories'
        },
        Active_Quiz_Id: {
            type: Schema.Types.ObjectId,
            ref: 'quizzes'
        },
        subject_id: {
            type: Array,
            items: {
                type: Schema.Types.ObjectId,
                ref: 'subjects'
            }
        },
        question_composition: {
            type: Map,
            of: Number,
            ref: 'subjects',
            // Reference to the 'subjects' collection
        },
        totalQuestions: { type: Number },
        timePerQuestion: { type: Number },
        scheduleDateTime: { type: Date },
        createdDate: { type: Date },
        image: { type: String },
        quiz_repeat: { type: String },
        total_slots: { type: Number },
        rules: { type: Array },
        entryFees: { type: Number }

    }

)

const SubActiveQuiz = mongoose.model('SubActiveQuiz', ActiveQuizSchema);

module.exports = { SubActiveQuiz };
