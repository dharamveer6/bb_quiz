const jwt = require('jsonwebtoken');
const userModel=require('../models/userSchema');
const { trycatch } = require('../utils/tryCatch');
const { CreateError } = require('../utils/create_err');



let userAuthMiddleware = async (req, res, next) => {
    console.log("hyyyy")
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
        const user = await userModel.findOne({ _id: decoded._id, email: decoded.email, token });
        if (!user) {
            throw new CreateError("TokenError", "token not match in table")
        }

        // Attach admin to request object
        req.user = user;
        // okokok

        // Move to next middleware
        next();
   
};

userAuthMiddleware=trycatch(userAuthMiddleware)

module.exports = userAuthMiddleware;