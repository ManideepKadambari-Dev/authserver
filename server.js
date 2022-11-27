const express = require('express')
const helmet = require('helmet')
const AuthRouter = require("./Controllers/Netflix_Auth_Controller");
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieparser = require("cookie-parser");

dotenv.config();
const app = express();
app.use(helmet())
app.use(express.json());
const PORT = process.env.PORT || 9000;
app.use(cookieparser())
app.use(cors({
    origin: process.env.origin,
    credentials: true,
}));

app.listen(PORT,()=>{
    console.log(`Server started at port : ${PORT}`)
})
//mongoose.connect(process.env.MongoDB_URI,{useNewUrlParser: true},()=>{console.log("connected to MongoDB")})

app.use("/netflix/auth",AuthRouter);