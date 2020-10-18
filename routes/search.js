const {
    ensureAuthenticated
} = require("../config/auth"); //PUT ensureAuthenticated on anything that needs to be checked
const {
    client
} = require("../config/mongo"); //PUT ensureAuthenticated on anything that needs to be checked
const ObjectID = require("mongodb").ObjectID;

module.exports.set = function(app) {
    const gameDict = {
        0: "LOL",
        1: "CSGO",
        2: "minecraft",
        3: "R6",
        4: "chat"
    };
    let userInputs = {};  // map for each user's current request, will be overwritten upon searching again

    app.get("/search", ensureAuthenticated, (req, res) => {
        res.render("search");
    });

    app.get("/gameFinder", ensureAuthenticated, (req, res) => {
        if (
            !("game" in req.query) ||
            !("language" in req.query) ||
            !(req.query.game in gameDict)
        ) {
            res.render("search");
        } else {
            var game = parseFloat(req.query.game);
            userInputs[req.user._id] = req.query;
            res.render(gameDict[game]);
        }
    });

    app.get(
        "/findMatches",
        [
            ensureAuthenticated,
            insertPreferences,
            attemptFindMatches
        ],
        (req, res) => {
            if (res.locals.id != "") {
                res.redirect("/match?id=" + res.locals.id)
            } else {
                res.redirect("/matchInProgress");
            }
        }
    );

    app.get(
        "/matchInProgress",
        [
            ensureAuthenticated
        ],
        (req, res) => {
            res.render('match_failed');
        }
    );

    async function insertPreferences(req, res, next) {
        if (!(req.user._id in userInputs)) {
            res.redirect("/search");
        }
        res.locals.game = gameDict[userInputs[req.user._id]["game"]];
        res.locals.preferences = req.query;
        res.locals.preferences.language = userInputs[req.user._id]["language"];
        res.locals.preferences.partySize = parseInt(res.locals.preferences.partySize);
        res.locals.preferences.id = req.user._id;
        res.locals.preferences.submissionTime = Date.now();
        let duplicateParams = {...res.locals.preferences}
        delete duplicateParams._id;
        delete duplicateParams.submissionTime;
        delete duplicateParams.game;
        if (!await client
            .db("partyScoutUsers")
            .collection(res.locals.game + "_collection")
            .findOne(duplicateParams)) {
                await client
                    .db("partyScoutUsers")
                    .collection(res.locals.game + "_collection")
                    .insertOne(res.locals.preferences);
            }
        next();
    }

    async function attemptFindMatches(req, res, next) {
        let searchParams = {...res.locals.preferences}
        delete searchParams._id;
        delete searchParams.id;
        delete searchParams.submissionTime;
        delete searchParams.game;
        let possibleMatches = await client
            .db("partyScoutUsers")
            .collection(res.locals.game + "_collection")
            .find(searchParams)
            .toArray()
            .catch((err) => console.error(`Failed to find documents: ${err}`));
        console.log(searchParams)
        console.log(possibleMatches)
        res.locals.id = "";
        if (possibleMatches.length >= searchParams.partySize) { // not enough possible matches for a full party, abort
            res.locals.id = new ObjectID();
            let finalList = [];
            const gameDictFull = {
                "LOL": "League of Legends",
                "CSGO": "Counter Strike: Global Offensive",
                "minecraft": "Minecraft",
                "R6": "Rainbow Six: Siege",
                "chat": "Just chatting",
            };
            for (let index = 0; index < searchParams.partySize; index++) {
                let currentUser = await client
                    .db("partyScoutUsers")
                    .collection("profileData")
                    .findOne({
                        _id: possibleMatches[index].id
                    });
                let currentUserName = currentUser.display_name;
                finalList.push({
                    name: currentUserName,
                    url: '/profile?id=' + possibleMatches[index].id
                });
                await client
                    .db("partyScoutUsers")
                    .collection(res.locals.game + "_collection")
                    .deleteOne({
                        id: possibleMatches[index].id
                    });
                await client
                    .db("partyScoutUsers")
                    .collection("previousMatches")
                    .updateOne({
                        _id: currentUser._id
                    }, {
                        "$push": {
                            previousMatches: {
                                'url': '/match?id=' + res.locals.id,
                                'name': gameDictFull[res.locals.game] + ' ~ ' + searchParams.partySize + ' people ~ ' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                            }
                        }
                    });
            }
            await client
                .db("partyScoutUsers")
                .collection("matchURLs")
                .insertOne({
                    _id: res.locals.id,
                    game: gameDictFull[res.locals.game],
                    matchList: finalList
                });
        }
        next();
    }
};
