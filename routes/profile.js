module.exports.set = function (app) {
    // const MongoClient = require('mongodb').MongoClient;

    // app.get('/profile', (req, res) => {

    // });

    // async function listDatabases(client){
    //     databasesList = await client.db().admin().listDatabases();
     
    //     console.log("Databases:");
    //     databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    // };

    // async function main(){

    //     const uri = "mongodb+srv://sahajV:<BqBCuf7ID4vn7uEh>@gameconnectcluster-zoadx.gcp.mongodb.net/test?retryWrites=true&w=majority";
    
    //     const client = new MongoClient(uri);
     
    //     try {
    //         // Connect to the MongoDB cluster
    //         await client.connect();
     
    //         // Make the appropriate DB calls
    //         await  listDatabases(client);
     
    //     } catch (e) {
    //         console.error(e);
    //     } finally {
    //         await client.close();
    //     }
    // }
    
    // main().catch(console.error);

    // app.get('/get_profile', (req, res) => {

    //     main();

    // });

    // app.post('/post_profile', (req, res) => {

    // });

    app.post('/update_profile', (req, res) => {

    });

}