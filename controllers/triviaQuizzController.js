const Joi = require('joi');
const { trycatch } = require('../utils/tryCatch');
const triviaModel = require('../models/triviaModel');


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
        subjects_id: Joi.array().items(Joi.string()).required(),
        question_composition: Joi.array().items(Joi.object().pattern(Joi.string(), Joi.number().integer().min(0))).required().custom(customValidator),
        total_num_of_quest: Joi.number().min(0).max(500).required(),
        time_per_ques: Joi.number().required(),
        min_reward_per: Joi.number().required(),
        reward: Joi.number().min(0).max(500).required()
    });

    const { error } = await schema.validateAsync(req.body);


    let {
        category_id,
        sub_cat_id,
        subjects_id,
        question_composition,
        total_num_of_quest,
        time_per_ques,
        min_reward_per,
        reward
    } =
        req.body

    totalQuests = 0;

    // return console.log(req.body);

    let add = await triviaModel({
        category_id,
        sub_cat_id,
        subjects_id,
        question_composition,
        total_num_of_quest,
        time_per_ques,
        min_reward_per,
        reward
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
                "category_name": "$category.name",
                "subcategory_name": "$subcategory.name",
                "subjects_id": 1,
                "question_composition": 1,
                "total_num_of_quest": 1,
                "min_reward_per": 1,
                "reward": 1
            }
        }
    ]);
    
    console.log(data);
    


    return res.send({ data });

}


createTriviaQuizz = trycatch(createTriviaQuizz);
getQuizz = trycatch(getQuizz)

module.exports = { createTriviaQuizz, getQuizz }