const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const Result_Active_quizs = new Schema({
    SubActive_id: {
        type: Schema.Types.ObjectId,
        ref: 'ActiveQuiz'
    },
    participant_id: {
        type: Schema.Types.ObjectId,
        ref: 'Participants'
    },
   
    questions: {
        type: Array,
        items: {
            type: Schema.Types.ObjectId,
            ref: 'Question'
        },
        default:[]
    },
    cor_ans:{ type: Array , default:[]},
    stu_ans:{ type: Array , default:[]},
    start_time: { type: Number,default:0 },
    end_time: { type: Number,default:0 },
    submit_time_period: { type: Number ,default:0},
    reward: { type: Number,default:0 },
    obtain_persentage: { type: Number,default:0 },
    marks: { type: Number,default:0 },
    is_attempted: { type: Number,default:0 },
    
    
});

const Result_Active_quiz = mongoose.model('Result_Active_quiz', Result_Active_quizs);

module.exports = Result_Active_quiz;