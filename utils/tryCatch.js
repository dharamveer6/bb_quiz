const mongoose = require("mongoose");


const trycatch = (controller) => {
  return async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
      // Start a MongoDB transaction (MongoDB transactions require a replica set)
      session.startTransaction();

      // Pass the session to the controller function
      await controller(req, res, next);

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      console.log("Transaction committed successfully");
    } catch (err) {
      console.log(err);
      // Rollback the transaction on error
      await session.abortTransaction();
      session.endSession();
      console.log("Transaction rolled back");
      // Handle different types of errors
      if (err.name === 'ValidationError') {
        return res.send({ status:"VAL_ERR", Backend_Error:err.message });
      }
      // If the error is a transaction error
     else if (err.name === 'TransactionError') {
        // Send the transaction error message
        return res.send({ status:"TXN_ERR", Backend_Error: err.message });
      }
      else if (err.name === 'FileUploadError') {
        // Send the transaction error message
        return res.send({ status:"FILE_ERR", Backend_Error: err.message });
      }

      else if(err.name === 'CustomError'){
        return res.send({ status:"CUSTOM_ERR", Backend_Error: err.message });
      }

      else if(err.name === 'TokenError'){
        return res.send({ status:"TOKEN_ERR", Backend_Error: err.message });
      }
      else{
        return res.send({ status:"INT_ERR",  Backend_Error: err.message });
      }
    }
  };
};

module.exports = { trycatch };