const express=require('express');
const { add_subject } = require('../controllers/questionbankcontroller');



const questionbankRoute = express.Router();


questionbankRoute.route('/add/subject').post(add_subject);
// questionbankRoute.route('/view/category').post(view_category);
// questionbankRoute.route('/add/subcategory').post(addsubcategory);
// questionbankRoute.route('/view/subcategory').post(view_sub_category);



module.exports = {questionbankRoute}