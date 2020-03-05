const { sendWelcomeMail } = require('../emails/account');
const bcrypt = require('bcryptjs');
//var otpGenerator = require('otp-generator')
const { generateOtp } = require('../handler/otpGenerator');
const User = require('../models/Users.model');
const OtpModel = require('../models/otp.model');
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const { handleError, ErrorHandler } = require('../handler/error');
const { passwordHandler } = require('../handler/passwordHandler');
const fs = require('fs');
const path = require('path');

/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - name
 *          - email
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *            format: email
 *            description: Email for the user, needs to be unique.
 *        example:
 *           name: Alexander
 *           email: fake@email.com
 */

const signup = async (req, res, next) => {
    try {
        const userSchema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required()
        });
        const userResult = userSchema.validate(req.body);
        if (userResult.error)
            throw new ErrorHandler(400, userResult.error.details[0].message);
        const hashedPassword = await bcrypt.hash(req.body.password, 8)
        const me = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        const user = await User.findOne({ email: req.body.email });
        if (user)
            throw new ErrorHandler(400, 'User Already Exist')
        const result = await me.save();
        const otp = generateOtp();
        const otpObject = new OtpModel({ otp, userId: result._id });
        const otpSaved = await otpObject.save();
        if (result.error || otpSaved.error)
            throw new ErrorHandler(400, result.error ? result.error : otpSaved.error);
        sendWelcomeMail(req.body.email, req.body.name, otp);
        res.send(me);
    } catch (error) {
        next(error);
    }
};

const validateOtp = async (req, res, next) => {
    try {
        const otpSchema = Joi.object({
            otp: Joi.number().required(),
        });
        const otpResult = otpSchema.validate(req.body);
        if (otpResult.error) {
            throw new ErrorHandler(400, otpResult.error);
        }
        const isOtpFind = await OtpModel.findOne({ otp: req.body.otp });
        if (isOtpFind.length === 0)
            throw new ErrorHandler(400, 'Otp mismateched');
        const findOneAndUpdate = await User.findByIdAndUpdate(isOtpFind.userId, { active: true });
        res.send(findOneAndUpdate);
    } catch (error) {
        next(error)
    }
};

const login = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user)
            throw new ErrorHandler(400, 'User Not Found')
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            throw new ErrorHandler(401, "Password didn't matched")
        } else if (isMatch && user.active) {
            const token = jwt.sign({ _id: user._id }, 'jwttoken')
            res.send(token);
        } else {
            throw new ErrorHandler(402, 'User is not Activated')
        }
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const data = await passwordHandler(req.body.email);
        res.send(data);
    } catch (error) {
        next(error);
    }
};

const resendOtp = async (req, res, next) => {
    try {
        const data = await passwordHandler(req.body.email)
        res.send(data);
    } catch (error) {
        next(error);
    }

};

const changePassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user)
            throw new ErrorHandler(400, 'User Not Found');
        const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!isMatch)
            throw new ErrorHandler(400, "Password is Incorrect");
        const NewHashedPassword = await bcrypt.hash(req.body.newPassword, 8)
        user.password = NewHashedPassword;
        const userSaved = await user.save();

        if (userSaved.error)
            throw new ErrorHandler(400, 'User is not saved');
        res.send('Password Updated')

    } catch (error) {
        next(error);
    }

};

const updateProfile = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user)
            throw new ErrorHandler(400, 'User Not Found');
        const userSchema = Joi.object({
            mobile: Joi.string().pattern(new RegExp(/^([0|\+[0-9]{1,5})?([6-9][0-9]{9})$/)).required()
        });
        const isValid = userSchema.validate({ mobile: req.body.mobile });
        console.log(isValid)
        if (isValid.error)
            throw new ErrorHandler(400, "Please Provide Valid Mobile Number");
        user.mobile = req.body.mobile;

        const userSaved = await user.save();

        if (userSaved.error)
            throw new ErrorHandler(400, 'User is not saved');
        res.send({ "status": 200, "Message": 'Profile Updated Successfully' });
    } catch (error) {
        next(error);
    }
};

// const updateProfilePicture = async (req, res, next) => {
//     try {
//         const user = await User.findOne({ email: req.body.email });
//         if (!user)
//             throw new ErrorHandler(400, 'User Not Found');
//         const path = './uploads/' + 'temp' + '.png'
//         const imgdata = req.body.base64image;
//         console.log(imgdata);
//         const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
//         fs.writeFileSync(path, base64Data, { encoding: 'base64' });
//         user.image = path;
//         const imageSaved = await user.save();
//         if (imageSaved.error)
//             throw new ErrorHandler(400, 'User is not saved');
//         res.send({ "status": 200, "Message": 'Image Updated Successfully' });

//     } catch (error) {
//         next(error)
//     }
// };

// const getProfilePicture = async (req,res,next) => {
//     try{
//         const user = await User.findOne({ email: req.body.email });
//         if (!user)
//             throw new ErrorHandler(400, 'User Not Found');
//         res.set('Content-type', 'image/jpg');
//         res.send(user.image);
//     }catch(error){
//         next(error);
//     }
// };

const updateProfilePicture = async(req, res, next) => {
    try{
        res.send('Profile uploaded Successfully');
    }catch(error){
        next(error);
    }
};

const getProfilePicture = async (req, res, next) => {
    try{
        console.log(path.join(__dirname, '../../uploads/edbe02e9599df29613a8c3b09c05a69f.png'));
        res.send(path.join(__dirname, '../../uploads/edbe02e9599df29613a8c3b09c05a69f.jpg'))
    }catch(error){
        next(error);
    }
}



module.exports = {
    signup,
    validateOtp,
    login,
    resetPassword,
    resendOtp,
    changePassword,
    updateProfile,
    updateProfilePicture,
    getProfilePicture
}