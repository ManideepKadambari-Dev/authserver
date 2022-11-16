const express = require('express')
const AuthRouter = require("./Controllers/Auth_Controller");
const ServiceRouter = require("./Controllers/Service_Controller");
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config();
const app = express();
app.use(express.json());
const PORT = 9000;


app.listen(PORT,()=>{
    console.log(`Server started at port : ${PORT}`)
    mongoose.connect(process.env.MongoDB_URI,{useNewUrlParser: true},()=>{console.log("connected to MongoDB")})
})

app.use("/auth",AuthRouter);
app.use("/serv",ServiceRouter);