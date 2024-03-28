const { default: mongoose } = require("mongoose");
const SubActiveQuiz = require("../models/subActiveModel");
const participantModel = require("../models/participantModel");
const Result_Active_quiz = require("../models/result_subactivemodel");
const { increaseTime } = require("../utils/increase_time");
const { trycatch } = require("../utils/tryCatch");
const { CreateError } = require("../utils/create_err");
const Joi = require("joi");
const { moment } = require('../utils/timezone');
const Question = require("../models/questionmodel");
var registor_to_active_quiz = async (req, res, next) => {

  // res.send("data  ")   
  const schema = Joi.object({
    subactivequiz_id: Joi.string().max(250).required(),
    participant_id: Joi.string().required(),


  });

  const { error } = await schema.validateAsync(req.body);

  const { subactivequiz_id, participant_id } = req.body

  const { entryFees, slot_aloted, slots } = await SubActiveQuiz.findOne({ _id: new mongoose.Types.ObjectId(subactivequiz_id) });
  const { wallet } = await participantModel.findOne({ _id: new mongoose.Types.ObjectId(participant_id) });

  if (slot_aloted == slots) {
    throw new CreateError("CustomError", "slots is full");
  }

  if (wallet < entryFees) {
    throw new CreateError("CustomError", "you do not have the sufficent balance");
  }
  else {

    const newbalance = wallet - entryFees
    await participantModel.updateOne(
      { _id: new mongoose.Types.ObjectId(participant_id) },
      { $set: { wallet: newbalance } }
    );
    await SubActiveQuiz.updateOne(
      { _id: new mongoose.Types.ObjectId(subactivequiz_id) },
      { $inc: { slot_aloted: 1 } }
    );
  };


  const result_active_quiz = new Result_Active_quiz({ SubActive_id: subactivequiz_id, participant_id: participant_id });
  await result_active_quiz.save();


  res.send({ status: 1, msg: "user registor succesfully" })










}


var join_Activequiz_by_student = async (req, res, next) => {

  const schema = Joi.object({
    subactivequiz_id: Joi.string().max(250).required(),
    participant_id: Joi.string().required(),


  });

  const { error } = await schema.validateAsync(req.body);

  const { subactivequiz_id, participant_id } = req.body;

  const val1 = await Result_Active_quiz.findOne({ SubActive_id: subactivequiz_id, participant_id: participant_id });
  if (!val1) {
    throw new CreateError

      ("CustomError", "you have not registored in quiz");
  }

  var { sch_time } = await SubActiveQuiz.findOne({ _id: new mongoose.Types.ObjectId(subactivequiz_id) });

  const currentTimestamp = moment().valueOf();

  var increases_time = increaseTime(sch_time, "5 mins");

  if (currentTimestamp >= sch_time && currentTimestamp <= increases_time) {

  }
  else {
    throw new CreateError

      ("CustomError", "you have exced the time period");
  }









  const data = await SubActiveQuiz.findOne({
    _id: new mongoose.Types.ObjectId(subactivequiz_id),
  });

  let count = 0
  var question = [];
  var check = 0
  var remain_question = 0

  var ans = [];

  var stu_ans = []

  console.log(data.question_composition)

  const question_composition2 = Object.fromEntries(data.question_composition.entries());

  console.log(question_composition2)



  for (let i in question_composition2) {

    console.log(i)
    check++;


    const persentage = question_composition2[i];





    console.log(data.total_num_of_quest, "total no of questions");
    var single_tag_quest = Math.floor(persentage / 100 * data.total_num_of_quest);


    remain_question += single_tag_quest


    if (check == count) {
      const data = req.body.total_num_of_quest - remain_question;

      single_tag_quest += data

    }

    console.log(single_tag_quest, "sin")










    var que = await Question.aggregate([
      // Stage 1: Match documents where is_del is 0
      {
        $match: {
          is_del: 0
        }
      },
      // Stage 2: Sample `single_tag_quest` documents from the matched documents
      {
        $sample: {
          size: single_tag_quest
        }
      },
      // Stage 3: Project specific fields
      {
        $project: {
          // Include or exclude as needed
          sub_id: 0, // Include or exclude as needed

          // Include or exclude as needed
        }
      }
    ]);

    console.log(que, "questions")

    const val2 = single_tag_quest - que.length;

    if (val2 > 0) {
      const que2 = await Question.aggregate([
        // Stage 1: Match documents where is_del is 0
        {
          $match: {
            is_del: 1
          }
        },
        // Stage 2: Sample `single_tag_quest` documents from the matched documents
        {
          $sample: {
            size: val2
          }
        },
        // Stage 3: Project specific fields
        {
          $project: {
            // Include or exclude as needed
            sub_id: 0, // Include or exclude as needed
            // Include or exclude as needed
            // Include or exclude as needed
          }
        }
      ]);

      que = [...que, ...que2]
    }


    for (let i of que) {
      question = [...question, i._id];
      ans = [...ans, i.ans];
      stu_ans.push(-1)
    }


    if (question.length !== ans.length) {
      throw new CreateError

        ("CustomError", "question array and answer array is not same")
    }
  }


  const start_time = moment().valueOf()

  console.log(data.total_num_of_quest)
  console.log(data.time_per_question)
  console.log("hey")
  const secondsToAdd = (data.total_num_of_quest * data.time_per_question) + 30; // Change this to the number of seconds you want to add
  const end_time = moment(start_time).add(secondsToAdd, 'seconds').valueOf();


  const result = await Result_Active_quiz.findOneAndUpdate(
    { participant_id: participant_id, SubActive_id: subactivequiz_id },
    { $set: { stu_ans, is_attempted: 1, end_time: end_time, start_time: start_time, cor_ans: ans, questions: question, participant_id: participant_id, SubActive_id: subactivequiz_id, stu_ans, submit_time_period: secondsToAdd } },
    { upsert: true, new: true }
  );

  // If you need to perform additional processing after updating or inserting the document
  // (e.g., checking whether the condition was met), you can do so here

  // Save the document
  await result.save();




  res.send({ status: 1, que, timeperiod: secondsToAdd, stu_ans })










}



