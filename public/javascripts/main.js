import * as blockstack from 'blockstack';

const appConfig = new blockstack.AppConfig();
const userSession = new blockstack.UserSession({ appConfig: appConfig });

userSession.redirectToSignIn();