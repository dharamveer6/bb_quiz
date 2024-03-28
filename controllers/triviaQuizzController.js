const Joi = require("joi");
const { trycatch } = require("../utils/tryCatch");

const {

  connectToRabbitMQ
} = require("../rabbit_config");
const Question = require("../models/questionmodel");
const { mongoose } = require("mongoose");
const Subject = require("../models/subjectmodel");
const SubTriviaQuiz = require("../models/subtriviamodel");
const { CreateError } = require("../utils/create_err");
const { moment } = require("../utils/timezone.js");
const TriviaQuiz = require("../models/triviaModel.js");
const participantModel = require("../models/participantModel.js");
const Result_Subtrivia = require("../models/result_subtrivia.js");
const { increaseTime } = require("../utils/increase_time.js");

let createTriviaQuizz = async (req, res, next) => {
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
    time_per_question: Joi.number().required(),
    reward: Joi.number().max(500).required(),
    min_reward_per: Joi.number().max(100).required(),

    sch_time: Joi.string()
      .regex(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/)
      .message("Invalid date-time format. Please use DD-MM-YYYY HH:mm:ss")
      .required(),
    rules: Joi.array().items(Joi.string()).min().required(),
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
  } = req.body;

  question_composition = JSON.parse(question_composition);
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
      total persent is ${check_pers} make sure you persent will 100
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

    const { sub_name: topic_name } = await Subject.findOne({
      _id: new mongoose.Types.ObjectId(i),
    });

    console.log(single_tag_quest, topic_name);

    que_len = ques.length;

    if (que_len < single_tag_quest) {
      throw new CreateError(
        "CustomError",
        ${topic_name} has tag has not sufficient question
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

  channel.sendToQueue("upload_public_azure", Buffer.from(sen2));
  console.log("send to queue");

  var sch_time2=increaseTime(sch_time,repeat)

  // return console.log(req.body);

  let add = await TriviaQuiz({
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
    sch_time:sch_time2,
    repeat,
  });
  await add.save();

  const Trivia_Quiz_Id = add.id || add._id;

  let add2 = await SubTriviaQuiz({
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
    sch_time,
    repeat,
    Trivia_Quiz_Id,
  });
  await add2.save();

  if (repeat == "never") {
    return res.send({ status: 1, message: "Quiz Create successfully" });
  } else {

    



    const sen2 = JSON.stringify({ Trivia_Quiz_Id });

    channel.sendToQueue("Create_trivia_quiz", Buffer.from(sen2));
    console.log("send to queue");
    return res.send({ status: 1, message: "Quiz Create successfully" });
  }
};

let getQuizz = async (req, res, next) => {
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
  page = parseInt(page);
  limit = parseInt(limit);

  fromDate = fromDate + " 00:01:00";
  toDate = toDate + " 23:59:59";

  fromDate = moment(fromDate, "DD-MM-YYYY HH:mm:ss").valueOf();
  toDate = moment(toDate, "DD-MM-YYYY HH:mm:ss").valueOf();
  // return console.log(fromDate,toDate);

  // return console.log(startDate,endDate);
  let data = await SubTriviaQuiz.aggregate([
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

  const trivia_arr = [];

  for (let i of data) {
    i.sch_time = moment(i.sch_time).format("DD-MM-YYYY HH:mm:ss");

    trivia_arr.push(i.Trivia_Quiz_Id);
  }
  // const search_ids=new Set(trivia_arr);

  totalData = await TriviaQuiz.countDocuments({
    quiz_name: { $regex: searchQuery, $options: "i" },
    _id: { $in: trivia_arr },
    // sch_time: { $gte: fromDate, $lte: toDate }
  });

  let data2 = await TriviaQuiz.aggregate([
    {
      $match: {
        quiz_name: { $regex: searchQuery, $options: "i" },
        _id: { $in: trivia_arr },
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
    {
      $skip: (page - 1) * limit, // Skip documents based on pagination
    },
    {
      $limit: limit, // Limit the number of documents per page
    },
  ]);

  const totalPages = Math.ceil(totalData / limit);
  console.log(totalPages);

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

let viewDetails = async (req, res, next) => {
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
  const [data] = await TriviaQuiz.aggregate([
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
        Trivia_Quiz_Id: 1,
      },
    },
  ]);

  data.sch_time = moment(data.sch_time).format("DD-MM-YYYY HH:mm");
  console.log(data.sch_time);
  res.send({ status: 1, data });
};

var change_category_of_quiz = async (req, res, next) => {
  const schema = Joi.object({
    quiz_id: Joi.string().required(),
    category_id: Joi.string().required(),
    subjects_id: Joi.array().items(Joi.string()).min(1).required(),
    sub_cat_id: Joi.string().required(),
    question_composition: Joi.object()
      .pattern(
        Joi.string().required(),
        Joi.number().integer().max(100).min(0).required()
      )
      .max(10)
      .required(),
  });

  const { error } = await schema.validateAsync(req.body);

  const {
    quiz_id,
    category_id,
    subjects_id,
    sub_cat_id,
    question_composition,
  } = req.body;

  var data = req.body;

  var { total_num_of_quest: numberofquestion } = await TriviaQuiz.findOne({
    _id: new mongoose.Types.ObjectId(quiz_id),
  });

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
    var single_tag_quest = Math.floor((persentage / 100) * numberofquestion);

    remain_question += single_tag_quest;

    if (check == count) {
      const data = numberofquestion - remain_question;

      single_tag_quest += data;
    }

    const ques = await Question.find({
      sub_id: new mongoose.Types.ObjectId(i),
      is_del: 0,
    });

    const { sub_name: topic_name } = await Subject.findOne({
      _id: new mongoose.Types.ObjectId(i),
    });

    console.log(single_tag_quest, topic_name);

    que_len = ques.length;

    if (que_len < single_tag_quest) {
      throw new CreateError(
        "CustomError",
        `${topic_name} has tag has not sufficient question`
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

  await TriviaQuiz.updateOne(
    { _id: new mongoose.Types.ObjectId(quiz_id) },
    { $set: { category_id, subjects_id, sub_cat_id, question_composition } }
  );
};

var change_subcategory_of_quiz = async (req, res, next) => {
  const schema = Joi.object({
    quiz_id: Joi.string().required(),

    subjects_id: Joi.array().items(Joi.string()).min(1).required(),
    sub_cat_id: Joi.string().required(),
    question_composition: Joi.object()
      .pattern(
        Joi.string().required(),
        Joi.number().integer().max(100).min(0).required()
      )
      .max(10)
      .required(),
  });

  const { error } = await schema.validateAsync(req.body);

  const { quiz_id, subjects_id, sub_cat_id, question_composition } = req.body;

  var data = req.body;

  var { total_num_of_quest: numberofquestion } = await TriviaQuiz.findOne({
    _id: new mongoose.Types.ObjectId(quiz_id),
  });

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
    var single_tag_quest = Math.floor((persentage / 100) * numberofquestion);

    remain_question += single_tag_quest;

    if (check == count) {
      const data = numberofquestion - remain_question;

      single_tag_quest += data;
    }

    const ques = await Question.find({
      sub_id: new mongoose.Types.ObjectId(i),
      is_del: 0,
    });

    const { sub_name: topic_name } = await Subject.findOne({
      _id: new mongoose.Types.ObjectId(i),
    });

    console.log(single_tag_quest, topic_name);

    que_len = ques.length;

    if (que_len < single_tag_quest) {
      throw new CreateError(
        "CustomError",
        `${topic_name} has tag has not sufficient question`
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

  await TriviaQuiz.updateOne(
    { _id: new mongoose.Types.ObjectId(quiz_id) },
    { $set: { subjects_id, sub_cat_id, question_composition } }
  );
};

var change_subject_for_quiz = async (req, res, next) => {
  const schema = Joi.object({
    quiz_id: Joi.string().required(),

    subjects_id: Joi.array().items(Joi.string()).min(1).required(),

    question_composition: Joi.object()
      .pattern(
        Joi.string().required(),
        Joi.number().integer().max(100).min(0).required()
      )
      .max(10)
      .required(),
  });

  const { error } = await schema.validateAsync(req.body);

  const { quiz_id, subjects_id, question_composition } = req.body;

  var data = req.body;

  var { total_num_of_quest: numberofquestion } = await TriviaQuiz.findOne({
    _id: new mongoose.Types.ObjectId(quiz_id),
  });

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
    var single_tag_quest = Math.floor((persentage / 100) * numberofquestion);

    remain_question += single_tag_quest;

    if (check == count) {
      const data = numberofquestion - remain_question;

      single_tag_quest += data;
    }

    const ques = await Question.find({
      sub_id: new mongoose.Types.ObjectId(i),
      is_del: 0,
    });

    const { sub_name: topic_name } = await Subject.findOne({
      _id: new mongoose.Types.ObjectId(i),
    });

    console.log(single_tag_quest, topic_name);

    que_len = ques.length;

    if (que_len < single_tag_quest) {
      throw new CreateError(
        "CustomError",
        `${topic_name} has tag has not sufficient question`
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

  await TriviaQuiz.updateOne(
    { _id: new mongoose.Types.ObjectId(quiz_id) },
    { $set: { subjects_id, question_composition } }
  );
};

var change_no_question_for_quiz = async (req, res, next) => {
  const schema = Joi.object({
    quiz_id: Joi.string().required(),
    numberofquestion: Joi.number().integer().required(),
  });

  const { error } = await schema.validateAsync(req.body);

  const { quiz_id, numberofquestion } = req.body;

  var data = req.body;

  var { question_composition } = await TriviaQuiz.findOne({
    _id: new mongoose.Types.ObjectId(quiz_id),
  });

  data.question_composition = question_composition;

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
      "total persent is ${check_pers} make sure you persent will 100"
    );
  }

  for (let i in data.question_composition) {
    console.log(i);
    check++;

    const persentage = data.question_composition[i];

    // console.log(persentage);
    var single_tag_quest = Math.floor((persentage / 100) * numberofquestion);

    remain_question += single_tag_quest;

    if (check == count) {
      const data = numberofquestion - remain_question;

      single_tag_quest += data;
    }

    const ques = await Question.find({
      sub_id: new mongoose.Types.ObjectId(i),
      is_del: 0,
    });

    const { sub_name: topic_name } = await Subject.findOne({
      _id: new mongoose.Types.ObjectId(i),
    });

    console.log(single_tag_quest, topic_name);

    que_len = ques.length;

    if (que_len < single_tag_quest) {
      throw new CreateError(
        "CustomError",
        `${topic_name} has tag has not sufficient question`
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

  await TriviaQuiz.updateOne(
    { _id: new mongoose.Types.ObjectId(quiz_id) },
    { $set: { total_num_of_quest: numberofquestion } }
  );
};

let chnageBanner = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required(),
  });

  const { error } = await schema.validateAsync(req.body);

  let file_access = req.file;
  let { id } = req.body;

  if (!req.file) {
    throw new CreateError("FileUploadError", "upload the banner for the quiz");
  }

  var blobName = "img/" + Date.now() + "-" + file_access.originalname;

  const sen2 = JSON.stringify({ blobName, file_access });
  var channel = await connectToRabbitMQ();

  channel.sendToQueue("upload_public_azure", Buffer.from(sen2));
  console.log("send to queue");

  const update = await TriviaQuiz.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    { banner: blobName }
  );
  res.send({ status: 1, message: "successfuly updated" });
};

let changeRules = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required(),
    rules: Joi.array().required(),
  });

  const { error } = await schema.validateAsync(req.body);

  let { id, rules } = req.body;

  const update = await TriviaQuiz.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    { rules: rules }
  );
  return res.send({ status: 1, message: "successfuly updated" });
};
let updateReward = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required(),
    reward: Joi.number().max(500).required(),
  });

  const { error } = await schema.validateAsync(req.body);

  let { id, reward } = req.body;

  const update = await TriviaQuiz.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    { reward }
  );
  return res.send({ status: 1, message: "successfuly updated" });
};
let changeTimePerQues = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required(),
    time_per_question: Joi.number().required(),
  });

  const { error } = await schema.validateAsync(req.body);

  let { id, time_per_question } = req.body;

  const update = await TriviaQuiz.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    { time_per_question }
  );
  return res.send({ status: 1, message: "successfuly updated" });
};

