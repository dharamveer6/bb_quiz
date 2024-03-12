const mongoose=require("mongoose");
// const validator=require("validator")/

const schema=new mongoose.Schema({
    name:{type:String},

    email:{
        type:String,
    },

    password:{
        type:String
    },
    otp:{
      type:String
  },
    token:{
        type:String
    },
    fcm_key:{
      type:String
    },
    socket_key:{
      type:String
    }
});

const userModel=mongoose.model("users",schema);
module.exports=userModel