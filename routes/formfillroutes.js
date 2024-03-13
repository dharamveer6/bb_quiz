const express = require('express');
const { get_all_categories, get_all_sub_categories } = require('../controllers/formfillcontroller');

const formfillroutes = express.Router()

formfillroutes.route('/get/all/category').post(get_all_categories);
formfillroutes.route('/get/all/subcategory').post(get_all_sub_categories);



module.exports = {formfillroutes}