import express from 'express';
import mongoose from 'mongoose';
import { config } from 'dotenv';

//Load environment variables
config();

const app = express();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

const connection = async () => {
    await mongoose.connect(
    MONGODB_URI
    ).then(() => {console.log('Connection Successful')});

    app.listen(PORT, () => {console.log('App is opened in the post 3000')})
}

connection();

app.get('/', (req, res) => {console.log('Test get request');
    res.json({ 'message': 'test request'})});