    const mongoose = require("mongoose");


    const schema = new mongoose.Schema({
        name: { type: String },

        phone: {
            type: Number,
        },
        email: {
            type: String,
        },

        Password: {
            type: String
        },
        otp:{
            type:String
        },
        token: {
            type: String
        },
        refer_id:{
            type:String
        },
        refer_by:{
            type:String
        },
        wallet: {
            type: Number,
            default : 0 
        },
        fcm_key:{
        type:String
        },
        socket_key:{
        type:String
        }
    });

    const participantModel = mongoose.model("Participants", schema);
    module.exports = participantModel