const jwt = require('jsonwebtoken');
const Admin = require('../models/adminmodel');
const { CreateError } = require('../utils/create_err');
const { trycatch } = require('../utils/tryCatch');



var admin_tokenval = async (req, res, next) => {
        // Check if authorization header is present
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new CreateError('TokenError',"Header is empty");
        }

        // Extract token from authorization header
        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Check if admin exists in the database
        const admin = await Admin.findOne({ _id: decoded._id, email: decoded.email, token });
        if (admin.token !== token) {
            throw new CreateError("TokenError", "token not match in table")
        }

        // Attach admin to request object
        req.admin = admin;

        // Move to next middleware
        next();
   
};

admin_tokenval  = trycatch(admin_tokenval)

module.exports = {admin_tokenval};
