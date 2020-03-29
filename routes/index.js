var express = require('express');
var router = express.Router();

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth'); //PUT ensureAuthenticated on anything that needs to be checked

module.exports = router;

const users = require('./users.js');
const search = require('./search.js');
const profile = require('./profile.js');

module.exports.set = function (app) {
  app.get('/', forwardAuthenticated, (req, res) => res.render('index'));

  app.get('/dashboard', ensureAuthenticated, (req, res) =>
    res.render('dashboard', {
      user: req.user.display_name
    })
  );

  search.set(app);
  users.set(app);
  profile.set(app);
}