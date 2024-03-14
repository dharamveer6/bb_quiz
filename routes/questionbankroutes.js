const express=require('express');
const { add_subject, view_subjects } = require('../controllers/questionbankcontroller');



const questionbankRoute = express.Router();


questionbankRoute.route('/add/subject').post(add_subject);
questionbankRoute.route('/view/subject').get(view_subjects);
// questionbankRoute.route('/add/subcategory').post(addsubcategory);
// questionbankRoute.route('/view/subcategory').post(view_sub_category);



module.exports = {questionbankRoute}