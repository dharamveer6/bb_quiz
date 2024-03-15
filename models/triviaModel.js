const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const triviaSchema = new Schema(
    {
        category_id: {
            type: Schema.Types.ObjectId,
            ref: 'Category'
        },
        sub_cat_id: {
            type: Schema.Types.ObjectId,
            ref: 'subcategories'
        },
        subjects_id: {
            type: Array,
            items: {
                type: Schema.Types.ObjectId,
                ref: 'subjects'
            }
        },
        question_composition: {
            type: Array,
            ref: 'subjects'
        },
        total_num_of_quest: {
            type: String
        },
        time_per_question: {
            type: Number
        },
        min_reward_per: {
            type: Number
        },
        reward: {
            type: Number
        },
       
    }

)

const triviaModel = mongoose.model('trivia_quizzes', triviaSchema);

module.exports = triviaModel;
