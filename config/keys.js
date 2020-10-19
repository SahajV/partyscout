module.exports = {
    authURI: process.env.PARTYSCOUT_KEY.replace("<dbname>", "userLoginData"),
    generalURI: process.env.PARTYSCOUT_KEY.replace("<dbname>", "test")
};
