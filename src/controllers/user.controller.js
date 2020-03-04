const {sendWelcomeMail} = require('../emails/account');
const bcrypt = require('bcryptjs');
var otpGenerator = require('otp-generator')
const User = require('../models/Users.model');
const OtpModel = require('../models/otp.model');
const jwt = require('jsonwebtoken');
const Joi =  require('@hapi/joi');
const { handleError, ErrorHandler } = require('../handler/error');
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
    

    try{
        const userSchema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required()
        });

        const userResult = userSchema.validate(req.body);
        if(userResult.error)
            throw new ErrorHandler(400, userResult.error.details[0].message);
        
        const hashedPassword = await bcrypt.hash(req.body.password, 8)
        const me = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        const result = await me.save();
        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, digits: true, alphabets: false });
        const otpObject = new OtpModel({ otp, userId: result._id });
        const otpSaved = await otpObject.save();
        if (result.error || otpSaved.error)
            throw new ErrorHandler(400, result.error ? result.error : otpSaved.error);
        
        sendWelcomeMail(req.body.email, req.body.name, otp);
        res.send(me);

    } catch (error){
        next(error);
    }
};

const validateOtp = async (req, res, next) => {
    

    try{
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

    } catch(error){
        next(error)
    }
    
    
   
};

const login = async (req, res, next) => {
    try{
        const user = await User.findOne({ email: req.body.email });
        if (!user)
            throw new ErrorHandler(400, 'User Not Found')
            //return res.status(400).send('User Not Found');
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            throw new ErrorHandler(401, "Password didn't matched")
            //res.status(401).send("Password didn't matched");
        } else if (isMatch && user.active) {
            const token = jwt.sign({ _id: user._id }, 'jwttoken')
            res.send(token);
        } else {
            throw new ErrorHandler(402, 'User is not Activated')
            
        }
    }catch(error){
        next(error);
    }
    
};

const resetPassword = async (req, res) => {
    const isUserFind = await User.findOne({ email: req.body.email });
    if(!isUserFind)
        return res.send('User is not Registered !!');
        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, digits: true, alphabets: false });
        const otpSaved = await OtpModel.findOneAndUpdate({userId: isUserFind._id}, {otp}, {new : true, upsert : true});
        if(otpSaved.error)
            return res.send(otpSaved.error);
        
        sendWelcomeMail(req.body.email, isUserFind.name, otp);
        res.send(isUserFind);
};

const resendOtp = async (req, res) => {
    const isUserFind = await User.findOne({ email: req.body.email });
    if(!isUserFind)
        return res.send('User is not Registered !!');
        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, digits: true, alphabets: false });
        const otpSaved = await OtpModel.findOneAndUpdate({userId: isUserFind._id}, {otp}, {new : true, upsert : true});
        if(otpSaved.error)
            return res.send(otpSaved.error);
        
        sendWelcomeMail(req.body.email, isUserFind.name, otp);
        res.send(isUserFind);
};

const changePassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
        return res.status(400).send('User Not Found');
    const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!isMatch) 
        return res.status(401).send("Password is Incorrect");
    const NewHashedPassword = await bcrypt.hash(req.body.newPassword, 8)
    user.password = NewHashedPassword;
    const userSaved = await user.save();

    if(userSaved.error)
        return res.send('User is not saved');
        
    res.send('Password Updated')

};


module.exports = {
    signup,
    validateOtp,
    login,
    resetPassword,
    resendOtp,
    changePassword
}