const path = require('path');
const multer = require('multer');
const { CreateError } = require('./create_err');



const storage = multer.memoryStorage();

const pdfFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf'];
  const fileExtension = path.extname(file.originalname);
  if (
    allowedExtensions.includes(fileExtension.toLowerCase())

  ) {
    cb(null, true);
  } else {
    cb(new CreateError("FileValError", "Only pdf are allowed"));
  }
};


const uploadpdf = multer({
  storage: storage,
  fileFilter: pdfFilter // Add the file filter to the multer options
});

module.exports = { uploadpdf };