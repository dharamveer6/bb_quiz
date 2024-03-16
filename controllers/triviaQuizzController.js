const Joi = require('joi');
const { trycatch } = require('../utils/tryCatch');
const triviaModel = require('../models/triviaModel');
const { connectToRabbitMQ } = require('../rabbit_config');


let createTriviaQuizz = async (req, res, next) => {


    const customValidator = (value, helpers) => {
        for (const obj of value) {
            const totalCount = Object.values(obj).reduce((acc, count) => acc + count, 0);
            if (totalCount !== 100) {
                return helpers.message('The sum of counts in each question composition object should be 100');
            }
        }
        return value;
    }

    const schema = Joi.object({
        category_id: Joi.string().required(),
        sub_cat_id: Joi.string().required(),
        subjects_id: Joi.string().required(),
        question_composition: Joi.string().required(),
        total_num_of_quest: Joi.number().min(0).max(500).required(),
        time_per_ques: Joi.number().required(),
        min_reward_per: Joi.number().required(),
        reward: Joi.number().min(0).max(500).required(),
        rules: Joi.string().required(),
    });

    const { error } = await schema.validateAsync(req.body);

    let file_access = req.file;

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
        rules
    } =
        req.body

    subjects_id = JSON.parse(subjects_id)
    question_composition = JSON.parse(question_composition)
    // return console.log(subjects_id,question_composition);

    if (file_access) {
        var blobName = "img/" + Date.now() + '-' + file_access.originalname;


        var channel = await connectToRabbitMQ()

        const sen2 = JSON.stringify({ blobName, file_access })

        channel.sendToQueue("upload_public_azure", Buffer.from(sen2));
        console.log("send to queue")

    }

    // return console.log(req.body);

    let add = await triviaModel({
        category_id,
        sub_cat_id,
        subjects_id,
        question_composition,
        total_num_of_quest,
        time_per_ques,
        min_reward_per,
        reward,
        rules,
        banner: blobName
    })
    await add.save()
    res.send({ status: 1, message: "successfuly registered" });

}


let getQuizz = async (req, res, next) => {

    // let data = await triviaModel.find();

    let data = await triviaModel.aggregate([
        {
            $lookup: {
                from: "categories",
                localField: "category_id",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: "$category"
        },
        {
            $lookup: {
                from: "subcategories",
                localField: "sub_cat_id",
                foreignField: "_id",
                as: "subcategory"
            }
        },
        {
            $unwind: "$subcategory"
        },
        {
            $project: {
                "category_name": "$category.category_name",
                "subcategory_name": "$subcategory.sub_category_name",
                "total_num_of_quest": 1,
                "min_reward_per": 1,
                "reward": 1,
                "banner": 1
            }
        }
    ]);

    console.log(data);
    return res.send({ status: 1, data });

}


createTriviaQuizz = trycatch(createTriviaQuizz);
getQuizz = trycatch(getQuizz)

module.exports = { createTriviaQuizz, getQuizz }