const express=require('express');
const { createTriviaQuizz, getQuizz, viewDetails, chnageBanner, changeRules, updateReward, changeTimePerQues, updateStatus } = require('../controllers/triviaQuizzController');
const { uploadimage } = require('../utils/imgmulter');
const triviaRoute=express.Router();

triviaRoute.route('/create/quizz').post(uploadimage.single('banner'),createTriviaQuizz);
triviaRoute.route('/get/quizz').get(getQuizz);
triviaRoute.route('/view/details').get(viewDetails);
triviaRoute.route('/change/banner').post(uploadimage.single('banner'),chnageBanner);
triviaRoute.route('/change/rules').post(changeRules);
triviaRoute.route('/update/reward').post(updateReward);
triviaRoute.route('/changes/time/perquestion').post(changeTimePerQues);
triviaRoute.route('/changes/repeat').post(updateStatus);

module.exports={triviaRoute}