const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_HOST,
    host:"smtp.gmail.com",
    port:process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});
// oxvxchgmbufvtiky

module.exports = transporter; 
