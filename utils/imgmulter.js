const path=require('path');
const multer= require('multer');
const { CreateError } = require('./create_err');



const storage = multer.memoryStorage();



  const imgFilter = (req, file, cb) => {
    const allowedExtensions = [".jpg" , ".png" , ".jpeg"];
    const fileExtension = path.extname(file.originalname);
  
    if (
      allowedExtensions.includes(fileExtension.toLowerCase())
      
    ) {
      cb(null, true);
    } else {
        cb(new CreateError("FileValError","Only pdf  are allowed"));
    }
  };
  
  
  const uploadimage = multer({
    storage: storage,
    fileFilter: imgFilter // Add the file filter to the multer options
  });
  
  module.exports={uploadimage};