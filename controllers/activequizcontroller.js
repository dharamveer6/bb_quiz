
const Joi = require("joi");
const { trycatch } = require("../utils/tryCatch");

const { connectToRabbitMQ } = require("../rabbit_config");
const Question = require("../models/questionmodel");
const { mongoose } = require("mongoose");
const { CreateError } = require("../utils/create_err");
const { moment } = require("../utils/timezone.js");
const participantModel = require("../models/participantModel.js");
const ActiveQuiz = require("../models/activequizmodel.js");
const SubActiveQuiz = require("../models/subActiveModel.js");
const { increaseTime } = require("../utils/increase_time.js");
const Subject = require("../models/subjectmodel.js");

let createActiveQuiz = async (req, res, next) => {
  req.body.question_composition = JSON.parse(req.body.question_composition);
  req.body.rules = JSON.parse(req.body.rules);
  req.body.subjects_id = JSON.parse(req.body.subjects_id);

  var data = req.body;

  const schema = Joi.object({
    category_id: Joi.string().required(),
    quiz_name: Joi.string().required(),
    quiz_name: Joi.string().required(),
    sub_cat_id: Joi.string().required(),
    subjects_id: Joi.array().items(Joi.string()).min(1).required(),
    repeat: Joi.string()
      .valid(
        "never",
        "5 mins",
        "15 mins",
        "30 mins",
        "45 mins",
        "1 hrs",
        "2 hrs",
        "3 hrs",
        "6 hrs",
        "1 days",
        "2 days",
        "3 days",
        "1 week",
        "2 week",
        "1 month",
        "2 month",
        "3 month",
        "6 month",
        "1 year"
      )
      .required(),
    subjects_id: Joi.array().items(Joi.string()).min(1).required(),
    question_composition: Joi.object()
      .pattern(
        Joi.string().required(),
        Joi.number().integer().max(100).min(0).required()
      )
      .max(10)
      .required(),
    total_num_of_quest: Joi.number().required(),
    entryFees: Joi.number().min(1).required(),
    slots: Joi.number().min(1).required(),
    time_per_question: Joi.number().required(),



    sch_time: Joi.string()
      .regex(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/)
      .message("Invalid date-time format. Please use DD-MM-YYYY HH:mm:ss")
      .required(),
    rules: Joi.array().items(Joi.string()).min(1).required(),
  });

  const { error } = await schema.validateAsync(req.body);

  let file_access = req.file;

  if (!req.file) {
    throw new CreateError("FileUploadError", "upload the banner for the quiz");
  }

  // return console.log(file_access);

  let {
    category_id,
    sub_cat_id,
    subjects_id,
    question_composition,
    total_num_of_quest,
    time_per_ques,
    min_reward_per,
    reward,
    rules,
    quiz_name,
    sch_time,
    repeat,
    slots, entryFees
  } = req.body;
  // console.log(typeof (question_composition))
  // return ;
  // // question_composition = JSON.parse(question_composition);
  // return console.log(question_composition);

  // const schema = Joi.object({
  //     category_id: Joi.string().required(),
  //     sub_cat_id: Joi.string().required(),
  //     subjects_id: Joi.string().required(),
  //     question_composition: Joi.array().items(
  //         Joi.object().pattern(Joi.string(), Joi.number().integer().min(0))
  //       ).required().custom(customValidator).messages({
  //         'any.invalid': 'The sum of counts in each question composition object should be 100'
  //       }),
  //     total_num_of_quest: Joi.number().min(0).max(500).required(),
  //     time_per_ques: Joi.number().required(),
  //     min_reward_per: Joi.number().required(),
  //     reward: Joi.number().min(0).max(500).required(),
  //     rules: Joi.string().required(),
  // });

  // const { error } = await schema.validateAsync(
  //     category_id,
  //     sub_cat_id,
  //     subjects_id,
  //     question_composition,
  //     total_num_of_quest,
  //     time_per_ques,
  //     min_reward_per,
  //     reward,
  //     rules
  //     );

  // let file_access = req.file;

  // return console.log(file_access);

  sch_time = moment(sch_time, "DD-MM-YYYY HH:mm:ss").valueOf();

  // return console.log(subjects_id,question_composition);

  const keys = Object.keys(data.question_composition);
  console.log(keys);
  const count = keys.length;

  let check = 0;

  var remain_question = 0;

  var question = [];

  var ans = [];
  console.log(data.question_composition);

  var check_pers = 0;

  for (let i in data.question_composition) {
    const persentage = data.question_composition[i];

    check_pers += data.question_composition[i];
  }

  console.log(check_pers, "check pers");
  console.log(check_pers == 100, "ck cond");

  if (check_pers == 100) {
    console.log("next");
  } else {
    throw new CreateError(
      "CustomError",
      `total persent is ${check_pers} make sure you persent will 100`
    );
  }

  for (let i in data.question_composition) {
    console.log(i);
    check++;

    const persentage = data.question_composition[i];

    // console.log(persentage);
    var single_tag_quest = Math.floor(
      (persentage / 100) * data.total_num_of_quest
    );

    remain_question += single_tag_quest;

    if (check == count) {
      const data = req.body.total_num_of_quest - remain_question;

      single_tag_quest += data;
    }

    const ques = await Question.find({
      sub_id: new mongoose.Types.ObjectId(i),
      is_del: 0,
    });

    const { sub_name } = await Subject.findOne({
      _id: new mongoose.Types.ObjectId(i),
    });

    // console.log(single_tag_quest, sub_name);

    que_len = ques.length;

    if (que_len < single_tag_quest) {
      throw new CreateError(
        "CustomError",
        `${sub_name} has tag has not sufficient question`
      );
    }

    const que = await Question.aggregate([
      { $match: { sub_id: new mongoose.Types.ObjectId(i), is_del: 0 } },
      { $sample: { size: single_tag_quest } },
    ]);

    for (let i of que) {
      question = [...question, i._id];
      ans = [...ans, i.ans];
    }

    if (question.length !== ans.length) {
      throw new CreateError(
        "CustomError",
        "question array and answer array is not same"
      );
    }
  }

  var blobName = "img/" + Date.now() + "-" + file_access.originalname;

  const sen2 = JSON.stringify({ blobName, file_access });

  var channel = await connectToRabbitMQ();

  channel.sendToQueue("upload_public_azure", Buffer.from(sen2));
  console.log("send to queue");

  // return console.log(req.body);

  var sch_time2 = increaseTime(sch_time, repeat)

  let add = await ActiveQuiz({
    category_id,
    sub_cat_id,
    subjects_id,
    question_composition,
    total_num_of_quest,
    time_per_ques,
    min_reward_per,
    reward,
    rules,
    banner: blobName,
    quiz_name,
    sch_time: sch_time2,
    repeat, slots, entryFees
  });
  await add.save();

  const Active_Quiz_Id = add.id || add._id;


  var seconds_to_add = time_per_ques * time_per_ques

  var end_time = moment(sch_time).add(seconds_to_add, 'seconds').valueOf();

  let add2 = await SubActiveQuiz({
    category_id,
    sub_cat_id,
    subjects_id,
    question_composition,
    total_num_of_quest,
    time_per_ques,
    min_reward_per,
    reward,
    rules,
    banner: blobName,
    quiz_name,
    sch_time, end_time,
    repeat,
    Active_Quiz_Id,
  });
  await add2.save();

  const SubActive_Quiz_Id = add2.id || add2._id;
  const sen3 = JSON.stringify({ SubActive_Quiz_Id });
  channel.sendToQueue("declare_active_result", Buffer.from(sen3));

  if (repeat == "never") {
    return res.send({ status: 1, message: "Quiz Create successfully" });
  } else {
    const sen2 = JSON.stringify({ Active_Quiz_Id });

    channel.sendToQueue("Create_active_quiz", Buffer.from(sen2));
    console.log("send to queue");
    return res.send({ status: 1, message: "Quiz Create successfully" });
  }
};


