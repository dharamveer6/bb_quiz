const Joi = require('joi');
const { trycatch } = require('../utils/tryCatch');
const { CreateError } = require('../utils/create_err');
const Category = require('../models/categorymodel');
const { default: mongoose } = require('mongoose');
const { connectToRabbitMQ } = require('../rabbit_config');
const { StudyMaterial } = require('../models/studyMaterialModel');


var addmaterial = async (req, res, next) => {

    const schema = Joi.object({
        cat_id: Joi.string().max(50).required(),
        display_name: Joi.string().max(50).required(),
        material_type: Joi.string().max(50).required(),

    });

    const { error } = await schema.validateAsync(req.body)

    if (!req.file) {
        throw new CreateError("FileUploadError", "pdf should not be empty")
    }



    // Extract data from the request body
    const { cat_id, display_name, material_type } = req.body;

    // Check for duplicate display_name for the same category and material type
    const existingMaterial = await StudyMaterial.findOne({ cat_id, display_name, material_type });
    if (existingMaterial) {

        throw new CreateError("CustomError", "Material with the same display name already exists for this category and material type");
    }

    var file_access = req.file
    console.log(file_access)

    const blobName = "pdf/" + Date.now() + '-' + req.file.originalname;

    var channel = await connectToRabbitMQ()

    const sen2 = JSON.stringify({ blobName, file_access })

    channel.sendToQueue("upload_public_azure", Buffer.from(sen2));


    // Create a new material object
    const newMaterial = new StudyMaterial({
        cat_id,
        display_name,
        material_type,
        filename: blobName  // Assuming req.file contains the uploaded file
    });

    // Save the material object to the database
    await newMaterial.save();

    res.json({ status: 1, message: "Material added successfully" });





}




var view_all_materials_by_type = async (req, res, next) => {

    const materialsByType = await StudyMaterial.aggregate([
        {
            $group: {
                _id: "$material_type",
                count: { $sum: 1 }
            }
        }
    ]);

    // Prepare response
    const result = materialsByType.map(material => ({
        material_type: material._id,
        count: material.count
    }));

    res.json({ status: 1, data: result });

}



var view_material_in_types = async (req, res, next) => {


    const schema = Joi.object({
        search: Joi.string().max(50).allow('').required(),
        material_type: Joi.string().max(50).required()
    });
    


    const { error } = await schema.validateAsync(req.body);

    const {search, material_type } = req.body

    // Prepare regex pattern for case-insensitive search
    const regexPattern = new RegExp(search, 'i');

    // Fetch materials matching the material_type and search query
    const materials = await StudyMaterial.find({
        material_type,
        $or: [
            { display_name: { $regex: regexPattern } },
            { filename: { $regex: regexPattern } }
        ]
    });

    res.json({ status: 1, data: materials });

}



var view_material_by_id = async (req, res, next) => {
    const schema = Joi.object({
        material_id: Joi.string().max(50).allow('').required(),
    });

    const { error } = await schema.validateAsync(req.query);

    const { material_id } = req.query
    //  // Find material by ID
    const material = await StudyMaterial.findById(material_id);

    if (!material) {
        throw new CreateError("CustomError", "Material not found");
    }

    const category = await Category.findById(material.cat_id)

    const pdf_url = `https://dvuser.brainbucks.in/quizmicro/stream/get/public?blobname=${material.filename}`

    const formattedfilename = material.filename.split('/')
    //  console.log(material.filename.split('/'))/

    


    // Create a new response object with category_name appended
    const responseData = {
        ...material.toObject(), // Convert the material to a plain JavaScript object
        category_name: category.category_name,
        filename: formattedfilename[1],
        url:pdf_url // Append category_name
    };


    // console.log(material.category_name)
    // console.log(material)
    res.json({ status: 1, data: responseData });

}



var edit_material_by_id = async (req, res, next) => {

    const schema = Joi.object({
        material_id: Joi.string().max(50).required(),
        display_name: Joi.string().max(50).required(),
        cat_id: Joi.string().max(50).required(),
        // filename: Joi.string().max(50).required(),

    });

    const { error } = await schema.validateAsync(req.body);


    const { material_id, display_name, cat_id } = req.body;

    // Find the material by ID
    const material = await StudyMaterial.findById(material_id);

    if (!material) {
        throw new CreateError("NotFoundError", "Material not found");
    }

    if (req.file) {
        var file_access = req.file
        console.log(file_access)

        const blobName = "pdf/" + Date.now() + '-' + req.file.originalname;

        var channel = await connectToRabbitMQ()

        const sen2 = JSON.stringify({ blobName, file_access })

        channel.sendToQueue("upload_public_azure", Buffer.from(sen2));

        // Update other fields
        material.display_name = display_name;
        material.cat_id = cat_id;
        material.filename = blobName
        // Save the updated material
        await material.save();

    }
    else {
        // Update other fields
        material.display_name = display_name;
        material.cat_id = cat_id;
        // Save the updated material
        await material.save();
    }





    res.json({ status: 1, message: "Material updated successfully" });

}







addmaterial = trycatch(addmaterial)
view_all_materials_by_type = trycatch(view_all_materials_by_type)
view_material_in_types = trycatch(view_material_in_types)
view_material_by_id = trycatch(view_material_by_id)
edit_material_by_id = trycatch(edit_material_by_id)


module.exports = { addmaterial, view_all_materials_by_type, view_material_in_types, view_material_by_id ,edit_material_by_id}