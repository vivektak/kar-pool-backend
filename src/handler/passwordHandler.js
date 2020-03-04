const {generateOtp} = require('./otpGenerator');
const {ErrorHandler} = require('./error');
const {sendWelcomeMail} = require('../emails/account');
const User = require('../models/Users.model');
const OtpModel = require('../models/otp.model');

const passwordHandler = async (email) => {
    const isUserFind = await User.findOne({ email });
    if(!isUserFind)
        throw new ErrorHandler(400, 'User is not Registered !!')
    const otp = generateOtp();
    const otpSaved = await OtpModel.findOneAndUpdate({userId: isUserFind._id}, {otp}, {new : true, upsert : true});
    if(otpSaved.error)
        throw new ErrorHandler(400, otpSaved.error);
    
    sendWelcomeMail(email, isUserFind.name, otp);
    console.log(isUserFind);
    return isUserFind;
};

module.exports = {
    passwordHandler
}
