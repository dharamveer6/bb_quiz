const express=require('express');
const { add_subject, view_subjects, insert_single_question, add_bulk_question, view_edit_page_for_subject, update_category_of_subject, insert_new_subcategory, delete_new_subcategory, del_question, get_questions_in_subject } = require('../controllers/questionbankcontroller');
const { uploadimage } = require('../utils/imgmulter');
const { uploadexcel } = require('../utils/exlmulter');
const userAuthMiddleware = require('../middleware/user_tokenval');



const questionbankRoute = express.Router();


questionbankRoute.route('/add/subject').post(userAuthMiddleware,add_subject);
questionbankRoute.route('/view/subject').get(userAuthMiddleware,view_subjects);
questionbankRoute.route('/add/single/question').post(userAuthMiddleware,uploadimage.fields([{name:"option1", maxCount: 1},{name:"option2", maxCount: 1},{name:"option3", maxCount: 1},{name:"option4", maxCount: 1},{name:"question_url", maxCount: 1}]),insert_single_question);
questionbankRoute.route('/add/excel/questions').post(userAuthMiddleware,uploadexcel.single("excel"),add_bulk_question);


questionbankRoute.route('/view/edit/page/subject').post(userAuthMiddleware,view_edit_page_for_subject);
questionbankRoute.route('/update/category/for/subject').post(userAuthMiddleware,update_category_of_subject);
questionbankRoute.route('/insert/subcategory/for/subject').post(userAuthMiddleware,insert_new_subcategory);
questionbankRoute.route('/delete/subcategory/for/subject').post(userAuthMiddleware,delete_new_subcategory);
questionbankRoute.route('/delete/question/for/subject').post(userAuthMiddleware,del_question);
questionbankRoute.route('/get/question/for/subject').post(userAuthMiddleware,get_questions_in_subject);

// 




module.exports = {questionbankRoute}