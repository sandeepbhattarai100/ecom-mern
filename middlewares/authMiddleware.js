const User = require('../models/userModels');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if (req?.headers?.authorization.startsWith("Bearer")) {
        token = req?.headers?.authorization.split(" ")[1];
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.SECRET_KEY);
                const user = await User.findById(decoded.id);
                req.user = user;
                next();


            }

        } catch (error) {
            throw new Error("not authorized");

        }
    }
    else {
        throw new Error("there is no token attachde to the header");
    }
});

const isAdmin = asyncHandler(async (req, res, next) => {
    const { email } = req.user;

    const adminUser = await User.findOne({ email });


    if (adminUser.role !== "admin") {
        throw new Error("you are not admin");
    }
    else {
        next();
    }


});
module.exports = { authMiddleware, isAdmin };
