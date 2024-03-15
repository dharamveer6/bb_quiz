const Joi = require("joi");

var add_Quiz = async (req,res,next) =>{

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

    const schema = Joi.object({
        sub_name : Joi.string().max(50).required(),
        question_percentage : Joi.string().max(100).required(),
    })

    const { error } = await schema.validateAsync(req.body);

    const {sub_name ,question_percentage } = req.body;

   const totalPercentage = req.body.subjects.reduce((total, subject) => total + subject.percentage, 0);
        if (totalPercentage > 100) {
            return res.status(400).json({ error: 'Total percentage of subjects cannot exceed 100' });
        }

}

add_Quiz = trycatch(add_Quiz)


module.exports = {add_Quiz}