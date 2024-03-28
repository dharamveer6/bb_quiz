const express = require('express');
const { uploadimage } = require('../utils/imgmulter');
const { createActiveQuiz, getActiveQuiz, view_history_of_active_quiz, viewDetailsofActivequiz } = require('../controllers/activequizcontroller');
const activeRoute = express.Router();


// triviaRoute.route('/change/banner').post(uploadimage.single('banner'),chnageBanner);
// triviaRoute.route('/change/rules').post(changeRules);
// triviaRoute.route('/update/reward').post(updateReward);
// triviaRoute.route('/changes/time/perquestion').post(changeTimePerQues);
// triviaRoute.route('/changes/repeat').post(updateStatus);
// triviaRoute.route('/view/winners/of/subtriviaquiz').post(view_winner_and_participants_of_subtrivia);

// triviaRoute.route('/changes/category').post(change_category_of_quiz);
// triviaRoute.route('/changes/subcategory').post(change_subcategory_of_quiz);
// triviaRoute.route('/changes/subject').post(change_subject_for_quiz);
// triviaRoute.route('/changes/numberof/quiz').post(change_no_question_for_quiz);

activeRoute.route('/create/quiz').post(uploadimage.single('banner'), createActiveQuiz);
activeRoute.route('/get/quiz').get(getActiveQuiz);
activeRoute.route('/view/details').get(viewDetailsofActivequiz);
activeRoute.route('/view/history/of/activequiz').post(view_history_of_active_quiz);

module.exports = { activeRoute }


