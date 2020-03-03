const mongoose = require('mongoose');
const Otp = mongoose.model('Otp', {
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Users",
    },
    otp : {
        type : Number,
        required : true,
    }
   
});

module.exports = Otp;