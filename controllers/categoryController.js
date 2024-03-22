const Joi = require('joi');
const { trycatch } = require('../utils/tryCatch');
const { CreateError } = require('../utils/create_err');
const SubCategory = require('../models/subcategorymodel');
const Category = require('../models/categorymodel');
const { default: mongoose } = require('mongoose');
const { connectToRabbitMQ } = require('../rabbit_config');


var addCategory = async (req, res, next) => {

    const schema = Joi.object({
        category_name: Joi.string().max(50).required(),
        // sub_categories: Joi.array().items(
        //     Joi.string().max(50).required()
        // ).required(),
        sub_categories: Joi.string().required()

    });

    const { error } = await schema.validateAsync(req.body);

    const { sub_categories, category_name } = req.body;
    // console.log(typeof(sub_categories))

    var sub_categories_array = JSON.parse(sub_categories)

    if (!req.file) {
        throw new CreateError("FileUploadError", "image should not be empty")
    }


    // Check if the category already exists
    let category = await Category.findOne({ category_name });
    let categoryId;

    if (!category) {
        // If the category doesn't exist, create a new one
        var file_access = req.file
        console.log(file_access)

        const blobName = "image/" + Date.now() + '-' + req.file.originalname;

        var channel = await connectToRabbitMQ()

        const sen2 = JSON.stringify({ blobName, file_access })

        channel.sendToQueue("upload_public_azure", Buffer.from(sen2));

        const newCategory = new Category({ category_name, image: blobName });

        //    const new = new userModel({...req.body,resume:blobName});
        await newCategory.save();
        categoryId = newCategory._id;
    } else {
        // If the category exists, get its ID
        throw new CreateError("ValidationError", "Category already exists")
    }
    // sidoas
    const uniqueSubCategories = new Set(); // Set to store unique sub-category names

    // Handle sub-categories
    for (const sub_category_name of sub_categories_array) {

        if (uniqueSubCategories.has(sub_category_name)) {

            throw new CreateError("CustomError", "sub_category_name must be unique")
        }


        uniqueSubCategories.add(sub_category_name);

        // Check if the sub-category already exists for this category
        const existingSubCategory = await SubCategory.findOne({ sub_category_name, cat_id: categoryId });

        if (!existingSubCategory) {
            // If the sub-category doesn't exist, create a new one
            const newSubCategory = new SubCategory({ sub_category_name, cat_id: categoryId });
            await newSubCategory.save();
        }
    }



    // console.log(newCategory._id)
    // haihaiiha

    res.json({
        status: 1,
        message: "Category added successfully"
    })



}

var addsubcategory = async (req, res, next) => {

    const schema = Joi.object({
        category_name: Joi.string().max(50).required(),
        sub_category_name: Joi.string().max(50).required(),

    });

    const { error } = await schema.validateAsync(req.body);


    const { category_name, sub_category_name } = req.body

    // Check if the category exists
    const category = await Category.findOne({ category_name });
    if (!category) {
        throw new CreateError("CustomError", "The specified category does not exist.");
    }

    // Check if the sub-category already exists for this category
    const existingSubCategory = await SubCategory.findOne({ sub_category_name, cat_id: category._id });
    if (existingSubCategory) {
        throw new CreateError("CustomError", "The sub-category already exists under this category.");
    }

    // Create a new sub-category
    const newSubCategory = new SubCategory({
        sub_category_name: sub_category_name,
        cat_id: category._id
    });

    // Save the updated category
    await newSubCategory.save();

    res.json({
        status: 1,
        message: "Sub-category added successfully"
    });

}


var view_sub_category = async (req, res, next) => {
    // res.json(0)

    const schema = Joi.object({
        cat_id: Joi.string().max(50).required(),

    });

    const { error } = await schema.validateAsync(req.query);

    const { cat_id } = req.query;

    // Convert the cat_id string to a MongoDB ObjectId
    const objectIdCatId = new mongoose.Types.ObjectId(cat_id);

    console.log(objectIdCatId)

    // Find sub-categories with the specified cat_id
    const subCategoriesData = await SubCategory.aggregate([
        {
            $match: { cat_id: objectIdCatId } // Match documents with the specified cat_id
        },
        {
            $project: {
                _id: 1, // Include the _id field
                name: '$sub_category_name' // Rename sub_category_name to name
            }
        }
    ]);
    // Send response
    res.json({
        status: 1,
        data: subCategoriesData
    });
}

var view_category = async (req, res, next) => {
    const schema = Joi.object({
        page: Joi.number().integer().allow(0).required(),
        limit: Joi.number().integer().allow(0).required(),
        search: Joi.string().max(50).allow('').required()
    });

    const { error } = await schema.validateAsync(req.query);

    var { page, limit, search } = req.query;

    page = parseInt(page)
    limit = parseInt(limit)

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    // Construct search filter
    const searchFilter = search ? { category_name: { $regex: new RegExp(search, 'i') } } : {};


    // Count total categories for pagination
    const totalCategories = await Category.countDocuments(searchFilter);

    // Calculate total pages
    const totalPages = Math.ceil(totalCategories / limit);

    // Find categories with pagination and search filter
    const categoriesWithSubCategories = await Category.aggregate([
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
                image_url: { $concat: ["https://dvuser.brainbucks.in/quizmicro/stream/get/public?blobname=", "$image"] },
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
        // profile:
        totalPages: totalPages,
        totalCategories: totalCategories
    });

}


addCategory = trycatch(addCategory)
addsubcategory = trycatch(addsubcategory)
view_sub_category = trycatch(view_sub_category)
view_category = trycatch(view_category)


module.exports = { addsubcategory, view_sub_category, addCategory, view_category }