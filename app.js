//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const app = express();
const md5 = require('md5');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(
  'mongodb+srv://felix:1234@testcluster1.lqrpw.mongodb.net/userInfo?retryWrites=true;',
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));

db.once('open', function () {
  console.log('connected to database');

  const loginsSchema = new mongoose.Schema(
    {
      username: {
        type: String,
      },
      password: {
        type: String,
      },
    },
    {
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000,
      },
    }
  );

  const Login = mongoose.model('Login', loginsSchema);

  const loginOne = new Login({
    username: 'felix',
    password: '74123698',
  });

  // loginOne.save({
  //   function(err, login) {
  //     if (err) {
  //       return console.err(err);
  //     } else {
  //       console.log('login succesfully saved');
  //       console.log(login);
  //     }
  //   },
  // });

  app.post('/register', function (req, res) {
    const newUser = new Login({
      username: req.body.username,
      password: md5(req.body.password),
    });

    newUser.save(function (err, login) {
      if (err) {
        console.log(err);
      } else {
        console.log('new user saved', login);
        res.render('secrets');
      }
    });
  });

  app.post('/login', function (req, res) {
    const username = req.body.username;
    const password = md5(req.body.password);

    Login.findOne({ username: username }, function (err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          if (foundUser.password === password) {
            res.render('secrets');
          }
        }
      }
    });
  });
});

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.get('/register', function (req, res) {
  res.render('register');
});

app.listen(3000, function () {
  console.log('Server started on port 3000');
});