var submmit_activequiz = async (req, res, next) => {

  const schema = Joi.object({
    subactive_id: Joi.string().required(),
    participant_id: Joi.string().required(),
    submit_time_period: Joi.number().integer().positive().min(1).required(),
    stu_ans: Joi.array().items(Joi.number().integer().min(-1).max(4)).required(),
  });






  const { error } = await schema.validateAsync(req.body);

  if (error) {
    throw new CreateError

      ("ValidationError", error.details[0].message)
  }
  var { subactive_id, participant_id, stu_ans, submit_time_period } = req.body;

  var { total_num_of_quest: numberofquestion } = await SubActiveQuiz.findOne({ _id: new mongoose.Types.ObjectId(subactive_id) })
  var { end_time, cor_ans } = await Result_Active_quiz.findOne({ SubActive_id: new mongoose.Types.ObjectId(subactive_id), participant_id: new mongoose.Types.ObjectId(participant_id) })

  const cur_time = moment().valueOf(); // Get the current time i

  if (cur_time > end_time) {
    throw new CreateError

      ("CustomError", "you have exceed the submit timeperiod")
  }

  if (stu_ans.length !== numberofquestion) {
    throw new CreateError

      ("CustomError", "incorrect stu_ans array length")
  }






  let marks = 0;


  // ans_arr



  var correct = 0;
  var unattempt = 0;
  var incorrect = 0;

  for (let i in stu_ans) {
    if (stu_ans[i] == cor_ans[i]) {
      marks++;
      correct++;
    } else if (stu_ans[i] == -1) {
      unattempt++;
    } else {
      incorrect++;
    }
  }
  marks *= 4;

  const totalmarks = 4 * numberofquestion;

  const persentage = Math.floor((marks / totalmarks) * 100);




  await Result_Active_quiz.updateOne(
    { SubActive_id: new mongoose.Types.ObjectId(subactive_id), participant_id: new mongoose.Types.ObjectId(participant_id) },
    { $set: { stu_ans, marks, reward: 0, obtain_persentage: persentage, submit_time_period } }
  )





  return res.send({
    status: 1,
    arr: {
      correct,
      incorrect,
      unattempt,
      submit_time_period, is_attemped: 1
    }
  });


}


registor_to_active_quiz = trycatch(registor_to_active_quiz);
join_Activequiz_by_student = trycatch(join_Activequiz_by_student);
submmit_activequiz = trycatch(submmit_activequiz)

module.exports = { registor_to_active_quiz, submmit_activequiz, join_Activequiz_by_student }