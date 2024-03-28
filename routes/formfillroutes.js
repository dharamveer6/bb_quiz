const express = require('express');
const { get_all_categories, get_all_sub_categories, get_all_subjects_from_subcategories } = require('../controllers/formfillcontroller');
const userAuthMiddleware = require('../middleware/user_tokenval');

const formfillroutes = express.Router()

formfillroutes.route('/get/all/category').post(userAuthMiddleware, get_all_categories);
formfillroutes.route('/get/all/subcategory').post(userAuthMiddleware, get_all_sub_categories);
formfillroutes.route('/get/all/subjects/from/subcategories').post(userAuthMiddleware, get_all_subjects_from_subcategories);




module.exports = { formfillroutes }

// done 
