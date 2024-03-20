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
        question_composition:{
            type: Map,
            of: Number,
            ref: 'Subject' // Reference to the 'subjects' collection
        },
        total_num_of_quest: {
            type: Number
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
        sch_time: {
            type: Number
        },
        rules:{
            type:Array
        },
        banner:
        {
            type:String
        }
       
    }

)

const triviaModel = mongoose.model('triviaquizzes', triviaSchema);

module.exports = triviaModel;
