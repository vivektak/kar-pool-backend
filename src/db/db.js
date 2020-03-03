const mongoose = require('mongoose');

const connectionURL = process.env.database? process.env.database : 'mongodb://127.0.0.1:27017/';
const database = 'car-pool';

mongoose.connect(connectionURL+database, {useNewUrlParser : true, useCreateIndex : true});