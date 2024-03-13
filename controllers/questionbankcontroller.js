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


var add_bulk_question=async(req,res,next)=>{
    var data=req.body;

  
    const schema = Joi.object({
      
        sub_id:Joi.string().max(100).required()
  
       
      }).unknown("true");
  
      const { error } =  await schema.validateAsync(req.body);
  
      const {sub_id}=data
  
      if(!req.file){
        throw new CreateError("FileUploadError","upload the excel file of questions")
      }
  
  
      
      const buffer = req.file.buffer;
          
          
         
           
        
        
      const workbook = new exceljs.Workbook();
  
      await workbook.xlsx.load(buffer);
      // console.log(filepath)
  
      const worksheet = workbook.getWorksheet(1);
    const column_change = [];
  
    
  
    var raw_temp1=  worksheet.getRow(1)
  
    bigindex=0
  
    raw_temp1.eachCell((cell, colNumber) => {
      // Check if the cell has a value (not empty)
      bigindex+=1
    });
  
  
   
  
    for(let j=1;j<=bigindex;j++){
  
     var cell= raw_temp1.getCell(j);
  
     if (cell.hasRichText) {
        // Initialize an empty string to store the plain text
        let plainText = '';
  
        // Iterate through rich text runs and concatenate the text
        cell.richText.forEach((richTextRun) => {
          plainText += richTextRun.text;
        });
  
        if (!plainText) {
          throw new CreateError("CustomError",`empty cell in the 1st row`)
        }
  
        // Push the plain text to the 'data' array
        column_change.push(plainText.trim());
      }
  
      else {
        // If the cell does not have rich text, check for null or undefined values
        if (cell.value === null || cell.value === undefined) {
          throw new CreateError("CustomError",`empty cell in the 1st row`)
        } else {
          column_change.push(cell.value.trim());
        }
      }
  
  
    }
  
  
  
  
  
  
   
  // check columns name correct or not 
  
  var check_val_ar=[
    "question", "option1",
    "option2", "option3", "option4", "ans",
    
  ]
  
  console.log(column_change)
  
  
  function check_column_fun(columns,check_val_ar){
     for(let i of columns){
  
      
        if (check_val_ar.indexOf(i) == -1) {
          
            return false
          
          }
     }
     return true
  }
  
  var_for_excelformate=check_column_fun(column_change,check_val_ar);
  
  if(!var_for_excelformate){
    throw new CreateError("FileUploadError","incorrect excel format")
  }
  
  let lastRow = worksheet.rowCount; // Start with the last row
    while (lastRow > 1) {
      const row = worksheet.getRow(lastRow);
      const rowData = row.values.map((value) => value ? value.toString() : '');
      const isRowEmpty = rowData.every((value) => value.trim() === '');
  
      if (!isRowEmpty) {
        break;
      }
  
      lastRow--;
    }
  
  
    var bulk_insert=[]
  
  
  
    for(let i =2;i<=lastRow;i++){
  
      let data=[]
  
      var raw_temp=worksheet.getRow(i);
   
    for(let j=1;j<=bigindex;j++){
  
     var cell= raw_temp.getCell(j);
  
     if (cell.value?.richText) {
      // console.log("check in rich")
      // Initialize an empty string to store the plain text
      let plainText ='';
  
      // Iterate through rich text runs and concatenate the text
      cell.value.richText.forEach((richTextRun) => {
        plainText += richTextRun.text;
      });
  
      if (!plainText) {
        throw new CreateError("CustomError",`empty cell in the ${i} row  and column is ${j}`)
      }
  
      console.log(plainText)
  
    
  
      // Push the plain text to the 'data' array
      data.push(plainText);
    }
  
    else {
      // console.log(cell.value)
      // If the cell does not have rich text, check for null or undefined values
      if (cell.value === null || cell.value === undefined) {
        throw new CreateError("CustomError",`empty cell in the ${i} row and column is ${j}`)
      } else {
  
        var val=cell.value.toString()
     
          data.push(val);
        
      }
    }
  
  
   
  
    }
   
  
       
  
  
       
  
  
   
  
        let insert_data={}
  
        for (let j in check_val_ar){
          
          insert_data[check_val_ar[j]]=data[j]
  
        }
  
        var final_data={...insert_data,sub_id:sub_id}
  
        bulk_insert.push(final_data);
  
        if(bulk_insert.length >= 1000){
  
          const sen1=JSON.stringify(bulk_insert);
          const channel=await consumeMessages();
   
      
          channel.sendToQueue("store_prerec__question_excel", Buffer.from(sen1));
  
         
      
              bulk_insert=[]
      
            }
  
  
  
  
      }
  
      // console.log(bulk_insert)
  
      if(bulk_insert.length!==0){
       
  
        const channel=await consumeMessages();
  
        const sen1=JSON.stringify(bulk_insert);
    
     
        
        channel.sendToQueue("store_prerec__question_excel", Buffer.from(sen1));
        bulk_insert=[]
      }
      
  
     
  
      res.send({status:1,msg:"excel upload succesfully"})
  
}


add_subject=trycatch(add_subject)
view_subjects=trycatch(view_subjects)

module.exports={add_subject,view_subjects}