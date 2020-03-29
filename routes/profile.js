const {ensureAuthenticated} = require('../config/auth');
module.exports.MongoClient = require('mongodb').MongoClient;
module.exports.uri = "mongodb+srv://sahajV:BqBCuf7ID4vn7uEh@gameconnectcluster-zoadx.gcp.mongodb.net/test?retryWrites=true&w=majority";


module.exports.createUserData = async (newListing) => {
    const client = new module.exports.MongoClient(module.exports.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const result = await client.db("partyScoutUsers").collection("profileData").insertOne(newListing);
    console.log('New Listing created with the following ID: ' + result.insertedId);
    await client.close();
    // console.log(result);
}

module.exports.set = function (app) {
    function getProfileQuery(req, res, next) {

        res.locals.discordID = req.query.discordID;
        res.locals.steamID = req.query.steamID;
        res.locals.leagueID = req.query.leagueID;
        res.locals.blizzardID = req.query.blizzardID;
        res.locals.originID = req.query.originID;
        res.locals.facebookID = req.query.facebookID;
        res.locals.twitterID = req.query.twitterID;
        res.locals.snapchatID = req.query.snapchatID;
        res.locals.epicID = req.query.epicID;
        res.locals.email = req.query.email;
        res.locals.display_name = req.query.display_name;
        res.locals.phone = req.query.phone;
        res.locals.age = req.query.age;
        res.locals.gender = req.query.gender;
        res.locals.name = req.query.name;
        res.locals.bio = req.query.bio;
        res.locals.country = req.query.country;
        res.locals.province = req.query.province;
        res.locals.city = req.query.city;
        res.locals.profileURL = req.query.profileURL;
        res.locals.languages = req.query.languages;

        next();
    }

    async function connection(req, res, next) {
        try {
            //--------------------------NEED COOKIE DATA 
            await module.exports.createUserData(
                {
                    _id: req.user._id,
                    discordID: res.locals.discordID,
                    steamID: res.locals.steamID,
                    leagueID: res.locals.leagueID,
                    blizzardID: res.locals.blizzardID,
                    originID: res.locals.originID,
                    facebookID: res.locals.facebookID,
                    twitterID: res.locals.twitterID,
                    snapchatID: res.locals.snapchatID,
                    epicID: res.locals.epicID,  
                    email: res.locals.email,
                    display_name: req.query.display_name,
                    phone: res.locals.phone,
                    age: res.locals.age,
                    gender: res.locals.gender,
                    name: res.locals.name,
                    bio: res.locals.bio,
                    country: res.locals.country,
                    province: res.locals.province,
                    city: res.locals.city,
                    profileURL: res.locals.profileURL,
                    languages: res.locals.languages
                }
            );

        } catch (e) {
            console.error(e);
        } finally {
            next();
        }
    };

    async function findUserById(req, res, next) {
        const client = new module.exports.MongoClient(module.exports.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            await client.connect();
            let idOfUser = req.user._id; //--------------------------NEED COOKIE DATA
            const result = await client.db("partyScoutUsers").collection("profileData").findOne({ _id: idOfUser });
            if (result) {
                console.log('Found a listing in the collection with the id ' + idOfUser);
                // console.log(result);
                res.locals.allUserData = result;
            }
            else {
                console.log('No listings found with the id ' + idOfUser)
            }

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
            next();
        }

    }

    async function updateListingById(req, res, next) {
        const client = new module.exports.MongoClient(module.exports.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            await client.connect();
            let userId = req.user._id; //----------------NEEDS DATA FROM COOKIE
            const result = await client.db("partyScoutUsers").collection("profileData").updateOne(
                { _id: userId },
                { $set: JSON.parse(JSON.stringify(req.query)) }
            );

            console.log(result.modifiedCount + ' documents(s) was/were updated');

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
            next();
        }
    }

    app.get('/profile', ensureAuthenticated, (req, res) => {
        res.render('profile', {userD: req.user});
    });

    app.get('/get_profile', [ensureAuthenticated, findUserById], (req, res) => {
        res.send(res.locals.allUserData);
    });

    app.get('/post_profile', [ensureAuthenticated, getProfileQuery, connection], (req, res) => {
        res.send('Created User in Database');
    });

    app.get('/update_profile', [ensureAuthenticated, updateListingById], (req, res) => {
        res.send('Updated User in Database');
    });
}