let getActiveQuiz = async (req, res, next) => {
  const schema = Joi.object({
    searchQuery: Joi.string().allow(""),
    page: Joi.number().integer(),
    limit: Joi.number().integer(),
    fromDate: Joi.string().allow(""),
    toDate: Joi.string().allow(""),
  });
  //     const unixTimestamp = 1710572400000;

  //     // Convert Unix timestamp to Date object
  //     const datew = new Date(unixTimestamp);

  //     // Format the date using Moment.js
  //     const formattedDate = moment(datew).format('DD-MM-YYYY HH:mm:ss');
  //    return console.log(formattedDate);

  await schema.validateAsync(req.query);

  var { searchQuery, page, limit, fromDate, toDate } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  // res.send("data")

  fromDate = fromDate + " 00:01:00";
  toDate = toDate + " 23:59:59";

  fromDate = moment(fromDate, "DD-MM-YYYY HH:mm:ss").valueOf();
  toDate = moment(toDate, "DD-MM-YYYY HH:mm:ss").valueOf();
  // return console.log(fromDate,toDate);

  // return console.log(startDate,endDate);
  let data = await SubActiveQuiz.aggregate([
    {
      $match: {
        // quiz_name: { $regex: searchQuery, $options: 'i' },
        sch_time: { $gte: fromDate, $lte: toDate },
      },
    },
    // {
    //     $lookup: {
    //         from: "categories",
    //         localField: "category_id",
    //         foreignField: "_id",
    //         as: "category"
    //     }
    // },
    // {
    //     $unwind: "$category"
    // },
    // {
    //     $lookup: {
    //         from: "subcategories",
    //         localField: "sub_cat_id",
    //         foreignField: "_id",
    //         as: "subcategory"
    //     }
    // },
    // {
    //     $unwind: "$subcategory"
    // },
    // {
    //     $project: {
    //         "category_name": "$category.category_name",
    //         "subcategory_name": "$subcategory.sub_category_name",
    //         "quiz_name": 1,
    //         "total_num_of_quest": 1,
    //         "min_reward_per": 1,
    //         "reward": 1,
    //         "banner": 1,
    //         "sch_time":1,
    //         "Trivia_Quiz_Id":1
    //     }
    // },
  ]);

  console.log(data.length , "leb")

  // console.log(data)

  const trivia_arr = [];

  for (let i of data) {
    i.sch_time = moment(i.sch_time).format("DD-MM-YYYY HH:mm:ss");

    trivia_arr.push(i.Active_Quiz_Id);
  }
  console.log(trivia_arr)
  // const search_ids=new Set(trivia_arr);

  totalData = await ActiveQuiz.countDocuments({
    quiz_name: { $regex: searchQuery, $options: "i" },
    _id: { $in: trivia_arr },
    // sch_time: { $gte: fromDate, $lte: toDate }
  });
  console.log(totalData)
  let data2 = await ActiveQuiz.aggregate([
      // {
      //   $match: {
      //     quiz_name: { $regex: searchQuery, $options: "i" },
      //     _id: { $in: trivia_arr },
      //   },
      // },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $lookup: {
        from: "subcategories",
        localField: "subCategoryId",
        foreignField: "_id",
        as: "subcategory",
      },
    },
    {
      $unwind: "$subcategory",
    },
    {
      $project: {
        category_name: "$category.category_name",
        subcategory_name: "$subcategory.sub_category_name",
        quiz_name: 1,
        total_num_of_quest: 1,

        entryFees: 1,
        banner: 1,
        sch_time: 1,
        _id: 1,
      },
    },
    {
      $skip: (page - 1) * limit, // Skip documents based on pagination
    },
    {
      $limit: limit, // Limit the number of documents per page
    },
  ]);

  const totalPages = Math.ceil(totalData / limit);
  console.log(totalPages);
  console.log("data2",data2);


  for (let i of data2) {
    i.sch_time = moment(i.sch_time).format("DD-MM-YYYY HH:mm:ss");
  }

  return res.send({
    status: 1,
    data2,
    totalPages: totalPages,
    totalData: totalData,
  });
};




