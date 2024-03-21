const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    question: { type: String},
    sub_id: { type: Schema.Types.ObjectId, ref: 'Subject'},
    is_ques_img: { type: Number },
    is_opt_img: { type: Number },
    option1: { type: String },
    option2: { type: String  },
    option3: { type: String },
    option4: { type: String },
    question_url: { type: String},
    ans: { type:Number },
    is_del: { type:Number,default:0 },
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;