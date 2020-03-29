const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth'); //PUT ensureAuthenticated on anything that needs to be checked

module.exports.set = function (app) {

    app.get('/matches', ensureAuthenticated, (req, res) => {
        res.render('match');
    });



}