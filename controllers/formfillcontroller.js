const { CreateError } = require("../utils/create_err");
const { trycatch } = require("../utils/tryCatch");
const Category = require("../models/categorymodel");
const SubCategory = require("../models/subcategorymodel");



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




get_all_categories = trycatch(get_all_categories)
get_all_sub_categories = trycatch(get_all_sub_categories)
module.exports = {get_all_categories , get_all_sub_categories } 