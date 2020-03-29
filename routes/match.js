const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth'); //PUT ensureAuthenticated on anything that needs to be checked
module.exports.MongoClient = require('mongodb').MongoClient;
module.exports.uri = "mongodb+srv://sahajV:BqBCuf7ID4vn7uEh@gameconnectcluster-zoadx.gcp.mongodb.net/test?retryWrites=true&w=majority";


module.exports.set = function (app) {

    async function getDocumentsInCollection(req, res, next) {
        const client = new module.exports.MongoClient(module.exports.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            await client.connect();
            const result = await client.db("partyScoutUsers").collection("profileData").findOne({});
            if (result) {
                res.locals.allUserData = result;
            }
            else {
                console.log('No listings found in this collection')
            }

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
            next();
        }
    }

    app.get('/matches_worker', getDocumentsInCollection, (req, res) => {
        res.send(res.locals.allUserData);
    });

    app.get('/matches', ensureAuthenticated, (req, res) => {
        res.render('match', {userD: req.user, array: req.groups});
    });



}