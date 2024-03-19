const { CreateError } = require("../utils/create_err");
const { trycatch } = require("../utils/tryCatch");
const Category = require("../models/categorymodel");
const SubCategory = require("../models/subcategorymodel");
const Subject = require("../models/subjectmodel");
const Joi = require("joi");



var get_all_categories = async(req,res,next)=>{
    const schema = Joi.object({
        search: Joi.string().max(50).allow('').required() // Allow empty string as default value
    });

    const { error } = await schema.validateAsync(req.query);

    // Extract search variable from query parameters
    const { search } = req.query;

    // Construct search filter
    const searchFilter = search ? { category_name: { $regex: new RegExp(search, 'i') } } : {};

    // Find categories based on search filter
    const categories = await Category.find(searchFilter, 'category_name');

    // Return the result
    res.json({ status: 1, categories: categories });

}


var get_all_sub_categories = async(req,res,next)=>{
    // Validate request parameters
    const schema = Joi.object({
        search: Joi.string().max(50).allow('').required() // Allow empty string as default value
    });

    const { error } = await schema.validateAsync(req.query);

    // Extract search variable from query parameters
    const { search } = req.query;

    // Construct search filter
    const searchFilter = search ? { sub_category_name: { $regex: new RegExp(search, 'i') } } : {};

    // Find subcategories based on search filter
    const subCategories = await SubCategory.find(searchFilter, 'sub_category_name');

    // Extract distinct subcategory names
    const distinctSubCategories = [...new Set(subCategories.map(subCategory => subCategory.sub_category_name))];

    // Return the result
    res.json({ status: 1, sub_categories: distinctSubCategories });
}


var get_all_subjects_from_subcategories = async(req,res,next)=>{
    

     // Validate request body
     const schema = Joi.object({
        sub_ids: Joi.array().items(Joi.string().required()).required(),
        search: Joi.string().max(50).allow('').required() // Allow empty string as default value
    });

    const { error } = await schema.validateAsync(req.body);
   

    // Extract sub_ids and search from request body
    const { sub_ids} = req.body;
    const {search} = req.query;
    // Construct search filter
    const searchFilter = search ? { sub_name: { $regex: new RegExp(search, 'i') } } : {};

    // Fetch subjects matching the IDs and search filter
    const subjects = await Subject.find({ sub_cat_id: { $in: sub_ids }, ...searchFilter });

    // Extract unique sub_names from subjects
    const uniqueSubNames = new Set();
    subjects.forEach(subject => {
        if (subject.sub_name) { // Check if sub_name field exists
            uniqueSubNames.add(subject.sub_name);
        }
    });

    // Convert the set to an array of unique sub_names
    const subNames = Array.from(uniqueSubNames);

    // Return the result
    res.json({ status: 1, data: subNames });


}




get_all_categories = trycatch(get_all_categories)
get_all_sub_categories = trycatch(get_all_sub_categories)
get_all_subjects_from_subcategories = trycatch(get_all_subjects_from_subcategories)
module.exports = {get_all_categories , get_all_sub_categories,get_all_subjects_from_subcategories}
