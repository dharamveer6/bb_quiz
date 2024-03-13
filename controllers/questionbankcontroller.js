const Joi = require('joi');
const { trycatch } = require('../utils/tryCatch');
const { CreateError } = require('../utils/create_err');
const Subject = require('../models/subjectmodel');
const {moment}=require("../utils/timezone.js")

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


    

   var update_time=moment().valueOf()





  




    const subject = new Subject({
                ...req.body,update_time
            });
    
           await subject.save();

           res.send({status:1,msg:"Subject create succesfully"})









}


var view_subjects=async(req,res,next)=>{
    const schema = Joi.object({
        page: Joi.number().integer().allow(0).required(),
        limit: Joi.number().integer().allow(0).required(),
        search: Joi.string().max(50).allow('').required()
    });

    const { error } = await schema.validateAsync(req.query);

    var { page, limit, search } = req.query;
    page=parseInt(page)
    limit=parseInt(limit)

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    // Construct search filter
    const searchFilter = search ? { sub_name: { $regex: new RegExp(search, 'i') } } : {};


    // Count total categories for pagination
    const totalsubjects = await Subject.countDocuments(searchFilter);

    // Calculate total pages
    const totalPages = Math.ceil(totalsubjects / limit);

    // Find categories with pagination and search filter
    const subjects = await Subject.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'cat_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: '$category'
        },
        {
          $lookup: {
            from: 'subcategories',
            localField: 'sub_cat_id',
            foreignField: '_id',
            as: 'subcategories'
          }
        },
        {
            $unwind: '$subcategories'
          },
        {
          $project: {
            sub_name: 1,
            category_name: '$category.category_name', // Extract category_name directly
            sub_category_names: '$subcategories.sub_category_name' ,
            update_time :1// Extract sub_category_names directly
          }
        },
        {
          $group: {
            _id: '$_id',
            update_time:{ $first: '$update_time' },
            sub_name: { $first: '$sub_name' },
            category: { $first: '$category_name' }, // Rename category_name to category
            subcategories: { $push: '$sub_category_names' } // Group sub_category_names into an array
          }
        },
        {
          $skip: skip // Skip documents based on pagination
        },
        {
          $limit: limit // Limit the number of documents based on pagination
        }
      ]);


      for(let i of subjects){
        i.update_time=moment(i.update_time).format("DD-MM-YYYY HH:mm:ss")
      }
    res.json({
        status: 1,
        subjects: subjects,
        totalPages:totalPages
    });
}


var add_single_question=async(req,res,next)=>{
    
}


add_subject=trycatch(add_subject)
view_subjects=trycatch(view_subjects)

module.exports={add_subject,view_subjects}