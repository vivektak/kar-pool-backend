const express = require('express');
const router = express.Router();


const userController = require('../controllers/user.controller');
router.post('/signup',userController.signup);

router.post('/validateOtp',userController.validateOtp);

router.post('/login', userController.login);

router.post('/reset-password', userController.resetPassword);

module.exports = router;