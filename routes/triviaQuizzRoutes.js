const express=require('express');
const { createTriviaQuizz, getQuizz } = require('../controllers/triviaQuizzController');
const triviaRoute=express.Router();

triviaRoute.route('/create/quizz').post(createTriviaQuizz);
triviaRoute.route('/get/quizz').get(getQuizz);

module.exports={triviaRoute}