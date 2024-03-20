const express=require('express');
const { addsubcategory, view_sub_category, addCategory, view_category } = require('../controllers/categoryController');
const { uploadimage } = require('../utils/imgmulter');
const userAuthMiddleware = require('../middleware/user_tokenval');


const categoryRoute = express.Router();


categoryRoute.route('/add/category').post(uploadimage.single("category_image"),addCategory);
categoryRoute.route('/view/category').post(userAuthMiddleware,view_category);
categoryRoute.route('/add/subcategory').post(userAuthMiddleware,addsubcategory);
categoryRoute.route('/view/subcategory').post(userAuthMiddleware,view_sub_category);



module.exports = {categoryRoute}