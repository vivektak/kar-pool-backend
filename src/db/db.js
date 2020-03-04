const mongoose = require('mongoose');
require('dotenv').config();
mongoose.set('useFindAndModify', false);
console.log(process.env.DATABASE_URL);
const connectionURL = process.env.DATABASE_URL;


mongoose.connect(connectionURL, {useNewUrlParser : true, useCreateIndex : true});