// simple server with a protected resource at /secret secured by OAuth 2

var OAuth2Provider = require('oauth2-provider').OAuth2Provider
  , MemoryStore = require('express').session.MemoryStore

// hardcoded list of <client id, client secret> tuples
var myClients = {
 '1': '1secret',
};

// temporary grant storage
var myGrants = {};

var myOAP = new OAuth2Provider({crypt_key: 'encryption secret', sign_key: 'signing secret'});

// before showing authorization page, make sure the user is logged in
myOAP.on('enforce_login', function(req, res, authorize_url, next) {
  if(req.session.user) {
    next(req.session.user);
  } else {
    res.writeHead(303, {Location: '/auth/login?next=' + encodeURIComponent(authorize_url)});
    res.end();
  }
});

// render the authorize form with the submission URL
// use two submit buttons named "allow" and "deny" for the user's choice
myOAP.on('authorize_form', function(req, res, client_id, authorize_url) {
  res.end('<html>this app wants to access your account... <form method="post" action="' + authorize_url + '"><button name="allow">Allow</button><button name="deny">Deny</button></form>');
});

// save the generated grant code for the current user
myOAP.on('save_grant', function(req, client_id, code, next) {
  if(!(req.session.user in myGrants))
    myGrants[req.session.user] = {};

  myGrants[req.session.user][client_id] = code;
  next();
});

// remove the grant when the access token has been sent
myOAP.on('remove_grant', function(user_id, client_id, code) {
  if(myGrants[user_id] && myGrants[user_id][client_id])
    delete myGrants[user_id][client_id];
});

// find the user for a particular grant
myOAP.on('lookup_grant', function(client_id, client_secret, code, next) {
  // verify that client id/secret pair are valid
  if(client_id in myClients && myClients[client_id] == client_secret) {
    for(var user in myGrants) {
      var clients = myGrants[user];

      if(clients[client_id] && clients[client_id] == code)
        return next(null, user);
    }
  }

  next(new Error('no such grant found'));
});

// embed an opaque value in the generated access token
myOAP.on('create_access_token', function(user_id, client_id, next) {
  var extra_data = 'blah'; // can be any data type or null
  //var oauth_params = {token_type: 'bearer'};

  next(extra_data/*, oauth_params*/);
});

// (optional) do something with the generated access token
myOAP.on('save_access_token', function(user_id, client_id, access_token) {
  console.log('saving access token %s for user_id=%s client_id=%s', JSON.stringify(access_token), user_id, client_id);
});

// an access token was received in a URL query string parameter or HTTP header
myOAP.on('access_token', function(req, token, next) {
  var TOKEN_TTL = 10 * 60 * 1000; // 10 minutes

  if(token.grant_date.getTime() + TOKEN_TTL > Date.now()) {
    req.session.user = token.user_id;
    req.session.data = token.extra_data;
  } else {
    console.warn('access token for user %s has expired', token.user_id);
  }

  next();
});

// (optional) client authentication (xAuth) for trusted clients
myOAP.on('client_auth', function(client_id, client_secret, username, password, next) {
  if(client_id == '1' && username == 'guest') {
    var user_id = '1337';

    return next(null, user_id);
  }

  return next(new Error('client authentication denied'));
});

function escape_entities(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

exports.myOAP = myOAP;
