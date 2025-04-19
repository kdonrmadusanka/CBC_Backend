import express from 'express';
import mongoose from 'mongoose';

const app = express();

mongoose.connect(
    'mongodb+srv://admin:123456%40Tom@cbc-db.qoabxtl.mongodb.net/?retryWrites=true&w=majority&appName=cbc-db'
).then(() => {console.log('Connection Successful')});
