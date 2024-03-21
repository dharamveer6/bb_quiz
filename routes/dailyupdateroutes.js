const express = require('express');
const { uploadimage } = require('../utils/imgmulter');
const { add_update, view_updates } = require('../controllers/dailyupdatescontroller');
const userAuthMiddleware = require('../middleware/user_tokenval');
const dailyupdateRoute =  express.Router()


dailyupdateRoute.route('/add/update').post(userAuthMiddleware,uploadimage.single('image'),add_update);
dailyupdateRoute.route('/view/updates').get(userAuthMiddleware,view_updates);



module.exports = {dailyupdateRoute}