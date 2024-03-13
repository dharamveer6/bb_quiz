const Joi = require('joi');
const { trycatch } = require('../utils/tryCatch');
const { CreateError } = require('../utils/create_err');
const Subject = require('../models/subjectmodel');
const {moment}=require("../utils/timezone.js")
const { connectToRabbitMQ } = require('../rabbit_config');
const Question = require('../models/questionmodel');

var add_subject=async(req,res,next)=>{
    const schema = Joi.object({
        sub_name: Joi.string().max(50).required(),
        cat_id:Joi.string().max(100).required(),
        sub_cat_id: Joi.array().items(
            Joi.string().max(100).required()
        ).required(),

    });
    const { error } = await schema.validateAsync(req.body);

    const{sub_name,cat_id}=req.body

    let category = await Subject.findOne({sub_name,cat_id});

    if(category){
        throw new CreateError("CustomError", "subject name must be unique") 
    }


    

   var update_time=moment().valueOf()





  




    const subject = new Subject({
                ...req.body,update_time
            });
    
           await subject.save();

           res.send({status:1,msg:"Subject create succesfully"})









}


var view_subjects=async(req,res,next)=>{
    const schema = Joi.object({
        page: Joi.number().integer().allow(0).required(),
        limit: Joi.number().integer().allow(0).required(),
        search: Joi.string().max(50).allow('').required()
    });

    const { error } = await schema.validateAsync(req.query);

    var { page, limit, search } = req.query;
    page=parseInt(page)
    limit=parseInt(limit)

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    // Construct search filter
    const searchFilter = search ? { sub_name: { $regex: new RegExp(search, 'i') } } : {};


    // Count total categories for pagination
    const totalsubjects = await Subject.countDocuments(searchFilter);

    // Calculate total pages
    const totalPages = Math.ceil(totalsubjects / limit);

    // Find categories with pagination and search filter
    const subjects = await Subject.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'cat_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: '$category'
        },
        {
          $lookup: {
            from: 'subcategories',
            localField: 'sub_cat_id',
            foreignField: '_id',
            as: 'subcategories'
          }
        },
        {
            $unwind: '$subcategories'
          },
        {
          $project: {
            sub_name: 1,
            category_name: '$category.category_name', // Extract category_name directly
            sub_category_names: '$subcategories.sub_category_name' ,
            update_time :1// Extract sub_category_names directly
          }
        },
        {
          $group: {
            _id: '$_id',
            update_time:{ $first: '$update_time' },
            sub_name: { $first: '$sub_name' },
            category: { $first: '$category_name' }, // Rename category_name to category
            subcategories: { $push: '$sub_category_names' } // Group sub_category_names into an array
          }
        },
        {
          $skip: skip // Skip documents based on pagination
        },
        {
          $limit: limit // Limit the number of documents based on pagination
        }
      ]);


      for(let i of subjects){
        i.update_time=moment(i.update_time).format("DD-MM-YYYY HH:mm:ss")
      }
    res.json({
        status: 1,
        subjects: subjects,
        totalPages:totalPages
    });
}

