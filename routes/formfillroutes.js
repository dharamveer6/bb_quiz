const express = require('express');
const { get_all_categories, get_all_sub_categories } = require('../controllers/formfillcontroller');
const userAuthMiddleware = require('../middleware/user_tokenval');
const { add_Quiz } = require('../controllers/QuizController');

const formfillroutes = express.Router()

formfillroutes.route('/get/all/category').post(userAuthMiddleware, get_all_categories);
formfillroutes.route('/get/all/subcategory').post(userAuthMiddleware, get_all_sub_categories);
formfillroutes.route('/add/quiz').post(add_Quiz);



module.exports = { formfillroutes }