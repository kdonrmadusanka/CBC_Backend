import express from 'express';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import morgan from 'morgan';

//Load environment variables
config();

const app = express();

//Use morgan to load method
app.use(morgan('dev'));

//Enabling json body parsing
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

const connection = async () => {
    await mongoose.connect(
    MONGODB_URI
    ).then(() => {console.log('Connection Successful')});

    app.listen(PORT, () => {console.log(`App is opened in the post ${PORT}`)})
}

connection();

app.get('/', (req, res) => {console.log('Test get request');
    res.send(req.body);
});