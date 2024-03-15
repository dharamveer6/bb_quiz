const Joi = require("joi");
const { trycatch } = require("../utils/tryCatch");
const { quiz } = require("../models/quizmodel");

var add_Quiz = async (req,res,next) =>{

    const subjectSchema = Joi.object({
        subjectId : Joi.string().required(),
        percentage: Joi.number().integer().min(1).required()
    });


    const quizValidationSchema = Joi.object({
        categoryId: Joi.string().required(),
        subCategoryId: Joi.string().required(),
        subjects: Joi.array().items(subjectSchema).required(),
        totalQuestions: Joi.number().integer().min(1).required(),
        timePerQuestion: Joi.number().integer().min(1).required(),
        scheduleDateTime: Joi.date().required(),
        image: Joi.string().allow(''),
        rules: Joi.string().allow(''),
        entryFees: Joi.number().positive().required()
    });

  

    const { error } = await quizValidationSchema.validateAsync(req.body);

    const {sub_name ,question_percentage } = req.body;

    const totalPercentage = req.body.subjects.reduce((total, subject) => total + subject.percentage, 0);
        if (totalPercentage !=  100) {
            return res.status(400).json({ error: 'Total percentage must be 100' });
        }

        const quiz = new quiz(req.body);
        await quiz.save();
        res.send({ status:1, data: quiz });


}

add_Quiz = trycatch(add_Quiz)


module.exports = {add_Quiz}