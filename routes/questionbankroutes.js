const express=require('express');
const { add_subject, view_subjects, insert_single_question } = require('../controllers/questionbankcontroller');
const { uploadimage } = require('../utils/imgmulter');



const questionbankRoute = express.Router();


questionbankRoute.route('/add/subject').post(add_subject);
questionbankRoute.route('/view/subject').get(view_subjects);
// questionbankRoute.route('/add/single/question').post(uploadimage.array(["option1","option2","option3","option4","question_url"]),insert_single_question);

questionbankRoute.route('/add/single/question').post(uploadimage.fields([{name:"option1", maxCount: 1},{name:"option2", maxCount: 1},{name:"option3", maxCount: 1},{name:"option4", maxCount: 1},{name:"question_url", maxCount: 1}]),insert_single_question);
// questionbankRoute.route('/add/subcategory').post(addsubcategory);
// questionbankRoute.route('/view/subcategory').post(view_sub_category);



module.exports = {questionbankRoute}