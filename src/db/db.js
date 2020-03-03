const mongoose = require('mongoose');
require('dotenv').config();

console.log(process.env.DATABASE_URL);
const connectionURL = process.env.DATABASE_URL;


mongoose.connect(connectionURL, {useNewUrlParser : true, useCreateIndex : true});