module.exports.set = function (app) {

    app.get('/search', (req, res) => {
        res.render('search');
    });

    var gameDict = {0 : 'lol', 1 : 'cSGO', 2 : 'minecraft', 3 : 'r6', 4 : 'chat'};
    app.get('/search_worker', (req, res) => {
        var game = parseFloat(req.query.some_number);
        res.render(gameDict[game]);
    });

}