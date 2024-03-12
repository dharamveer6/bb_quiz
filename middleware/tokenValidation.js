const jwt = require('jsonwebtoken')

const { trycatch } = require('../utils/tryCatch')
const { CreateError } = require('../utils/create_err')
const participantModel = require('../models/participantModel')

var tokenValidation = async (req, res, next) => {

    
    const header = req.headers.authorization;
    if (!header) {
        return res.send({ message: "Headers is empty" })
    }
    else {
        const token = header.split(' ')[1];
        // console.log(token)

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log(decoded);

        const verification = await participantModel.findOne({ _id: decoded._id, email: decoded.email, token });

        if (!verification) {
            throw new CreateError("TokenError", "token not match in table")

        }

        req.participant = verification;
        next();

    }
}

tokenValidation = trycatch(tokenValidation)
module.exports = { tokenValidation }