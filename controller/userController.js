const User = require('../models/userModels');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../config/jwtToken');
const validateMongodbId = require('../utils/validateMongodbId');
const crypto = require('crypto');
// const { generateRefreshToken } = require('../config/refreshToken');
const e = require('express');
const sendEmail = require('./emailController');
const createUser =
    asyncHandler(
        async (req, res, next) => {
            try {
                const email = req.body.email;
                const findUser = await User.findOne({ email });
                if (!findUser) {
                    const salt = bcrypt.genSaltSync(10);
                    const hashPassword = bcrypt.hashSync(req.body.password, salt);
                    //create new user
                    const newUser = await User.create({
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                        mobile: req.body.mobile,
                        password: hashPassword,
                    });
                    res.json({
                        message: "user created Successfuly"
                        , newUser
                    });
                }
                else {
                    //user already exists
                    throw new Error("user already exists");
                }
            } catch (error) {
                res.json(error.message);
            }
        }
    );
//login
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const findUser = await User.findOne({ email });
        if (findUser) {
            const passCheck = bcrypt.compareSync(password, findUser.password);
            if (passCheck) {
                // const refToken = await generateRefreshToken(findUser?._id);
                const refToken = jwt.sign({ id: findUser._id }, process.env.SECRET_KEY, { expiresIn: '3d' })
                const updateUser = await User.findByIdAndUpdate(findUser?._id, {
                    refreshToken: refToken
                }, {
                    new: true
                });
                res.cookie('refreshToken', refToken, {
                    httpOnly: true,
                    maxAge: 72 * 60 * 60 * 1000
                })
                const { password, ...otherDetails } = updateUser._doc;
                const token = generateToken(findUser?._id);
                res.json({
                    ...otherDetails,
                    token: token
                })
            }
            else {
                throw new Error("password incorrect");
            }
        }
        else {
            throw new Error("user not found with the given email");
        }
    } catch (err) {
        throw new Error(err.message);
    }
});

//handle refresh Token
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("there is refresh token  available login first");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error("no refresh token present in database");
    jwt.verify(refreshToken, process.env.SECRET_KEY, (err, decoded) => {
        if (err || user.id !== decoded.id) { throw new Error(err.message || "there is something wrong with refresh ttokne") }
        const accessToken = generateToken(user._id);
        res.json({ accessToken });
    })

});

//handle logout function
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("there is no cookie available");
    const refreshToken = cookie?.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true
        });
        res.sendStatus(204); //forbidden
    }
    await User.findOneAndUpdate({ refreshToken }, {
        refreshToken: ''
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true
    });
    res.sendStatus(204); //forbidden


});
//getallusers
const getAllUser = asyncHandler(async (req, res) => {
    try {
        const getUser = await User.find();
        res.json({ getUser });
    } catch (err) {
        throw new Error(err.message);
    }
});
//get specific user
const getSingleUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    console.log(id);
    try {
        const getUser = await User.findById(id);
        res.json({ getUser });
    } catch (err) {
        throw new Error(err.message);
    }
});
//delete user
const deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deleteUser = await User.findByIdAndDelete(id);
        res.json({ deleteUser });
    } catch (err) {
        throw new Error(err.message);
    }
});
//update user
const updateUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const updatedUser = await User.findByIdAndUpdate(_id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
        }, {
            new: true,
        });
        res.json({ updatedUser });
    } catch (err) {
        throw new Error(err.message);
    }
});
const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(_id);
    console.log(id);
    const blocked = await User.findByIdAndUpdate(id, {
        isBlocked: true,
    }, {
        new: true
    })
    res.json({
        message: "user is blocked",
        blocked
    })
});
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(_id);
    console.log(id);
    const unblocked = await User.findByIdAndUpdate(id, {
        isBlocked: false,
    }, {
        new: true
    })
    res.json({
        message: "user is unblocked",
        unblocked
    })
});

//update password
const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(req.body.password, salt);
    validateMongodbId(_id);

    const resetToken = crypto.randomBytes(32).toString("hex");

    const updatedPassword = await User.findByIdAndUpdate(_id, {
        password: hashPassword,
        passwordResetToken: crypto.createHash("sha256").update(resetToken).digest("hex"),
        passwordResetExpires: Date.now() + 30 * 60 * 1000,
    },
        { new: true });

    res.json(updatedPassword);



});

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("user not found with this email");
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetUrl = `hi you clicked forgot password click the following link to reset <a href='http://localhost:5000/api/auth/reset-password/${token}/>click here</a> `;
        const data = {
            to: email,
            text: "hye bot",
            subject: "password reset",
            html: resetUrl
        };
        sendEmail(data);
        res.json(token);


    } catch (error) {
        throw new Error(error.message);

    }

});

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    // const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOneAndUpdate({
        passwordResetToken: token,
        // passwordResetExpires: { $gt: Date.now() },
    }, {
        password: password,
        passwordResetToken: undefined,
        passwordResetExpires: undefined
    });
    if (!user) throw new Error("token expired . please try again")
    res.json(user)

});
module.exports = { createUser, login, getAllUser, getSingleUser, deleteUser, updateUser, logout, blockUser, resetPassword, unblockUser, handleRefreshToken, updatePassword, forgotPasswordToken };
