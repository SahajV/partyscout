#!/usr/bin/nodejs

// INITIALIZATION STUFF

const express = require('express');
const app = express();
const hbs = require('hbs')
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');


//-----------------------------------------------------------oAuth work---------------------//

require('./config/passport')(passport);
const db = require('./config/keys').mongoURI;

// Connect to MongoDB 
mongoose
  .connect(
    db,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

  // Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//-----------------------------------------------------------oAuth work---------------------//

app.use(express.static('public'));
app.use(express.static('files'));

app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + '/views/partials')

// -------------- express initialization -------------- //
// PORT SETUP - NUMBER SPECIFIC TO THIS SYSTEM
app.set('port', process.env.PORT || 8080);

let routes = require('./routes');
routes.set(app);

app.get('*', function(req, res) {
    res.status(404).send('Page not found.');
});

// -------------- listener -------------- //
// // The listener is what keeps node 'alive.' 

let listener = app.listen(app.get('port'), () => {
    console.log('Express server started on port: ' + listener.address().port);
});
