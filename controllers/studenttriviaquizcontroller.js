const Joi = require('joi');
const { trycatch } = require('../utils/tryCatch');

const { connectToRabbitMQ } = require('../rabbit_config');
const Question = require('../models/questionmodel');
const { mongoose } = require('mongoose');
const Subject = require('../models/subjectmodel');
const TriviaQuiz = require('../models/triviaModel');
const SubTriviaQuiz = require('../models/subtriviamodel');
const { CreateError } = require('../utils/create_err');
const { moment } = require("../utils/timezone.js");
const Result_Subtrivia = require('../models/result_subtrivia.js');



var join_quiz_by_student = async (req, res, next) => {
  const schema = Joi.object({
    subtrivia_id: Joi.string().max(250).required(),
    participant_id: Joi.string().required(),


  });

  const { error } = await schema.validateAsync(req.body);

  const { subtrivia_id, participant_id } = req.body;

  const data = await SubTriviaQuiz.findOne({
    _id: new mongoose.Types.ObjectId(subtrivia_id),
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


  }



  console.log(data.total_num_of_quest)
  console.log(data.time_per_question)
  console.log("hey")
  const secondsToAdd = (data.total_num_of_quest * data.time_per_question) + 30; // Change this to the number of seconds you want to add
  const end_time = moment(start_time).add(secondsToAdd, 'seconds').valueOf();






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
        is_del: 0,// Include or exclude as needed
        ans: 0,// Include or exclude as needed
      }
    }
  ]);

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
          is_del: 0,// Include or exclude as needed
          ans: 0,// Include or exclude as needed
        }
      }
    ]);

    que = [...que, ...que2]
  }


  for (let i of que) {
    question = [...question, i._id];
    ans = [...ans, i.ans];
  }


  if (question.length !== ans.length) {
    throw new CreateError("CustomError", "question array and answer array is not same")
  }
}


const start_time = moment().valueOf()


const secondsToAdd = (data.total_num_of_quest * data.time_per_question) + 30; // Change this to the number of seconds you want to add
const end_time = moment(start_time).add(secondsToAdd, 'seconds').valueOf();


const result = await Result_Subtrivia.findOneAndUpdate(
  { participant_id: participant_id, subtrivia_id: subtrivia_id },
  { $set: { stu_ans, is_attempted: 1, end_time: end_time, start_time: start_time, cor_ans: ans, questions: question, participant_id: participant_id, subtrivia_id: subtrivia_id, stu_ans, submit_time_period: secondsToAdd } },
  { upsert: true, new: true }
);

// If you need to perform additional processing after updating or inserting the document
// (e.g., checking whether the condition was met), you can do so here

// Save the document
await result.save();




res.send({ status: 1, que, timeperiod: secondsToAdd, stu_ans })







var submmit_triviaquiz = async (req, res, next) => {

  const schema = Joi.object({
    subtrivia_id: Joi.string().required(),
    participant_id: Joi.string().required(),
    submit_time_period: Joi.number().integer().positive().min(1).required(),
    stu_ans: Joi.array().items(Joi.number().integer().min(-1).max(4)).required(),
  });






  const { error } = await schema.validateAsync(req.body);

  if (error) {
    throw new CreateError("ValidationError", error.details[0].message)
  }
  var { subtrivia_id, participant_id, stu_ans, submit_time_period } = req.body;

  var { total_num_of_quest: numberofquestion, min_reward_per: passingpersentage, reward } = await SubTriviaQuiz.findOne({ _id: new mongoose.Types.ObjectId(subtrivia_id) })
  var { end_time, cor_ans } = await Result_Subtrivia.findOne({ subtrivia_id: new mongoose.Types.ObjectId(subtrivia_id), participant_id: new mongoose.Types.ObjectId(participant_id) })

  const cur_time = moment().valueOf(); // Get the current time i

  if (cur_time > end_time) {
    throw new CreateError("CustomError", "you have exceed the submit timeperiod")
  }

  if (stu_ans.length !== numberofquestion) {
    throw new CreateError("CustomError", "incorrect stu_ans array length")
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

  if (persentage >= passingpersentage) {


    await Result_Subtrivia.updateOne(
      { subtrivia_id: new mongoose.Types.ObjectId(subtrivia_id), participant_id: new mongoose.Types.ObjectId(participant_id) },
      { $set: { stu_ans, marks, reward, obtain_persentage: persentage, submit_time_period } }
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
  } else {

    await Result_Subtrivia.updateOne(
      { subtrivia_id: new mongoose.Types.ObjectId(subtrivia_id), participant_id: new mongoose.Types.ObjectId(participant_id) },
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

}
