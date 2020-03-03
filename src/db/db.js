const mongoose = require('mongoose');
require('dotenv').config();

console.log(process.env.DATABASE_URL);
const connectionURL = process.env.DATABASE_URL;
const database = 'car-pool';

mongoose.connect(connectionURL+database, {useNewUrlParser : true, useCreateIndex : true});