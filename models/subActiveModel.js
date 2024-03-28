const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SubActiveQuizSchema = new Schema(
    {
   
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'categories'
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
        slots: { type: Number },
        entryFees: { type: Number },
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


        sch_time: {
            type: Number
        },
        end_time: {
            type: Number
        },
        slot_aloted: {
            type: Number,default:0
        },
        rules:{
            type:Array
        },
        banner:
        {
            type:String
        },
        quiz_name:
        {
            type:String
        },
        repeat:
        {
            type:String
        },
        Active_Quiz_Id: {
            type: Schema.Types.ObjectId,
            ref: 'ActiveQuizes'
        }
       
    }

)

const SubActiveQuiz = mongoose.model('SubActiveQuiz', SubActiveQuizSchema);

module.exports = SubActiveQuiz;

