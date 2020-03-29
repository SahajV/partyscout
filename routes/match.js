module.exports.set = function (app) {

    app.get('/match', ensureAuthenticated, (req, res) => {
        res.render('match');
    });

}