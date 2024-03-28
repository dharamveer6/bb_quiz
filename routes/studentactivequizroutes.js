const express = require('express');
const userAuthMiddleware = require('../middleware/user_tokenval');
const { registor_to_active_quiz, join_Activequiz_by_student, submmit_activequiz } = require('../controllers/studentactivequizcontroller');

const studentactivequizRoutes = express.Router()

studentactivequizRoutes.route('/register/active/quiz').post(userAuthMiddleware,registor_to_active_quiz);
studentactivequizRoutes.route('/join/activeQuiz/student').post(userAuthMiddleware,join_Activequiz_by_student);
studentactivequizRoutes.route('/submit/active/quiz').post(userAuthMiddleware,submmit_activequiz);




module.exports = { studentactivequizRoutes }

// done 
