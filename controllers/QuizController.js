const Joi = require("joi");
const { trycatch } = require("../utils/tryCatch");
const { CreateError } = require("../utils/create_err");;
const quiz = require("../models/quizmodel");
const { connectToRabbitMQ } = require("../rabbit_config");
const {moment} = require('../utils/timezone')

var add_Quiz = async (req, res, next) => {



    const quizValidationSchema = Joi.object({

        quiz_name: Joi.string().required(),
        categoryId: Joi.string().required(),
        subCategoryId: Joi.string().required(),
        subjects: Joi.string().required(),
        totalQuestions: Joi.string().min(1).required(),
        timePerQuestion: Joi.string().min(1).required(),
        scheduleDateTime: Joi.string().regex(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/)
            .message('Invalid date-time format. Please use DD-MM-YYYY HH:mm:ss'),
        quiz_repeat: Joi.string().required(),
        image: Joi.string().allow(''),
        rules: Joi.string().allow(''),
        entryFees: Joi.string().required()
    });

    const createdDate = moment().valueOf();


    const { error } = await quizValidationSchema.validateAsync(req.body);

    const { quiz_name , categoryId, subCategoryId, scheduleDateTime, timePerQuestion , quiz_repeat  , totalQuestions, image, entryFees, rules, subjects } = req.body;

    subjectsArray = JSON.parse(subjects)

    let totalPercentage = 0;
    for (const subject of subjectsArray) {

        totalPercentage += subject.percentage;
        // console.log(totalPercentage)
    }

    // Check if the total percentage equals 100
    if (totalPercentage !== 100) {
        throw new CreateError("CustomError", 'Total percentage must be 100')

    }
    var file_access = req.file
    console.log(file_access)

    const blobName = "image/" + Date.now() + '-' + req.file.originalname;

    var channel = await connectToRabbitMQ()

    const sen2 = JSON.stringify({ blobName, file_access })

    channel.sendToQueue("upload_public_azure", Buffer.from(sen2));

    const create_quiz = new quiz({ categoryId, subCategoryId, subjects, createdDate,  rules, entryFees, scheduleDateTime,quiz_repeat ,  totalQuestions, timePerQuestion, image: blobName });
    await create_quiz.save();
    res.send({ status: 1, message: 'quiz create successfully' });


}

add_Quiz = trycatch(add_Quiz)


module.exports = { add_Quiz }