const mongoose = require('mongoose');

// Define admin schema
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  token: {
    type: String
  },
  otp: {
    type: String
  },
  fcm_key:{
    type:String
  },
  socket_key:{
    type:String
  }
});

// Create and export Admin model
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;