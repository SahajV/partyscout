const {ensureAuthenticated} = require('../config/auth'); //PUT ensureAuthenticated on anything that needs to be checked

module.exports.set = function (app) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://sahajV:BqBCuf7ID4vn7uEh@gameconnectcluster-zoadx.gcp.mongodb.net/test?retryWrites=true&w=majority";

    app.get('/search', ensureAuthenticated, (req, res) => {
        res.render('search');
    });

    const gameDict = {0 : 'LOL', 1 : 'CSGO', 2 : 'minecraft', 3 : 'R6', 4 : 'chat'};
    var userInputs = {};

    app.get('/gameFinder', ensureAuthenticated, (req, res) => {
        if (!('game' in req.query) || !('language' in req.query) || !(req.query.game in gameDict)) {
            res.render('search');
        }
        else {
            var game = parseFloat(req.query.game);
            userInputs[req.user._id] = req.query;
            res.render(gameDict[game]);
        }
    });

    app.get('/findMatches', ensureAuthenticated, (req, res) => {
        if (!(req.user._id in userInputs)) {
            res.render('search');
        }
        else {
            for (var preference in req.query) {
                
            }
        }
    });

    async function findUserByPreferences(req, res, next) {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        const collection_name = res.locals.game + '_collection';
        const preferences = res.locals.preferences; // {language: languageOfUser, rank: rankOfUser, ...}

        try {
            await client.connect();
            const result = await client.db("partyScoutUsers").collection(collection_name).find(preferences);
            if (result) {
                console.log('Found a listing in the collection with the id ' + idOfUser);
                // console.log(result);
                res.locals.allUserData = result;
            }
            else {
                // add user to table, match not found
            }

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
            next();
        }
    }
}