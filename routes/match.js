const {
  ensureAuthenticated
} = require("../config/auth"); //PUT ensureAuthenticated on anything that needs to be checked
const {
  client
} = require("../config/mongo"); //PUT ensureAuthenticated on anything that needs to be checked
const ObjectID = require("mongodb").ObjectID;

module.exports.set = function(app) {
  async function getMatchList(req, res, next) {
    matchInfo = await client
      .db("partyScoutUsers")
      .collection("previousMatches")
      .findOne({
          _id: req.user._id
      });
    res.locals.finalList = matchInfo.previousMatches;
    next();
  }

  app.get("/matches", [ensureAuthenticated, getMatchList], (req, res) => {
      res.render("match", {
          userInfo: req.user,
          title: "Your party matches",
          matchArray: JSON.stringify(res.locals.finalList)
      });
  });

  async function getMatchesFromURL(req, res, next) {
    matchInfo = await client
      .db("partyScoutUsers")
      .collection("matchURLs")
      .findOne({
          _id: new ObjectID(req.query.id)
      });
    res.locals.finalList = matchInfo.matchList;
    res.locals.game = matchInfo.game;
    next();
  }

  app.get("/match", [ensureAuthenticated, getMatchesFromURL], (req, res) => {
    res.render("match", {
        userInfo: req.user,
        title: "Your party for: " + res.locals.game,
        matchArray: JSON.stringify(res.locals.finalList)
    });
  });
};
