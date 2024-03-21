const express=require('express');
const { addmaterial, view_all_materials_by_type, view_material_in_types, view_material_by_id, edit_material_by_id } = require('../controllers/studymaterialcontroller');
const { uploadpdf } = require('../utils/pdfmulter');
const userAuthMiddleware = require('../middleware/user_tokenval');

const studymaterialRoute=express.Router();

studymaterialRoute.route('/add/material').post(userAuthMiddleware,uploadpdf.single('pdf'),addmaterial);
studymaterialRoute.route('/get/materials').get(userAuthMiddleware,view_all_materials_by_type);
studymaterialRoute.route('/get/materials/in/type').get(userAuthMiddleware,view_material_in_types);
studymaterialRoute.route('/view/material/by/id').get(userAuthMiddleware,view_material_by_id);
studymaterialRoute.route('/edit/material/by/id').post(userAuthMiddleware,uploadpdf.single('pdf'),edit_material_by_id);


module.exports = {studymaterialRoute}