const mongoose = require('mongoose');
const User = mongoose.model('Users', {
    name : {
        type : String,
        //required : true
    },
    email : {
        type : String,
        //required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    mobile : {
        type : Number
    },
    active : {
        type : Boolean
    },
    image : {
        type : Buffer
    }
});

module.exports = User;