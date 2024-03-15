const path=require('path');
const multer= require('multer');
const { CreateError } = require('./create_err');



const storage = multer.memoryStorage();



  const exlFilter = (req, file, cb) => {
    const allowedExtensions = [".xlsx",".xls"];
    const fileExtension = path.extname(file.originalname);
  
    if (
      allowedExtensions.includes(fileExtension.toLowerCase())
      
    ) {
      cb(null, true);
    } else {
        cb(new CreateError("FileUploadError","Only excel  are allowed"));
    }
  };
  
  
  const uploadexcel = multer({
    storage: storage,
    fileFilter: exlFilter // Add the file filter to the multer options
  });
  
  module.exports={uploadexcel};