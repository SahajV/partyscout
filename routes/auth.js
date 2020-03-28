/*const simpleoauth2 = require('simple-oauth2');
const request = require('request');
const fs = require('fs');

const cookies = require('./cookies.js');
const index = require('./index.js');
const europequiz = require('./europequiz.js');
const houses = require('./houses.js');

const login_url = oauth.authorizationCode.authorizeURL({
	scope: "read", // remove scope: read if you also want write access
	redirect_uri: ion_redirect_uri
});*/

module.exports.set = (app) => {
	app.get('/login', (req, res) => {

    });
    
	app.get('/logout', (req, res) => {

	});
}