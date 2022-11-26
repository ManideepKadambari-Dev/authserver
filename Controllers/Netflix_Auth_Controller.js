const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../Models/NetflixUserModel");
const bcrypt = require("bcrypt");

const Authrouter = express.Router();

//#region SignUp
Authrouter.use("/signup", async (req, res, next) => {
  console.log(req.headers)
  console.log("Middleware triggered");
  const user = await User.countDocuments({ email: req.body.email });
  if (user === 0) next();
  else res.status(403).send({ error: "User Already Exists" });
});

const signupcontroller = async (req, res) => {
  console.log("Signup Requested");
  try {
    if(!req.body.password) res.status(400).send({error:"No Password"})
    else{
    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    signupuser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedpassword,
    });
    res.status(201).send({ message: "User Created Successfully" });
  }
  } catch {
    res.status(500).send({ error: "Something went wrong" });
  }
};

Authrouter.post("/signup", signupcontroller);
//#endregion

//#region Login
Authrouter.use("/login", async (req, res, next) => {
  console.log(req.headers);
  const refreshtoken = req.cookies.refreshtoken;
  if (refreshtoken) {
    try {
      const verified = jwt.verify(refreshtoken, process.env.R_TOKEN_SECRET);
      const loginuser = await User.countDocuments({ rtoken: refreshtoken });
      if (loginuser === 1 && verified) {
        console.log("User Logged in already -> Generating new access token");
        const a_token = jwt.sign(
          {
            id: loginuser._id,
            username: loginuser.username,
          },
          process.env.TOKEN_SECRET,
          { expiresIn: "1d" }
        );
        res.status(200).send({ auth_token: a_token });
      } else {
        if (req.body.email && req.body.password) next();
        res.status(401).send({ error: "Invalid User" });
      }
    } catch (err) {
      if (err.message === "invalid signature")
        req.body.email&&req.bosy.password? res.status(401).send({ error: "Login Failed" }):next();
      else res.status(500).send({ message: "something went wrong" });
    }
  } else {
    if(!req.body.email || !req.body.password) res.status(400).send({error:"Email/Password not received"})
    else next();
  }
});

const logincontroller = async (req, res) => {
  console.log("Login Requested");
  const { email, password } = req.body;
  const loginuser = await User.findOne({ email: email });
  if (loginuser) {
    if (await bcrypt.compare(password, loginuser.password)) {
      const r_token = jwt.sign(
        {
          id: loginuser._id,
          username: loginuser.username,
        },
        process.env.R_TOKEN_SECRET,
        { expiresIn: "5d" }
      );
      loginuser.rtoken = r_token;
      await loginuser.save();
      const a_token = jwt.sign(
        {
          id: loginuser._id,
          username: loginuser.username,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      await res.cookie("refreshtoken", r_token, {
        httpOnly: true,
        domain : process.env.origin,
        max_Age: 24 * 60 * 60 * 1000 * 5,
      });
      res.status(200).send({
        auth_token: a_token,
      });
    } else {
      res.status(401).send({ error: "Invalid Password" });
    }
  } else {
    console.log("Not Found");
    res.status(401).send({ error: "User Doesnot Exist" });
  }
};
Authrouter.post("/login", logincontroller);
//#endregion

//#region Logout
const logoutcontroller = async (req, res) => {
  console.log(req.headers)
  const refreshtoken = req.cookies.refreshtoken;
  try {
    const verified = jwt.verify(refreshtoken, process.env.R_TOKEN_SECRET);
    const loginuser = await User.find({
      rtoken: refreshtoken,
      username: verified.username,
    });
    if (refreshtoken && verified && Array.isArray(loginuser)) {
      loginuser[0].rtoken = null;
      await loginuser[0].save();
      console.log(loginuser[0].username + " logged out");
      res.clearCookie("refreshtoken")
      res.status(200).send({ message: "Loogged out Successfully" });
    } else {
      res.status(401).send({ error: "Logout Failed" });
    }
  } catch (err) {
    if (err.message === "invalid signature")
      res.status(401).send({ error: "Logout Failed" });
    else {
      console.log(err.message);
      res.status(500).send({ message: "something went wrong" });
    }
  }
};

Authrouter.post("/logout", logoutcontroller);

//#endregion

module.exports = Authrouter;
