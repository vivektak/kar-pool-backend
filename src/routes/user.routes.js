const express = require('express');
const router = express.Router();
const multer = require('multer');
var upload = multer({ dest: './uploads' });

const userController = require('../controllers/user.controller');

router.post('/signup',userController.signup);

router.post('/validateOtp',userController.validateOtp);

router.post('/login', userController.login);

router.post('/reset-password', userController.resetPassword);

router.post('/resend-otp', userController.resendOtp);

router.post('/change-password', userController.changePassword);

router.put('/update-profile', userController.updateProfile);

router.put('/update-profile-picture',upload.single('avatar'), userController.updateProfilePicture);

router.get('/get-profile-picture', userController.getProfilePicture);


module.exports = router;