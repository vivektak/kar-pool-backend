const express = require('express');
const router = express.Router();


const userController = require('../controllers/user.controller');
router.post('/signup',userController.signup);

router.post('/validateOtp',userController.validateOtp);

router.post('/login', userController.login);

router.post('/reset-password', userController.resetPassword);

router.post('/resend-otp', userController.resendOtp);

router.post('/change-password', userController.changePassword);



module.exports = router;