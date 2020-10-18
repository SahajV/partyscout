MongoClient = require("mongodb").MongoClient;
MongoURI = require("./keys").generalURI;

module.exports = {
    client: new MongoClient(MongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
};

module.exports.client.connect();
