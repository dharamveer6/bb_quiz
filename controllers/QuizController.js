const mongoose = require("mongoose")
const Joi = require("joi");
const { trycatch } = require("../utils/tryCatch");
const { CreateError } = require("../utils/create_err");;
const quiz = require("../models/activequizmodel");
const { connectToRabbitMQ } = require("../rabbit_config");
const { moment } = require('../utils/timezone');
const Question = require("../models/questionmodel");
const Subject = require("../models/subjectmodel");
const { SubActiveQuiz } = require("../models/subActiveModel");


var add_Quiz = async (req, res, next) => {

    // res.send("d")

    const quizValidationSchema = Joi.object({

        quiz_name: Joi.string().required(),
        categoryId: Joi.string().required(),
        subCategoryId: Joi.string().required(),
        subject_id: Joi.string().required(),
        question_composition: Joi.required(),
        totalQuestions: Joi.string().min(1).required(),
        timePerQuestion: Joi.string().min(1).required(),
        scheduleDateTime: Joi.string().regex(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/)
            .message('Invalid date-time format. Please use DD-MM-YYYY HH:mm:ss'),
        total_slots: Joi.string().min(1).required(),
        quiz_repeat: Joi.string().required(),
        image: Joi.string().allow(''),
        rules: Joi.string().allow(''),
        entryFees: Joi.string().required()
    });

    const createdDate = moment().valueOf();

    req.body.question_composition = JSON.parse(req.body.question_composition)
    const data = req.body;

    const { error } = await quizValidationSchema.validateAsync(req.body);

    var { quiz_name, categoryId, subject_id, subCategoryId, scheduleDateTime, timePerQuestion, total_slots, quiz_repeat, totalQuestions, image, entryFees, rules, question_composition } = req.body;

    scheduleDateTime = moment(scheduleDateTime, 'DD-MM-YYYY HH:mm:ss').valueOf();

    const keys = Object.keys(data.question_composition);
    // console.log(keys)
    const count = keys.length;
    // console.log("total_sub",count);

    let check = 0;

    var remain_question = 0

    var question = [];

    var ans = [];
    // console.log(data.question_composition);

    var check_pers = 0;

    for (let i in data.question_composition) {
        const persentage = data.question_composition[i];
        // console.log(persentage)
        check_pers += data.question_composition[i]
        //  console.log(check_pers)

    }

    // console.log(check_pers == 100, "check_per")

    if (check_pers != 100) {

        throw new CreateError("CustomError", `total persent is ${check_pers} make sure you persent will 100`)
    }



    for (let i in data.question_composition) {
        check++;
        console.log("sub_id", check)


        const persentage = question_composition[i];


        var single_tag_quest = Math.floor((persentage / 100) * data.totalQuestions);
        console.log("ques per sub", single_tag_quest);

        remain_question += single_tag_quest
        console.log(remain_question);


        if (check == count) {
            // res.send("ch")
            const data = req.body.totalQuestions - remain_question;
            console.log("que", data)
            single_tag_quest += data

        }



        const ques = await Question.find({ sub_id: new mongoose.Types.ObjectId(i), is_del: 0 })

        const topic_name = await Subject.findOne({ _id: new mongoose.Types.ObjectId(i) })
        console.log(topic_name)


        console.log("ss", single_tag_quest, "tn", topic_name)

        que_len = ques.length;
        // console.log(que_len)

        if (que_len < single_tag_quest) {
            throw new CreateError("CustomError", `${topic_name} has tag has not sufficient question`)
        }





        const que = await Question.aggregate([
            { $match: { sub_id: new mongoose.Types.ObjectId(i), is_del: 0 } },
            { $sample: { size: single_tag_quest } }
        ]);

        for (let i of que) {
            question = [...question, i._id];
            ans = [...ans, i.ans];
        }


        if (question.length !== ans.length) {
            throw new CreateError("CustomError", "question array and answer array is not same")
        }
    }

    rulesArray = JSON.parse(rules)

    // console.log(typeof(rulesArray))

    var file_access = req.file
    // console.log(file_access)
    if (!req.file) {
        throw new CreateError("FileUploadError", "upload the Image of the quiz")
    }


    const blobName = "image/" + Date.now() + '-' + req.file.originalname;

    var channel = await connectToRabbitMQ()

    const sen2 = JSON.stringify({ blobName, file_access })

    channel.sendToQueue("upload_public_azure", Buffer.from(sen2));

    const create_quiz = await new quiz({ quiz_name, subject_id, categoryId, subCategoryId, question_composition, quiz_repeat, createdDate, total_slots, rules: rulesArray, entryFees, scheduleDateTime, quiz_repeat, totalQuestions, timePerQuestion, image: blobName });
    await create_quiz.save();

    const Active_Quiz_Id = create_quiz.id || create_quiz._id;

    let add_to_sub_active_quiz = await new SubActiveQuiz({
        Active_Quiz_Id,
        quiz_name,
        subject_id,
        categoryId,
        subCategoryId,
        question_composition,
        quiz_repeat,
        createdDate,
        total_slots,
        rules: rulesArray,
        entryFees,
        scheduleDateTime,
        quiz_repeat,
        totalQuestions,
        timePerQuestion,
        image: blobName
    })
    await add_to_sub_active_quiz.save();

    res.send({ status: 1, message: 'quiz create successfully', create_quiz });


}



