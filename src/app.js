require('./db/db');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/user.routes');
//const mongoose = require('mongoose');
const { handleError, ErrorHandler } = require('./handler/error');



const app = express();

// let Item = new ItemSchema(
//     { img: 
//         { data: Buffer, contentType: String }
//     }
//   );
// const Item = mongoose.model('Clothes', {
//     img: 
//     { data: Buffer, contentType: String }
// });


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use('/api/user', userRoutes);


const port = process.env.PORT

// app.post("/profile",upload.single('avatar'),function(req,res){
//     var newItem = new Item();
//     console.log('req',req.body);
//     console.log('newItem', newItem);
//     newItem.img.data = fs.readFileSync(req.files.userPhoto.path)
//     newItem.img.contentType = "image/png";
//     newItem.save();
//    });

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