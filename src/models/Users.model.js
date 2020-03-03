const mongoose = require('mongoose');
const User = mongoose.model('Users', {
    name : {
        type : String,
        //required : true
    },
    email : {
        type : String,
        //required : true,
        //unique : true
    },
    password : {
        type : String,
        required : true
    },
    active : {
        type : Boolean,
        default: false
    }
});

module.exports = User;