var get_quiz = async (req, res, next) => {

    const page = parseInt(req.query.page) || 3;
    const limit = parseInt(req.query.limit) || 2;
    const searchQuery = req.query.search || '';

    const skip = (page - 1) * limit;

    const searchFilter = searchQuery ? { quiz_name: { $regex: searchQuery, $options: 'i' } } : {};


    const totalQuizzes = await quiz.find(searchFilter);
    const quizzes = await quiz.find(searchFilter).limit(limit).skip(skip);

    res.send({
        status: 1,
        message: "Data retrieved successfully",
        data: quizzes,
        totalPages: Math.ceil(totalQuizzes.length / limit),

    });

    if (get_all_quiz) {
        res.send({ status: 1, Message: "data retrive successfully", data: get_all_quiz })
    }
    else {
        throw new CreateError("CustomError", "data not found");
    }
}

var update_quiz = async (req, res, next) => {

    const quizValidationSchema = Joi.object({

        _id: Joi.string().required(),
        quiz_name: Joi.string().required(),
        categoryId: Joi.string().required(),
        subCategoryId: Joi.string().required(),
        subject_id: Joi.string().required(),
        question_composition: Joi.string().required(),
        totalQuestions: Joi.string().min(1).required(),
        timePerQuestion: Joi.string().min(1).required(),
        scheduleDateTime: Joi.string().regex(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/)
            .message('Invalid date-time format. Please use DD-MM-YYYY HH:mm:ss'),
        total_slots: Joi.string().min(1).required(),
        quiz_repeat: Joi.string().required(),
        image: Joi.string().allow(''),
        rules: Joi.string().allow(''),
        entryFees: Joi.string().required()
    });



    const { error } = await quizValidationSchema.validateAsync(req.body);

    var { _id, quiz_name, categoryId, subject_id, subCategoryId, scheduleDateTime, timePerQuestion, total_slots, quiz_repeat, totalQuestions, image, entryFees, rules, question_composition } = req.body;


    question_compositionArray = JSON.parse(question_composition)
    subject_id = JSON.parse(subject_id)


    let totalPercentage = 0;
    for (const subject of question_compositionArray) {

        totalPercentage += subject.percentage;
        // console.log(totalPercentage)
    }

    // Check if the total percentage equals 100
    if (totalPercentage !== 100) {
        throw new CreateError("CustomError", 'Total percentage must be 100')

    }
    rulesArray = JSON.parse(rules)

    // console.log(typeof(rulesArray))

    var file_access = req.file
    // console.log(file_access)
    if (!req.file) {
        throw new CreateError("FileUploadError", "upload the Image of the quiz")
    }


    const blobName = "image/" + Date.now() + '-' + req.file.originalname;

    var channel = await connectToRabbitMQ()

    const sen2 = JSON.stringify({ blobName, file_access })

    channel.sendToQueue("upload_public_azure", Buffer.from(sen2));

    const update = {
        $set: {

            quiz_name: quiz_name,
            subject_id: subject_id,
            categoryId: categoryId,
            subCategoryId: subCategoryId,
            question_composition: question_composition,
            total_slots: total_slots,
            rules: rulesArray,
            entryFees: entryFees,
            scheduleDateTime: scheduleDateTime,
            quiz_repeat: quiz_repeat,
            totalQuestions: totalQuestions,
            timePerQuestion: timePerQuestion,
            image: blobName
        }
    };


    // Update the document
    const result = await quiz.updateOne({ _id: new mongoose.Types.ObjectId(_id) }, update);

    res.send({ status: 1, message: 'quiz updated successfully' });

}


add_Quiz = trycatch(add_Quiz)
get_quiz = trycatch(get_quiz)
update_quiz = trycatch(update_quiz)

module.exports = { add_Quiz, get_quiz, update_quiz }