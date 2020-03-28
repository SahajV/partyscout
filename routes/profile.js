module.exports.set = function (app) {
    const { MongoClient } = require('mongodb');

    app.get('/profile', (req, res) => {

    });

    async function listDatabases(client){
        databasesList = await client.db().admin().listDatabases();
     
        console.log("Databases:");
        databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    };

    app.get('/get_profile', (req, res) => {

        const uri = "mongodb+srv://sahajV:<password>@gameconnectcluster-zoadx.gcp.mongodb.net/test?retryWrites=true&w=majority";

        const client = new MongoClient(uri);

        try {
            // Connect to the MongoDB cluster
            await client.connect();

            // Make the appropriate DB calls
            await listDatabases(client);

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }

    });

    app.post('/post_profile', (req, res) => {

    });

    app.post('/update_profile', (req, res) => {

    });

}