const {ensureAuthenticated} = require('../config/auth'); //PUT ensureAuthenticated on anything that needs to be checked

module.exports.set = function (app) {

    app.get('/search', ensureAuthenticated, (req, res) => {
        res.render('search');
    });

    var gameDict = {0 : 'lol', 1 : 'cSGO', 2 : 'minecraft', 3 : 'r6', 4 : 'chat'};
    app.get('/gameFinder', ensureAuthenticated, (req, res) => {
        if (!('game' in req.query) || !('language' in req.query) || !(req.query.game in gameDict)) {
            res.render('search');
        }
        else {
            var game = parseFloat(req.query.game);
            res.render(gameDict[game]);
        }
    });

}