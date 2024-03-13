const express = require('express');

const userAuthMiddleware = require('../middleware/user_tokenval');
const { admin_tokenval } = require('../middleware/admin_tokenval');
const { get_public_data_from_azure } = require('../controllers/azurestreamcontroller');
const azurestreamroute = express.Router()

azurestreamroute.route('/get/public').get(get_public_data_from_azure);
// azurestreamroute.route('/task/assigntasks').post(admin_tokenval,assigntasksbyadmin);

module.exports = {azurestreamroute}