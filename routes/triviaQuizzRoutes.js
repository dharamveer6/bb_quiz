const express=require('express');
const { createTriviaQuizz, getQuizz, viewDetails } = require('../controllers/triviaQuizzController');
const { uploadimage } = require('../utils/imgmulter');
const triviaRoute=express.Router();

triviaRoute.route('/create/quizz').post(uploadimage.single('banner'),createTriviaQuizz);
triviaRoute.route('/get/quizz').get(getQuizz);
triviaRoute.route('/view/details').get(viewDetails);

module.exports={triviaRoute}