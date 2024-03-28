const express = require('express');
const { uploadimage } = require('../utils/imgmulter');
const { createActiveQuiz, getActiveQuiz, view_history_of_active_quiz, viewDetailsofActivequiz, chnageBanner, changeRules, updateEntryFees, changeTimePerQues, updateStatus, change_category_of_Activequiz, change_subcategory_of_quiz, change_subject_for_quiz, change_no_question_for_quiz, view_winner_and_participants_of_Active_quiz } = require('../controllers/activequizcontroller');
const activeRoute = express.Router();


activeRoute.route('/change/banner').post(uploadimage.single('banner'), chnageBanner);
activeRoute.route('/change/rules').post(changeRules);
activeRoute.route('/update/entry/fees').post(updateEntryFees);
activeRoute.route('/changes/time/perquestion').post(changeTimePerQues);
activeRoute.route('/changes/repeat').post(updateStatus);
activeRoute.route('/view/winners/of/activequiz').post(view_winner_and_participants_of_Active_quiz);

activeRoute.route('/changes/category').post(change_category_of_Activequiz);
activeRoute.route('/changes/subcategory').post(change_subcategory_of_quiz);
activeRoute.route('/changes/subject').post(change_subject_for_quiz);
activeRoute.route('/changes/numberof/quiz').post(change_no_question_for_quiz);

activeRoute.route('/create/quiz').post(uploadimage.single('banner'), createActiveQuiz);
activeRoute.route('/get/quiz').get(getActiveQuiz);
activeRoute.route('/view/details').get(viewDetailsofActivequiz);
activeRoute.route('/view/history/of/activequiz').post(view_history_of_active_quiz);

module.exports = { activeRoute }


