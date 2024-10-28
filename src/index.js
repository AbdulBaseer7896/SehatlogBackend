

// require('dotenv').config({path: './env'})

import dotenv from 'dotenv';
import connectDB from "./db/connection.js";

import {app} from './app.js';

dotenv.config({
    path: './.env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`Server running on port ${process.env.PORT}`);  // log the port number to console
    })
})
.catch((error)=>{
    console.log(`Error connecting to the database: ${error}`);
    // process.exit(1);  // exit the app with an error code 1
})