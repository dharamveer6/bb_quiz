const express = require('express');
const { uploadimage } = require('../utils/imgmulter');
const { createActiveQuiz, getActiveQuiz, view_history_of_active_quiz, viewDetailsofActivequiz } = require('../controllers/activequizcontroller');
const activeRoute = express.Router();

activeRoute.route('/create/quiz').post(uploadimage.single('banner'), createActiveQuiz);
activeRoute.route('/get/quiz').get(getActiveQuiz);
activeRoute.route('/view/details').get(viewDetailsofActivequiz);
activeRoute.route('/view/history/of/activequiz').post(view_history_of_active_quiz);

module.exports = { activeRoute }