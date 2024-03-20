const express=require('express');
const { uploadimage } = require('../utils/imgmulter');
const { add_Quiz, get_quiz, update_quiz } = require('../controllers/QuizController');
const quizRoute=express.Router();

quizRoute.route('/add/quiz').post(uploadimage.single('image'),add_Quiz);
// quizRoute.route('/update/quiz').post(uploadimage.single('image'),update_quiz);
quizRoute.route('/get/quiz').get(get_quiz);

module.exports={quizRoute}