let viewDetailsofActivequiz = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().allow(""),
  });
  const { error } = await schema.validateAsync(req.query);
  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }
  let { id } = req.query;
  console.log(id);
  // id= new Types.ObjectId(id)
  const [data] = await ActiveQuiz.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },

    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $lookup: {
        from: "subcategories",
        localField: "sub_cat_id",
        foreignField: "_id",
        as: "subcategory",
      },
    },
    {
      $unwind: "$subcategory",
    },
    {
      $project: {
        category_name: "$category.category_name",
        subcategory_name: "$subcategory.sub_category_name",
        quiz_name: 1,
        total_num_of_quest: 1,
        min_reward_per: 1,
        reward: 1,
        banner: 1,
        sch_time: 1,
        _id: 1,
      },
    },
  ]);

  data.sch_time = moment(data.sch_time).format("DD-MM-YYYY HH:mm");
  console.log(data.sch_time);
  res.send({ status: 1, data });
};



var view_history_of_active_quiz = async (req, res) => {
  const schema = Joi.object({
    quiz_id: Joi.string().required(),
    fromDate: Joi.string().required(),
    toDate: Joi.string().required(),
  });

  var { fromDate, toDate } = req.body;



  fromDate = fromDate + " 00:01:00";

  toDate = toDate + " 23:59:59";

  fromDate = moment(fromDate, "DD-MM-YYYY HH:mm:ss").valueOf();
  toDate = moment(toDate, "DD-MM-YYYY HH:mm:ss").valueOf();



  var curenttimestamp = moment().format("DD-MM-YYYY HH:mm:ss");
  curenttimestamp = moment(curenttimestamp, "DD-MM-YYYY HH:mm:ss").valueOf();


  const { error } = await schema.validateAsync(req.body);

  const { quiz_id } = req.body;



  // console.log(check)

  let data2 = await SubActiveQuiz.aggregate([
    {
      $match: {
        Active_Quiz_Id: new mongoose.Types.ObjectId(quiz_id),
        sch_time: { $gte: fromDate, $lte: toDate },
        end_time: { $lte: curenttimestamp },
      },
    },

  ]);


  for (let i of data2) {

    const slot_aloted = i.slot_aloted;
    const entryFees = i.entryFees;

    i.collected = slot_aloted * entryFees;
    i.distributed = Math.ceil(i.collected * 0.80);
    i.income = i.collected - i.distributed;
    i.end_time= moment(i.end_time).format("DD-MM-YYYY HH:mm:ss");
    i.sch_time= moment(i.sch_time).format("DD-MM-YYYY HH:mm:ss");
  }



  res.send({ status: 1, data2 });
};
createActiveQuiz = trycatch(createActiveQuiz)
getActiveQuiz = trycatch(getActiveQuiz)
viewDetailsofActivequiz = trycatch(viewDetailsofActivequiz)
view_history_of_active_quiz = trycatch(view_history_of_active_quiz)

module.exports = {
  getActiveQuiz, createActiveQuiz, viewDetailsofActivequiz, view_history_of_active_quiz
}
