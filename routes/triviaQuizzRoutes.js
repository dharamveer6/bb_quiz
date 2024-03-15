const express=require('express');
const { createTriviaQuizz } = require('../controllers/triviaQuizzController');
const triviaRoute=express.Router();

triviaRoute.route('/create/quizz').post(createTriviaQuizz);

module.exports={triviaRoute}