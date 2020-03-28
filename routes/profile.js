module.exports.set = function (app) {
    const MongoClient = require('mongodb').MongoClient;

    app.get('/profile', (req, res) => {

    });

    async function connection(req, res, next) {
        const uri = "mongodb+srv://sahajV:BqBCuf7ID4vn7uEh@gameconnectcluster-zoadx.gcp.mongodb.net/test?retryWrites=true&w=majority";
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        try {
            // Connect to the MongoDB cluster
            console.log('Attempting to connect');
            await client.connect();

            // Make the appropriate DB calls
            await listDatabases(client);

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
            next();
        }
    };

    async function listDatabases(client) {
        databasesList = await client.db().admin().listDatabases();

        console.log("Databases:");
        databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    };

    app.get('/get_profile', [connection], (req, res) => {


    });

    app.post('/post_profile', (req, res) => {

    });

    app.post('/update_profile', (req, res) => {

    });

}