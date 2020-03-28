var blockstack = require('blockstack');

const appConfig = new blockstack.AppConfig();
const userSession = new blockstack.UserSession({ appConfig: appConfig });

module.exports.set = function (app) {

    app.get('/login', (req, res) => {
		
	});
	
	app.get('/logout', (req, res) => {

	});
	
}