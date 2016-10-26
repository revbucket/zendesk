Zendesk = {};

OAuth.registerService('zendesk', 2, null, function(query) {
  var accessToken = getAccessToken(query);
  var identity = getIdentity(accessToken);
  const serviceData = {id: String(identity.user.id),
                       accessToken: OAuth.sealSecret(accessToken),
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

var getAccessToken = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'zendesk'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  var response;
  try {
    response = HTTP.post(
      "https://maestroiq.zendesk.com/oauth/tokens", {
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

var getIdentity = function (accessToken) {
  try {
    return HTTP.get(
      "https://maestroiq.zendesk.com/api/v2/users/me.json", {
        params: {access_token: accessToken}
      }).data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Zendesk. " + err.message),
                   {response: err.response});
  }
};


Zendesk.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);

};

