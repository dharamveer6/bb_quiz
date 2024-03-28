const express=require('express');
const { uploadimage } = require('../utils/imgmulter');
const { add_Quiz, get_quiz, update_quiz } = require('../controllers/QuizController');
const { join_quiz_by_student, submmit_triviaquiz } = require('../controllers/studenttriviaquizcontroller');
const triviastudentrouter=express.Router();

triviastudentrouter.route('/join/quiz').post(join_quiz_by_student);
triviastudentrouter.route('/submit/quiz').post(submmit_triviaquiz);
// triviastudentrouter.route('/get/quiz').get(get_quiz);

module.exports={triviastudentrouter}