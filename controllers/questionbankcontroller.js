const Joi = require('joi');
const { trycatch } = require('../utils/tryCatch');
const { CreateError } = require('../utils/create_err');
const Subject = require('../models/subjectmodel');

var add_subject=async(req,res,next)=>{
    const schema = Joi.object({
        sub_name: Joi.string().max(50).required(),
        cat_id:Joi.string().max(100).required(),
        sub_cat_id: Joi.array().items(
            Joi.string().max(100).required()
        ).required(),

    });
    const { error } = await schema.validateAsync(req.body);

    const{sub_name,cat_id}=req.body

    let category = await Subject.findOne({sub_name,cat_id});

    if(category){
        throw new CreateError("CustomError", "subject name must be unique") 
    }





  




    const subject = new Subject({
                ...req.body
            });
    
           await subject.save();

           res.send({status:1,msg:"Subject create succesfully"})









}


var read_subjects=async(req,res,next)=>{
    const schema = Joi.object({
        page: Joi.number().integer().allow(0).required(),
        limit: Joi.number().integer().allow(0).required(),
        search: Joi.string().max(50).allow('').required()
    });

    const { error } = await schema.validateAsync(req.query);

    const { page, limit, search } = req.query;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    // Construct search filter
    const searchFilter = search ? { sub_name: { $regex: new RegExp(search, 'i') } } : {};


    // Count total categories for pagination
    const totalsubjects = await Subject.countDocuments(searchFilter);

    // Calculate total pages
    const totalPages = Math.ceil(totalsubjects / limit);

    // Find categories with pagination and search filter
    const categoriesWithSubCategories = await cat.aggregate([
        {
          $lookup: {
            from: "subcategories", // Assuming the name of the SubCategory collection is 'subcategories'
            localField: "_id", // Field from Subject collection
            foreignField: "cat_id", // Field from SubCategory collection
            as: "subcategories" // Name of the array field to store matching subcategories
          }
        },
        {
          $match: searchFilter // Apply the search filter
        },
        {
          $project: {
            category_name: 1, // Include category_name in the result
            subcategory_count: { $size: "$subcategories" } // Count the number of subcategories
          }
        },
        {
          $skip: skip // Skip documents based on pagination
        },
        {
          $limit: limit // Limit the number of documents based on pagination
        }
      ]);

    res.json({
        status: 1,
        categories: categoriesWithSubCategories,
        totalPages:totalPages
    });
}


add_subject=trycatch(add_subject)

module.exports={add_subject}