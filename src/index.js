//require('dotenv').config()
import dotenv from "dotenv"

import mongoose from "mongoose";
import  app   from "./app.js";
//import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";

dotenv.config({path:"./env"})
const port = process.env.PORT;

connectDB()
.then(()=>{
   
   app.on("error",(error)=>{
      console.log(`error: ${error}`)
      throw error;
   })
   
   app.listen(port || 8000,()=>{
      console.log(`Server running at ${port}`)
   })
})
.catch((err)=>{
   console.log("DB connection fail:",err)
})

/*
import express from "express";
const app = express();

(async =>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error", (error)=>{
          console.log("ERROR:" error);
          throw error;
       })

       app.listen(port,()=>{
          console.log(`running on ${port}`);
       })
    } catch (error) {
        console.log("Error:"  error)
        throw err
    }
})()
*/
