const {sendWelcomeMail} = require('../emails/account');
const bcrypt = require('bcryptjs');
var otpGenerator = require('otp-generator')
const User = require('../models/Users.model');
const OtpModel = require('../models/otp.model');
const jwt = require('jsonwebtoken');
const Joi =  require('@hapi/joi');

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


const signup = async (req, res) => {
    const userSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required()
    });

    const userResult = userSchema.validate(req.body);
    if(userResult.error)
        return res.status(400).send(userResult.error);

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
    console.log('error', result);
    console.log('yo', otpSaved);
    if (result.error || otpSaved.error)
        return result.error ? result.error : otpSaved.error;
    
    sendWelcomeMail(req.body.email, req.body.name, otp);
    res.send(me);
};

const validateOtp = async (req, res) => {
    const otpSchema = Joi.object({
        otp: Joi.number().required(),
    });

    const otpResult = otpSchema.validate(req.body);
    if (otpResult.error) {
        return res.status(400).send(otpResult.error);
    }

    const isOtpFind = await OtpModel.findOne({ otp: req.body.otp });
    if (isOtpFind.length === 0)
        return res.status(400).send('Otp mismateched');

    const findOneAndUpdate = await User.findByIdAndUpdate(isOtpFind.userId, { active: true });
    res.send(findOneAndUpdate);
};

const login = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
        return res.status(400).send('User Not Found');
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
        res.status(401).send("Password didn't matched");
    } else if (isMatch && user.active) {
        const token = jwt.sign({ _id: user._id }, 'jwttoken')
        res.send(token);
    } else {
        res.status(402).send('User is not Activated');
    }
};

const resetPassword = async (req, res) => {

}


module.exports = {
    signup,
    validateOtp,
    login,
    resetPassword
}