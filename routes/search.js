const {ensureAuthenticated} = require('../config/auth'); //PUT ensureAuthenticated on anything that needs to be checked
const profile = require('./profile.js');

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

    app.get('/findMatches', [ensureAuthenticated, initializePreferences, findUserByPreferences], (req, res) => {
        if (res.locals.matches) {
            res.render('match', {'matches': matches});
        }
        else {
            res.render('match_failed');
        }
    });

    async function initializePreferences(req, res, next) {
        if (!(req.user._id in userInputs)) {
            res.redirect('/search');
        }
        res.locals.game = gameDict[userInputs[req.user._id]['game']]
        res.locals.preferences = req.query;
        res.locals.preferences['language'] = userInputs[req.user._id]['language'];
        next();
    }

    async function findUserByPreferences(req, res, next) {
        const client = new profile.MongoClient(profile.uri, { useNewUrlParser: true, useUnifiedTopology: true });

        const collection_name = res.locals.game + '_collection';
        const preferences = res.locals.preferences; // {language: languageOfUser, rank: rankOfUser, ...}

        try {
            await client.connect();
            const result = await client.db("partyScoutUsers").collection(collection_name).find(preferences).toArray((error, documents) => {
                if (error) throw error;
                documents.sort( compare );
                let matches = [];

                for (potentialMatch in documents) {
                    timeElapsed = Date.now() - potentialMatch.submissionTime;
                    if (timeElapsed > 604800000)  { // one week
                        // remove from database?
                    }
                    else {
                        matches.push(potentialMatch.id);
                    }
                }
                
                if (matches.length > 0) {
                    console.log('Found matches: ' + matches);
                    res.locals.matches = result;
                    client.close();
                }
                else {
                    preferences['id'] = req.user._id;
                    preferences['submissionTime'] = Date.now();
                    console.log(preferences)
                    const resultNew = client.db("partyScoutUsers").collection(collection_name).insertOne(preferences).then(client.close());
                    console.log('Added ' + preferences + ' to ' + collection_name);
                    console.log(resultNew);
                    res.locals.matches = [];
                }
            });
        } catch (e) {
            console.error(e);
        } finally {
            console.log('FINISHING UP')
            next();
        }
    }

    function compare( a, b ) {
        if ( a.submissionTime < b.submissionTime ){
          return -1;
        }
        if ( a.submissionTime > b.submissionTime ){
          return 1;
        }
        return 0;
    }
}