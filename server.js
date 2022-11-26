const express = require('express')
const helmet = require('helmet')
const AuthRouter = require("./Controllers/Netflix_Auth_Controller");
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieparser = require("cookie-parser");

dotenv.config();
app.use(helmet())
const app = express();
app.use(express.json());
const PORT = process.env.port || 9000;
app.use(cookieparser())
app.use(cors({
    origin: true,
    credentials: true,
}));

app.listen(PORT,()=>{
    console.log(`Server started at port : ${PORT}`)
    mongoose.connect(process.env.MongoDB_URI,{useNewUrlParser: true},()=>{console.log("connected to MongoDB")})
})

app.use("/netflix/auth",AuthRouter);