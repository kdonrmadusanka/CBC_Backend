import express from 'express';
import mongoose from 'mongoose';

const app = express();

const connection = async () => {
    await mongoose.connect(
    'mongodb+srv://admin:123456%40Tom@cbc-db.qoabxtl.mongodb.net/?retryWrites=true&w=majority&appName=cbc-db'
    ).then(() => {console.log('Connection Successful')});

    app.listen(3000, () => {console.log('App is opened in the post 3000')})
}

connection();

app.get('/', (req, res) => {console.log('Test get request');
    res.json({ 'message': 'test request'})});