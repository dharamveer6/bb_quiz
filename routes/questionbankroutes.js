const express=require('express');
const { add_subject, view_subjects, insert_single_question, add_bulk_question, view_edit_page_for_subject, update_category_of_subject, insert_new_subcategory, delete_new_subcategory } = require('../controllers/questionbankcontroller');
const { uploadimage } = require('../utils/imgmulter');
const { uploadexcel } = require('../utils/exlmulter');



const questionbankRoute = express.Router();


questionbankRoute.route('/add/subject').post(add_subject);
questionbankRoute.route('/view/subject').get(view_subjects);
// questionbankRoute.route('/add/single/question').post(uploadimage.array(["option1","option2","option3","option4","question_url"]),insert_single_question);

questionbankRoute.route('/add/single/question').post(uploadimage.fields([{name:"option1", maxCount: 1},{name:"option2", maxCount: 1},{name:"option3", maxCount: 1},{name:"option4", maxCount: 1},{name:"question_url", maxCount: 1}]),insert_single_question);
questionbankRoute.route('/add/excel/questions').post(uploadexcel.single("excel"),add_bulk_question);
questionbankRoute.route('/view/edit/page/subject').post(view_edit_page_for_subject);
questionbankRoute.route('/update/category/for/subject').post(update_category_of_subject);
questionbankRoute.route('/insert/subcategory/for/subject').post(insert_new_subcategory);
questionbankRoute.route('/delete/subcategory/for/subject').post(delete_new_subcategory);
// questionbankRoute.route('/view/subcategory').post(view_sub_category);



module.exports = {questionbankRoute}