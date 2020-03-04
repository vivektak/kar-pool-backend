require('./db/db');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const { handleError, ErrorHandler } = require('./handler/error');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/user', userRoutes);


const port = process.env.PORT

app.get('/', (req, res) => {
    throw new ErrorHandler(500, 'Internal server error');
});

app.post('/', (req, res) => {
    return res.status(200).send({
        error: false,
        message: 'Post is also working !'
    })
});

app.use((err, req, res, next) => {
    handleError(err,res);
});

app.listen(port, () => {
    console.log('Server is Running on Port',port);
});