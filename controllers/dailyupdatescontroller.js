const Joi = require('joi');
const { trycatch } = require('../utils/tryCatch');
const { CreateError } = require('../utils/create_err');
const Category = require('../models/categorymodel');
const { default: mongoose } = require('mongoose');
const { connectToRabbitMQ } = require('../rabbit_config');
const { StudyMaterial } = require('../models/studyMaterialModel');
const { DailyUpdates } = require('../models/dailyupdatesmodel');
const {moment}=require("../utils/timezone.js")



var add_update = async(req,res,next)=>{

    
    const schema = Joi.object({
        sch_time: Joi.string().regex(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/)
        .message('Invalid date-time format. Please use DD-MM-YYYY HH:mm:ss'),
        headline: Joi.string().max(50).required(),
        description: Joi.string().max(1000).required(),

    });

    const {error} = await schema.validateAsync(req.body)


    const {sch_time,headline,description} = req.body

    // if (!req.file) {
    //     throw new CreateError("FileUploadError", "image should not be empty")
    // }


    // Check if an update with the same headline already exists
    const existingUpdate = await DailyUpdates.findOne({ headline: req.body.headline });
    if (existingUpdate) {
        throw new Error("An update with the same headline already exists.");
    }

    // return res.json(moment().valueOf(sch_time))
    var file_access = req.file
    console.log(file_access)

    const blobName = "image/" + Date.now() + '-' + req.file.originalname;

    var channel = await connectToRabbitMQ()

    const sen2 = JSON.stringify({ blobName, file_access })

    channel.sendToQueue("upload_public_azure", Buffer.from(sen2));

    const formattime = moment(sch_time, 'DD-MM-YYYY HH:mm:ss').valueOf()

    // return res.json(formattime)

    const newUpdate = new DailyUpdates({
        banner_image: blobName,
        scheduled_time:formattime ,
        headline: headline,
        details: description
    });


    // Save the update to the database
    await newUpdate.save();

    res.json({
        status: 1,
        message: "Update added successfully"
    });

}


var view_updates = async(req,res,next)=>{

     // Find all updates
    let updates = await DailyUpdates.find({});

    let upds = []

    for(i of updates){
        
       var a =  i.toObject()
       a.scheduled_time =  moment(a.scheduled_time).format('YYYY-MM-DD HH:mm:ss');
       a.banner_image = `https://dvuser.brainbucks.in/quizmicro/stream/get/public?blobname=${a.banner_image}`
        // console.log(a)
        upds.push(a)
    }

    res.json({
        status: 1,
        updates: upds
    });


}





add_update = trycatch(add_update)
view_updates = trycatch(view_updates)

module.exports = {add_update,view_updates}