let updateStatus = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required(),
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
  });

  const { error } = await schema.validateAsync(req.body);

  let { id, repeat } = req.body;

  const update = await TriviaQuiz.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    { repeat }
  );
  return res.send({ status: 1, message: "successfuly updated" });
};

var view_history_of_trivia_quiz = async (req, res) => {
  const schema = Joi.object({
    quiz_id: Joi.string().required(),
    fromDate: Joi.string().required(),
    toDate: Joi.string().required(),
  });

  var { fromDate, toDate } = req.body;

  var current_date = moment().format("DD-MM-YYYY");

  fromDate = fromDate + " 00:01:00";
  current_date = current_date + " 00:01:00";
  toDate = toDate + " 23:59:59";

  fromDate = moment(fromDate, "DD-MM-YYYY HH:mm:ss").valueOf();
  toDate = moment(toDate, "DD-MM-YYYY HH:mm:ss").valueOf();
  current_date = moment(current_date, "DD-MM-YYYY HH:mm:ss").valueOf();

  if (toDate > current_date) {
    throw new CreateError("CustomError", "To Date smaller then today date");
  }

  const { error } = await schema.validateAsync(req.body);

  const { quiz_id } = req.body;

  const check = await SubTriviaQuiz.aggregate([
    {
      $match: {
        Trivia_Quiz_Id: new mongoose.Types.ObjectId(quiz_id),
        // sch_time: { $gte: fromDate, $lte: toDate }
      },
    },
    {
      $lookup: {
        from: "Result_Subtrivias",
        let: { subtrivia_ids: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$subtrivia_id", "$$subtrivia_ids"] },
                  { $eq: ["$is_attempted", 1] },
                ],
              },
            },
          },
        ],
        as: "result_subtrivias",
      },
    },
  ]);

  // console.log(check)

  let data2 = await SubTriviaQuiz.aggregate([
    {
      $match: {
        Trivia_Quiz_Id: new mongoose.Types.ObjectId(quiz_id),
        sch_time: { $gte: fromDate, $lte: toDate },
      },
    },
    {
      $lookup: {
        from: "result_subtrivias",
        let: { subtrivia_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$subtrivia_id", "$$subtrivia_id"] },
                  { $eq: ["$is_attempted", 1] },
                ],
              },
            },
          },
        ],
        as: "result_subtrivias",
      },
    },
    {
      $addFields: {
        total_attempted: { $size: "$result_subtrivias" },
        total_reward: { $sum: "$result_subtrivias.reward" },
      },
    },
    {
      $project: {
        total_reward: 1,
        total_attempted: 1,
        total_num_of_quest: 1,
        min_reward_per: 1,
        reward: 1,
        sch_time: 1,
        // Exclude the result_subtrivias array from the output
      },
    },
  ]);

  res.send({ status: 1, data2 });
};

