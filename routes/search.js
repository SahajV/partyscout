module.exports.set = function (app) {

    app.get('/search', (req, res) => {
        res.render('search');
    });

    app.get('/search_worker', (req, res) => {
        
    });

}