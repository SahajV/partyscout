const { ensureAuthenticated } = require('../config/auth'); //PUT ensureAuthenticated on anything that needs to be checked
const profile = require('./profile.js');

module.exports.set = function (app) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://sahajV:BqBCuf7ID4vn7uEh@gameconnectcluster-zoadx.gcp.mongodb.net/test?retryWrites=true&w=majority";

    app.get('/search', ensureAuthenticated, (req, res) => {
        res.render('search');
    });

    const gameDict = { 0: 'LOL', 1: 'CSGO', 2: 'minecraft', 3: 'R6', 4: 'chat' };
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
        if (res.locals.matches.length > 0) {
            //Add match database addition code here, res.locals.matches is an array of IDs that are matched with each other
            await client.connect();
            if (await db.mycollection.find({ _id: res.locals.matches[0] }).count() > 0)
                await client.db("partyScoutUsers").collection("profileData").updateOne({ _id: res.locals.matches[0] }, { $set: { team: res.locals.matches, game: res.locals.game } });
            else
                await client.db("partyScoutUsers").collection("matchHistory").insertOne({ _id: res.locals.matches[0], team: res.locals.matches, game: res.locals.game });
            if (await db.mycollection.find({ _id: res.locals.matches[1] }).count() > 0)
                await client.db("partyScoutUsers").collection("profileData").updateOne({ _id: res.locals.matches[1] }, { $set: { team: res.locals.matches, game: res.locals.game } });
            else
                await client.db("partyScoutUsers").collection("matchHistory").insertOne({ _id: res.locals.matches[1], team: res.locals.matches, game: res.locals.game });
            if (await db.mycollection.find({ _id: res.locals.matches[2] }).count() > 0)
                await client.db("partyScoutUsers").collection("profileData").updateOne({ _id: res.locals.matches[2] }, { $set: { team: res.locals.matches, game: res.locals.game } });
            else
                await client.db("partyScoutUsers").collection("matchHistory").insertOne({ _id: res.locals.matches[2], team: res.locals.matches, game: res.locals.game });
            if (await db.mycollection.find({ _id: res.locals.matches[3] }).count() > 0)
                await client.db("partyScoutUsers").collection("profileData").updateOne({ _id: res.locals.matches[3] }, { $set: { team: res.locals.matches, game: res.locals.game } });
            else
                await client.db("partyScoutUsers").collection("matchHistory").insertOne({ _id: res.locals.matches[3], team: res.locals.matches, game: res.locals.game });

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
        res.locals.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        const collection_name = res.locals.game + '_collection';
        const preferences = res.locals.preferences; // {language: languageOfUser, rank: rankOfUser, ...}
        const partySize = parseInt(preferences.partySize);

        try {
            await res.locals.client.connect();
            console.log(collection_name);
            console.log(preferences);
            const result = await res.locals.client.db("partyScoutUsers").collection(collection_name).find(preferences).toArray((error, documents) => {
                console.log('documents')
                console.log(documents)

                if (error) throw error;

                documents.sort(compare);
                let matches = [];

                console.log(documents)
                for (idx = 0; idx < documents.length; idx++) {
                    timeElapsed = Date.now() - documents[idx].submissionTime;
                    if (timeElapsed > 604800000) { // one week
                        // remove from database?
                    }
                    else { // if (req.user._id != documents[idx]['id'])
                        console.log('Potential match')
                        console.log(documents[idx]);
                        matches.push(documents[idx]['id']);
                        if (matches.length + 1 == partySize) {
                            break;
                        }
                    }
                }

                console.log('Matches: ' + matches.toString())
                console.log('Matches length: ' + matches.length)
                console.log('Party size: ' + partySize)
                if (matches.length + 1 >= partySize) {
                    console.log('Found matches: ' + matches);
                    res.locals.matches = matches;
                }
                else {
                    preferences['id'] = req.user._id;
                    preferences['submissionTime'] = Date.now();
                    console.log(preferences)
                    const resultNew = res.locals.client.db("partyScoutUsers").collection(collection_name).insertOne(preferences);
                    console.log('Added ' + preferences.toString() + ' to ' + collection_name);
                    console.log(resultNew);
                    res.locals.matches = [];
                }
                next();
            });
        } catch (e) {
            console.error(e);
            next();
        } finally {

        }
    }

    function compare(a, b) {
        if (a.submissionTime < b.submissionTime) {
            return -1;
        }
        if (a.submissionTime > b.submissionTime) {
            return 1;
        }
        return 0;
    }
}