const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const profile = require('./profile.js');
const { forwardAuthenticated } = require('../config/auth');
const {
    client
} = require("../config/mongo"); //PUT ensureAuthenticated on anything that needs to be checked

module.exports.set = function (app) {

    app.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

    // Register Page
    app.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

    // Register
    app.post('/register', (req, res) => {
        const { name, email, display_name, password, password2, age } = req.body;
        let errors = [];

        if (!age) {
            errors.push('You are not old enough to use this service yet.');
        }

        if (!name || !email || !display_name || !password || !password2) {
            errors.push('Please enter all fields.');
        }

        if (password != password2) {
            errors.push('Passwords do not match.');
        }

        if (password.length < 6) {
            errors.push('Password must be at least 6 characters.');
        }

        if (errors.length > 0) {
            res.render('register', {
                errors: errors,
                name: name,
                email: email,
                display_name: display_name,
                password: password,
                password2: password2
            });
        } else {
            User.findOne({ email: email }).then(user => {
                if (user) {
                    errors.push('Email already exists');
                    res.render('register', {
                        errors: errors,
                        name,
                        email,
                        display_name,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        display_name,
                        password
                    });

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    console.log('Created: ' + user);
                                    profile.createUserData(
                                        {
                                            _id: user._id,
                                            name: user.name,
                                            email: user.email,
                                            display_name: user.display_name,
                                            discordID: 'None',
                                            steamID: 'None',
                                            blizzardID: 'None',
                                            originID: 'None',
                                            facebookID: 'None',
                                            twitterID: 'None',
                                            snapchatID: 'None',
                                            epicID: 'None',
                                            phone: 'None',
                                            age: 'Not provided',
                                            gender: 'Not provided',
                                            bio: 'Gamers rise up',
                                            description: 'Gamer',
                                            country: 'Not provided',
                                            profileURL: '/media/favicon2.png',
                                            coverURL: '/media/cover.png'
                                        }
                                    );
                                    client
                                        .db("partyScoutUsers")
                                        .collection("previousMatches")
                                        .insertOne({
                                            _id: user._id,
                                            previousMatches: []
                                        });
                                    req.flash(
                                        'success_msg',
                                        'You are now registered and can log in'
                                    );
                                    res.redirect('/login');
                                })
                                .catch(err => console.log(err));
                        });
                    });
                }
            });
        }
    });

    // Login
    app.post('/login', (req, res, next) => {
        passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);
    });

    // Logout
    app.get('/logout', (req, res) => {
        req.logout();
        req.flash('success_msg', 'You are logged out');
        res.redirect('/login');
    });

}