var insert_single_question=async(req,res,next)=>{
    
    const schema = Joi.object({
        question:Joi.string().max(250).required(),
        is_opt_img:Joi.number().integer().min(0).max(1).required(),
       ans:Joi.number().min(1).max(4).integer().required(),
        sub_id:Joi.string().max(250).required(),
  
      
  
      
     
     }).unknown(true);
  
     
    
     
    
    
    
    
    const { error } =  await schema.validateAsync(req.body);

   const channel=await connectToRabbitMQ()
  
    
      var {question,is_opt_img,topic_id,ans}=req.body
     is_opt_img=parseInt(is_opt_img)
  
      
  
      if(is_opt_img && req.files['question_url']){


        var op1file_access = req.files['option1'][0]
        var op2file_access = req.files['option2'][0]
        var op3file_access = req.files['option3'][0]
        var op4file_access = req.files['option4'][0]

        const op1blobName = "image/" + Date.now() + '-' + req.files['option1'][0].originalname;
        const op2blobName = "image/" + Date.now() + '-' + req.files['option2'][0].originalname;
        const op3blobName = "image/" + Date.now() + '-' + req.files['option3'][0].originalname;
        const op4blobName = "image/" + Date.now() + '-' + req.files['option4'][0].originalname;

        const sen1 = JSON.stringify({ op1blobName, op1file_access })
        const sen2 = JSON.stringify({ op2blobName, op2file_access })
        const sen3 = JSON.stringify({ op3blobName, op3file_access })
        const sen4 = JSON.stringify({ op4blobName, op4file_access })

        channel.sendToQueue("upload_public_azure", Buffer.from(sen1));
        channel.sendToQueue("upload_public_azure", Buffer.from(sen2));
        channel.sendToQueue("upload_public_azure", Buffer.from(sen3));
        channel.sendToQueue("upload_public_azure", Buffer.from(sen4));


        const qu1blobName = "image/" + Date.now() + '-' + req.files['question_url'][0].originalname;
        var qu1file_access = req.files['question_url'][0]

        const sen11 = JSON.stringify({ qu1blobName, qu1file_access })

        channel.sendToQueue("upload_public_azure", Buffer.from(sen11));




        const question = new Question({question,sub_id,is_ques_img:1,is_opt_img,option1:op1blobName,option2:op2blobName,option3:op3blobName,option4:op4blobName,question_url:baseUrl+qu1blobName,ans});

       await question.save();
  
      
        return res.send({status:1,msg:"insert succesfully"})
      }
  
      else if(!is_opt_img && req.files['question_url']){

        const op1blobName = "image/" + Date.now() + '-' + req.files['question_url'][0].originalname;
        var op1file_access = req.files['question_url'][0]

        const sen1 = JSON.stringify({ op1blobName, op1file_access })

        channel.sendToQueue("upload_public_azure", Buffer.from(sen1));
      
        const question = new Question({question,sub_id,is_ques_img:1,is_opt_img,option1:req.body.option1,option2:req.body.option2,option3:req.body.option3,option4:req.body.option4,question_url:op1blobName,ans});

        await question.save();
      
        return res.send({status:1,msg:"insert succesfully"})
      }
  
      else if(is_opt_img && !req.files['question_url'] ){
        console.log('CH')

        var op1file_access = req.files['option1'][0]
        var op2file_access = req.files['option2'][0]
        var op3file_access = req.files['option3'][0]
        var op4file_access = req.files['option4'][0]

        const op1blobName = "image/" + Date.now() + '-' + req.files['option1'][0].originalname;
        const op2blobName = "image/" + Date.now() + '-' + req.files['option2'][0].originalname;
        const op3blobName = "image/" + Date.now() + '-' + req.files['option3'][0].originalname;
        const op4blobName = "image/" + Date.now() + '-' + req.files['option4'][0].originalname;

        const sen1 = JSON.stringify({ op1blobName, op1file_access })
        const sen2 = JSON.stringify({ op2blobName, op2file_access })
        const sen3 = JSON.stringify({ op3blobName, op3file_access })
        const sen4 = JSON.stringify({ op4blobName, op4file_access })

        channel.sendToQueue("upload_public_azure", Buffer.from(sen1));
        channel.sendToQueue("upload_public_azure", Buffer.from(sen2));
        channel.sendToQueue("upload_public_azure", Buffer.from(sen3));
        channel.sendToQueue("upload_public_azure", Buffer.from(sen4));
        const question = new Question({question,sub_id,is_ques_img:0,is_opt_img,option1:op1blobName,option2:op2blobName,option3:op3blobName,option4:op4blobName,question_url:"",ans});

        await question.save();
      
      
        return res.send({status:1,msg:"insert succesfully"})
      }
  
      else{

        const question = new Question({question,sub_id,is_ques_img:0,is_opt_img,option1:req.body.option1,option2:req.body.option2,option3:req.body.option3,option4:req.body.option4,question_url:"",ans});

        await question.save();
      
        
        
  
      
        return res.send({status:1,msg:"insert succesfully"})
      }
      
}


var add_single_question=async(req,res,next)=>{
    
}


add_subject=trycatch(add_subject)
view_subjects=trycatch(view_subjects)

module.exports={add_subject,view_subjects}