module.exports.set = function (app) {

    app.get('/matches', ensureAuthenticated, (req, res) => {
        res.render('match', {userD: req.user, array: req.groups});
    });

}