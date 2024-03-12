const express=require('express');
const { addsubcategory, view_sub_category, addCategory } = require('../controllers/categoryController');


const categoryRoute = express.Router();


categoryRoute.route('/add/category').post(addCategory);
categoryRoute.route('/add/subcategory').post(addsubcategory);
categoryRoute.route('/view/subcategory').post(view_sub_category);



module.exports = {categoryRoute}