const express=require('express');
const { createTriviaQuizz, getQuizz, viewDetails, chnageBanner, changeRules, updateReward, changeTimePerQues, updateStatus, view_history_of_trivia_quiz, view_winner_and_participants_of_subtrivia, change_category_of_quiz, change_subcategory_of_quiz, change_subject_for_quiz, change_no_question_for_quiz } = require('../controllers/triviaQuizzController');
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
triviaRoute.route('/view/history/of/triviaquiz').post(view_history_of_trivia_quiz);
triviaRoute.route('/view/winners/of/subtriviaquiz').post(view_winner_and_participants_of_subtrivia);

triviaRoute.route('/changes/category').post(change_category_of_quiz);
triviaRoute.route('/changes/subcategory').post(change_subcategory_of_quiz);
triviaRoute.route('/changes/subject').post(change_subject_for_quiz);
triviaRoute.route('/changes/numberof/quiz').post(change_no_question_for_quiz);

module.exports={triviaRoute}