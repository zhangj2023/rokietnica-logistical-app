// import and instantiate express
const express = require("express"); // CommonJS import style!
const axios = require("axios"); // middleware for making requests to APIs
const app = express(); // instantiate an Express object
const parseCSV = require("./parseCSV");

const fs = require("fs");


const stationData = require("./stations");

//mongodb start

// allow CORS, so React app on port 3000 can make requests to Express server on port 4000
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

require("dotenv").config({ silent: true })
const mongoose = require("mongoose");

const db_url = process.env.MONGO_DB_URL;
mongoose.connect(db_url, () =>{
  console.log("DB connection state: " + mongoose.connection.readyState);
});



const User = require('./models/userModel')

//mongodb end

app.use(express.json())
const cors = require("cors")
app.use(cors({ origin: process.env.FRONT_END_DOMAIN, credentials: true })) // allow incoming requests only from a "trusted" host
const bcrypt = require('bcrypt');
const saltRounds = 10;

// signup route
app.post("/signup", function (req, res) {
  const username = req.body.username
  const password = req.body.password
  const passwordCheck = req.body.passwordCheck

  if (!username || !password || !passwordCheck) {
    // no username or password received in the POST body... send an error
    res
      .status(401)
      .json({ success: false, message: `no username or password supplied.` })
  }
  if (password != passwordCheck){
    res
      .status(401)
      .json({ success: false, message: `passwords don't match` })
  }
  bcrypt.hash(password, saltRounds).then(function(hash) {
    const newUser = new User({ username: username, password: hash });
    newUser.save(function(err) {
      if (err) {
        console.log(err)
        if (err.name === 'MongoServerError' && err.code === 11000) {
          // Duplicate username
          return res.status(422).send({ succes: false, message: 'User already exist!' });
        }
  
        // Some other error
        return res.status(401).send(err);
      }
    });
  });
})

// /login route

const jwt = require("jsonwebtoken")
const passport = require("passport")
app.use(passport.initialize()) 

const { jwtOptions, jwtStrategy } = require("./jwt-config.js") // import setup options for using JWT in passport
passport.use(jwtStrategy)

// a route to handle a login attempt
app.post("/login", function (req, res) {
  
  const tUsername = req.body.username
  const tPassword = req.body.password
  // console.log(`${tUsername}, ${tPassword}`) debugging
  
  if (!tUsername || !tPassword) {
    // no username or password received in the POST body... send an error
    res
      .status(401)
      .json({ success: false, message: `no username or password supplied.` })
  }
  
  User.findOne({ username: tUsername}, 'password', function (err, users) {
      if (err) 
        return res.status(401).json({ success: false, message: `user not found: ${tUsername}.` });
      const retPass = users.password;
      // assuming we found the user, check the password is correct
      bcrypt.compare(tPassword, retPass).then(function(result) {
        //console.log(result) debugging
        if (result){
          const payload = { id: users.id } // some data we'll encode into the token
          const token = jwt.sign(payload, jwtOptions.secretOrKey) // create a signed token
          res.json({ success: true, username: tUsername, token: token }) // send the token to the client to store
        }
        else{
          res.status(401).json({ success: false, message: "passwords did not match" })
        }
      });
  })
})

//end of login route

// route for HTTP GET requests to the root document
app.get("/", (req, res) => {
  res.send("Goodbye world!");
});

// proxy requests to/from an API
app.get("/apiCallTest", (req, res, next) => {
  axios
    .get("https://my.api.mockaroo.com/line0.json?key=57b58bf0")
    .then((apiResponse) => res.json(apiResponse.data)) // pass data along directly to client
    .catch((err) => next(err)); // pass any errors to express
});

app.get("/stationData", (req, res) => {
  
  axios
    .get("http://demo6882294.mockable.io/stations")
    .then(response=>{
      
      
    //stationData.parse(response.data);
    stationData.columns = response.data[0];
    stationData.stations = response.data;
    for(var i  = 0; i < stationData.stations.length;i++){
      var station = stationData.stations[i];
      station["Daytime Routes"] = station["Daytime Routes"].toString().split(" ");
    }
    
     res.json(stationData);
     
  })
  .catch(error=>{
    console.log(error);
    res.send(error);
  })
})

app.get("/station/:id", (req, res) => {
  const station = stationData.stations.filter(
    (st) => st["Station ID"] == req.params.id
  );
  res.json(station[0]);
});

module.exports = app;
