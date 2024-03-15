const { CreateError } = require("../utils/create_err");
const { trycatch } = require("../utils/tryCatch");
const Category = require("../models/categorymodel");
const SubCategory = require("../models/subcategorymodel");
const Subject = require("../models/subjectmodel");



var get_all_categories = async(req,res,next)=>{
    const categories = await Category.find({}, 'category_name');
        res.json({
            status: 1,
            categories: categories
        });

}


var get_all_sub_categories = async(req,res,next)=>{
    // Fetch all sub-categories from the database
    const subCategories = await SubCategory.distinct('sub_category_name');
    res.json({
        status: 1,
        sub_categories: subCategories
    });
}


var get_all_subjects_from_subcategories = async(req,res,next)=>{
    

    const schema = Joi.object({
        sub_ids: Joi.array().items(Joi.string().required())
    });

    const { error } = await schema.validateAsync(req.body);

    const { sub_ids } = req.body;

    // Fetch all subjects matching the IDs
    const subjects = await Subject.find({ sub_cat_id: { $in: sub_ids } });

    // Extract unique sub_names from subjects
    const uniqueSubNames = new Set();
    subjects.forEach(subject => {
        if (subject.sub_name) { // Check if sub_name field exists
            uniqueSubNames.add(subject.sub_name);
        }
    });

    // Convert the set to an array of unique sub_names
    const subNames = Array.from(uniqueSubNames);

    res.json({ status: 1, data: subNames });


}




get_all_categories = trycatch(get_all_categories)
get_all_sub_categories = trycatch(get_all_sub_categories)
get_all_subjects_from_subcategories = trycatch(get_all_subjects_from_subcategories)
module.exports = {get_all_categories , get_all_sub_categories,get_all_subjects_from_subcategories}
