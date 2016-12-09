Zendesk = {};

OAuth.registerService('zendesk', 2, null, function(query) {

  const subdomain =  (decodeState(query.state) || {}).subdomain || Meteor.settings.public.zendeskSubdomain;

  var accessToken = getAccessToken(query, subdomain);
  var identity = getIdentity(accessToken, subdomain);
  const serviceData = {id: String(identity.user.id),
                       accessToken: OAuth.sealSecret(accessToken),
                       subdomain: subdomain,
                      }

  _.forEach(['email', 'url', 'role'], function(el) {
    if (identity.user[el]) {
      serviceData[el] = identity.user[el];
    }
  });
  //return {};
  return {serviceData: serviceData,
          options: {profile: {name: identity.user.name}}};

});

// http://developer.github.com/v3/#user-agent-required
var userAgent = "Meteor";

if (Meteor.release)
  userAgent += "/" + Meteor.release;

var getAccessToken = function (query, subdomain) {
  var config = ServiceConfiguration.configurations.findOne({service: 'zendesk'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();
  var response;
  try {
    var data =           {
          grant_type: 'authorization_code',
          code: query.code,
          client_id: config.clientId,
          client_secret: OAuth.openSecret(config.secret),
          redirect_uri: OAuth._redirectUri('zendesk', config),
          scope: 'read'
        }
    console.log("DATA TO SEND", data);
    console.log("URL TO SEND IT TO", "https://" + subdomain + ".zendesk.com/oauth/tokens");
    response = HTTP.post(
      "https://" + subdomain + ".zendesk.com/oauth/tokens", {
        headers: {
          'Content-Type': 'application/json'
        },
        data:
          {
          grant_type: 'authorization_code',
          code: query.code,
          client_id: config.clientId,
          client_secret: OAuth.openSecret(config.secret),
          redirect_uri: OAuth._redirectUri('zendesk', config),
          scope: 'read'
        }
      });
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with Zendesk. " + err.message),
                   {response: err.response});
  }

  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with Zendesk. " + response.data.error);
  } else {
    return response.data.access_token;
  }
};

var getIdentity = function (accessToken, subdomain) {
  try {
    return HTTP.get(
      "https://" + subdomain + ".zendesk.com/api/v2/users/me.json", {
        params: {access_token: accessToken}
      }).data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Zendesk. " + err.message),
                   {response: err.response});
  }
};

var decodeState = function(state) {
  var res = [];
  const arr = Base64.decode(state);
  for (var i = 0; i < arr.length; i ++) {
    res.push(String.fromCharCode(arr[i]));
  }
  return JSON.parse(res.join(""));
}


Zendesk.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);

};

