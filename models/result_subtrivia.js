const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const Result_Subtrivias = new Schema({
    subtrivia_id: {
        type: Schema.Types.ObjectId,
        ref: 'SubTriviaQuiz'
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
    },
    cor_ans:{ type: Array },
    stu_ans:{ type: Array },
    start_time: { type: Number },
    end_time: { type: Number },
    submit_time_period: { type: Number },
    reward: { type: Number },
    obtain_persentage: { type: Number },
    marks: { type: Number },
    is_attempted: { type: Number,default:0 },
    
    
});

const Result_Subtrivia = mongoose.model('Result_Subtrivia', Result_Subtrivias);

module.exports = Result_Subtrivia;