var view_winner_and_participants_of_subtrivia = async (req, res, next) => {
  const schema = Joi.object({
    subtrivia_quiz_id: Joi.string().required(),
  });

  
  const { error } = await schema.validateAsync(req.body);

  var { subtrivia_quiz_id } = req.body;

  var rewardedParticipants = await Result_Subtrivia.aggregate([
    {
      $match: {
        subtrivia_id:new mongoose.Types.ObjectId(subtrivia_quiz_id),
        reward: { $ne: 0 }
      },
    },
    {
      $group: {
        _id: "$participant_id",
      },
    },
  ]);

  // Get the participant IDs whose reward is equal to 0
  var nonRewardedParticipants = await Result_Subtrivia.aggregate([
    {
      $match: {
        subtrivia_id:new mongoose.Types.ObjectId(subtrivia_quiz_id),
        reward: 0
      },
    },
    {
      $group: {
        _id: "$participant_id",
      },
    },
  ]);

  // Get participant details for rewarded participants
  const rewardedParticipantDetails = await participantModel.find({
    _id: { $in: rewardedParticipants.map((p) => p._id) },
  });

  // Get participant details for non-rewarded participants
  const nonRewardedParticipantDetails = await participantModel.find({
    _id: { $in: nonRewardedParticipants.map((p) => p._id) },
  });

  // Extract participant names
  const rewardedParticipantNames = rewardedParticipantDetails.map(
    (p) => p.name
  );
  const nonRewardedParticipantNames = nonRewardedParticipantDetails.map(
    (p) => p.name
  );

  console.log("Rewarded Participants:", rewardedParticipantNames);
  console.log("Non-Rewarded Participants:", nonRewardedParticipantNames);

  res.send({ status: 1 ,winners:rewardedParticipantNames,participants:nonRewardedParticipantNames});
};

updateStatus = trycatch(updateStatus);
changeRules = trycatch(changeRules);
updateReward = trycatch(updateReward);
changeTimePerQues = trycatch(changeTimePerQues);

createTriviaQuizz = trycatch(createTriviaQuizz);
getQuizz = trycatch(getQuizz);
viewDetails = trycatch(viewDetails);
chnageBanner = trycatch(chnageBanner);
view_history_of_trivia_quiz = trycatch(view_history_of_trivia_quiz);
view_winner_and_participants_of_subtrivia = trycatch(
  view_winner_and_participants_of_subtrivia
);

module.exports = {
  view_winner_and_participants_of_subtrivia,
  view_history_of_trivia_quiz,
  createTriviaQuizz,
  getQuizz,
  viewDetails,
  chnageBanner,
  changeRules,
  updateReward,
  changeTimePerQues,
  updateStatus,
};