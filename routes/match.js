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
    if (res.locals.myMatches.length == 0) {
      res.locals.finalL = ["you do not have a party yet"];
      next();
    }

    let currentMatch = res.locals.myMatches[0];
    for (let index = 0; index < res.locals.myMatches.length; index++) {
      if (
        currentMatch.submissionTime < res.locals.myMatches[index].submissionTime
      )
        currentMatch = res.locals.myMatches[index];
    }
    let temp = { ...currentMatch };
    delete temp._id;
    delete temp.id;
    delete temp.submissionTime;
    delete temp.game;
    console.log("++++++++++++++++++++++++++");
    console.log(temp);
    console.log("my current match: ", currentMatch);
    let mygameDb = await client
      .db("partyScoutUsers")
      .collection(currentMatch.game + "_collection")
      .find(temp)
      .toArray()
      .catch((err) => console.error(`Failed to find documents: ${err}`));

    // let mygameDb = []
    // for (let index = 0; index < mygameDb1.length; index++) {
    //     if (mygameDb1[index].id != currentMatch.id) {
    //         console.log('ids:',mygameDb1[index].id,'+',currentMatch.id,':ids')
    //         mygameDb.push(mygameDb1[index])
    //     }
        
    // }
    // console.log("FINAL DB 1", mygameDb);

    if (mygameDb.length < currentMatch.partySize - 1) {
      res.locals.finalL = [];
      next();
    }
    for (let index = 0; index < currentMatch.partySize - 1; index++) {
      let objTemp = await client
        .db("partyScoutUsers")
        .collection("profileData")
        .findOne({ _id: mygameDb[index].id });
      console.log(objTemp);
      let nameTemp = objTemp.display_name;
      if (res.locals.finalL == null) res.locals.finalL = [];

      if (mygameDb[index].id.toString().trim() != currentMatch.id.toString().trim()) {
        console.log('hello', mygameDb[index].id , currentMatch.id)
        res.locals.finalL.push({ name: nameTemp, id: mygameDb[index].id });
      }
    }
    await client.close();

    console.log("FINAL DB ", mygameDb);
    console.log("FINAL PARTY ", res.locals.finalL);
    next();
  }

  app.get(
    "/matches_worker",
    [getDocumentsInCollection, createMatchesArray],
    (req, res) => {
      res.send(res.locals.finalL);
    }
  );

  app.get("/matches", ensureAuthenticated, (req, res) => {
    res.render("match", { userD: req.user, array: req.groups });
  });
};
