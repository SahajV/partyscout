const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth'); //PUT ensureAuthenticated on anything that needs to be checked
module.exports.MongoClient = require('mongodb').MongoClient;
module.exports.uri = "mongodb+srv://sahajV:BqBCuf7ID4vn7uEh@gameconnectcluster-zoadx.gcp.mongodb.net/test?retryWrites=true&w=majority";


module.exports.set = function (app) {

    async function getDocumentsInCollection(req, res, next) {
        const client = new module.exports.MongoClient(module.exports.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        try {


            await client.connect();
            // res.locals.allSessions = await client.db("partyScoutUsers").collection("matchHistory").find({})
            //     .toArray()
            //     .then(items => {
            //         console.log(`Successfully found ${items.length} documents.`)
            //         items.forEach(console.log)
            //         return items
            //     })
            //     .catch(err => console.error(`Failed to find documents: ${err}`));

            res.locals.currentTeam = await client.db("partyScoutUsers").collection("matchHistory").findOne({ _id: req.user._id });
            console.log(res.locals.currentTeam)
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
            next();
        }

    }

    async function createMatchesArray(req, res, next) {
        res.locals.finalL = [];
        const client = new module.exports.MongoClient(module.exports.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        for (var i = 0; i < res.locals.currentTeam.team.length; i++) {
            let objTemp = await client.db("partyScoutUsers").collection("profileData").findOne({ _id: res.locals.currentTeam.team[i] });
            console.log(objTemp)
            let nameTemp = objTemp.display_name
            res.locals.finalL.push(nameTemp)
        }
        await client.close();

        next();
    }

    app.get('/matches_worker', [getDocumentsInCollection, createMatchesArray], (req, res) => {
        res.send([res.locals.finalL, res.locals.currentTeam.team]);

    });

    app.get('/matches', ensureAuthenticated, (req, res) => {
        res.render('match', { userD: req.user, array: req.groups });
    });



}