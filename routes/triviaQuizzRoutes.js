const express=require('express');
const { createTriviaQuizz, getQuizz } = require('../controllers/triviaQuizzController');
const { uploadimage } = require('../utils/imgmulter');
const triviaRoute=express.Router();

triviaRoute.route('/create/quizz').post(uploadimage.single('banner'),createTriviaQuizz);
triviaRoute.route('/get/quizz').get(getQuizz);

module.exports={triviaRoute}