const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth"); //PUT ensureAuthenticated on anything that needs to be checked
module.exports.MongoClient = require("mongodb").MongoClient;
module.exports.uri =
  "mongodb+srv://sahajV:BqBCuf7ID4vn7uEh@gameconnectcluster-zoadx.gcp.mongodb.net/test?retryWrites=true&w=majority";

module.exports.set = function (app) {
  async function getDocumentsInCollection(req, res, next) {
    const client = new module.exports.MongoClient(module.exports.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    try {
      await client.connect();
      const gameDict = {
        0: "LOL",
        1: "CSGO",
        2: "minecraft",
        3: "R6",
        4: "chat",
      };
      let myQs = [];
      for (let index = 0; index < 5; index++) {
        temp = await client
          .db("partyScoutUsers")
          .collection(gameDict[index] + "_collection")
          .findOne({ id: req.user._id });
        if (temp != null) temp["game"] = gameDict[index];
        myQs.push(temp);
      }
      //   console.log('+++++++++++++++++++++++++++++++++++++++++++++++')
      //   console.log('my id: ', req.user._id)
      myQs = myQs.filter((item) => item != null);
      //   console.log('my bitches: ', myQs)
      res.locals.myMatches = myQs;
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
      next();
    }
  }

  async function createMatchesArray(req, res, next) {
    const client = new module.exports.MongoClient(module.exports.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    res.locals.finalList = [];

    if (res.locals.myMatches.length == 0) {
      next();
    }

    let currentMatch = res.locals.myMatches[0];
    for (let index = 0; index < res.locals.myMatches.length; index++) {
      if (
        currentMatch.submissionTime < res.locals.myMatches[index].submissionTime
      )
        currentMatch = res.locals.myMatches[index];
    }
    let searchParams = { ...currentMatch };  // example: { partySize: '2', language: '0' }
    delete searchParams._id;
    delete searchParams.id;
    delete searchParams.submissionTime;
    delete searchParams.game;
    console.log("++++++++++++++++++++++++++");
    console.log("searchParams:", searchParams);
    let possibleMatches = await client
      .db("partyScoutUsers")
      .collection(currentMatch.game + "_collection")
      .find(searchParams)
      .toArray()
      .catch((err) => console.error(`Failed to find documents: ${err}`));
    console.log("possibleMatches:", possibleMatches);
    if (possibleMatches.length < searchParams.partySize) {  // not enough possible matches for a full party, abort
      next();
    }

    for (let index = 0; index < currentMatch.partySize; index++) {
      let objTemp = await client
        .db("partyScoutUsers")
        .collection("profileData")
        .findOne({ _id: possibleMatches[index].id });
      console.log(objTemp);
      let nameTemp = objTemp.display_name;
      if (possibleMatches[index].id.toString().trim() != currentMatch.id.toString().trim()) {
        console.log('hello', possibleMatches[index].id , currentMatch.id)
        res.locals.finalList.push({ name: nameTemp, id: possibleMatches[index].id });
      }
    }
    await client.close();

    console.log("FINAL PARTY ", res.locals.finalList);
    next();
  }

  app.get("/matches", [ensureAuthenticated, getDocumentsInCollection, createMatchesArray], (req, res) => {
    res.render("match", { userInfo: req.user, matchArray: JSON.stringify(res.locals.finalList) });
  });
};
