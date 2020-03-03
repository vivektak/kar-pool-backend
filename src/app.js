require('./db/db');

const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/user', userRoutes);


const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    return res.status(200).send({
        error: false,
        message: 'Carpool API is working'
    })
});

app.listen(port, () => {
    console.log('Server is Running on Port 3000');
});