import * as blockstack from 'blockstack';

document.getElementById('signin-button').addEventListener('click', function() {
  blockstack.redirectToSignIn();
})