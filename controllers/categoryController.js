const Joi = require('joi');
const { trycatch } = require('../utils/tryCatch');
const { CreateError } = require('../utils/create_err');
const SubCategory = require('../models/subcategorymodel');
const Category = require('../models/categorymodel');
const { default: mongoose } = require('mongoose');


var addCategory = async(req,res,next)=>{

    const schema = Joi.object({
        category_name: Joi.string().max(50).required(),
        sub_categories: Joi.array().items(
            Joi.string().max(50).required()
        ).required(),

    });

    const { error } = await schema.validateAsync(req.body);

    const {category_name , sub_categories} = req.body;


//     const newCategory = new Category({
//         category_name: category_name
//     });

//    await newCategory.save();
//     const categoryId = newCategory._id;

//     for(i of sub_categories){
//         console.log(i)
//         console.log(categoryId)

//         const subcat=new SubCategory({sub_category_name:i,cat_id:categoryId})

//        await subcat.save()

//     }

    // Check if the category already exists
    let category = await Category.findOne({ category_name });
    let categoryId;

    if (!category) {
        // If the category doesn't exist, create a new one
        const newCategory = new Category({ category_name });
        await newCategory.save();
        categoryId = newCategory._id;
    } else {
        // If the category exists, get its ID
        categoryId = category._id;
    }

    const uniqueSubCategories = new Set(); // Set to store unique sub-category names

    // Handle sub-categories
    for (const sub_category_name of sub_categories) {
        if (uniqueSubCategories.has(sub_category_name)) {
            throw new CreateError("CustomError","sub_category_name must be unique")
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

    res.json({
        status:1,
        message:"Category added successfully"
    })
    


}

var addsubcategory = async(req,res,next)=>{

    const schema = Joi.object({
        sub_category_name: Joi.string().max(50).required(),

    });

    const { error } = await schema.validateAsync(req.body);
    

   const {sub_category_name} = req.body

        // Create a new sub-category
        const newSubCategory = new SubCategory({
            sub_category_name: sub_category_name
        });

        // Save the updated category
        await newSubCategory.save();

        res.json({ 
            status:1,
            message: "Sub-category added successfully" });

}


var view_sub_category=async(req,res,next)=>{
    const subCategories = await SubCategory.find({}, 'sub_category_name'); // Only retrieve the name field

    // Prepare response
    const subCategoriesData = subCategories.map(subCategory => ({
      _id: subCategory._id,
      name: subCategory.sub_category_name
    }));

    // Send response
    res.json({
        status:1,
        data:subCategoriesData
    });
}

var view_category = async(req,res,next)=>{
    const categories = await Category.find({}, 'category_name');

    // Iterate through categories and find their associated sub-categories
    const categoriesWithSubCategories = await Promise.all(categories.map(async (category) => {
        const subCategories = await SubCategory.find({ cat_id: category._id }, 'sub_category_name');
        console.log(category.category_name)
        console.log( subCategories.map(subCategory => subCategory.sub_category_name))
        return {
            category_name: category.category_name,
            sub_categories: subCategories.map(subCategory => subCategory.sub_category_name)
        };
    }));

    res.json({
        status: 1,
        categories: categoriesWithSubCategories
    });

}


addCategory = trycatch(addCategory)
addsubcategory = trycatch(addsubcategory)
view_sub_category = trycatch(view_sub_category)
view_category = trycatch(view_category)


module.exports={addsubcategory,view_sub_category,addCategory,view_category}