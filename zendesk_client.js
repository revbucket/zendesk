Zendesk = {};

// Request Zendesk credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
Zendesk.requestCredential = function (options, credentialRequestCompleteCallback) {
  // support both (options, callback) and (callback).

  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }
  var config = ServiceConfiguration.configurations.findOne({service: 'zendesk'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(
      new ServiceConfiguration.ConfigError());
    return;
  }
  var credentialToken = Random.secret();

  var scope = (options && options.requestPermissions) || ['read'];
  var flatScope = _.map(scope, encodeURIComponent).join('+');

  var loginStyle = OAuth._loginStyle('zendesk', config, options);

  //https://{subdomain}.zendesk.com/oauth/authorizations/new?response_type=token&client_id={your_unique_identifier}&scope=read%20write
  var loginUrl =
    'https://maestroiq.zendesk.com/oauth/authorizations/new' +
    '?response_type=code' +

    '&client_id=' + config.clientId +
    '&scope=' + flatScope +
    '&state=' + OAuth._stateParam(loginStyle, credentialToken);

  OAuth.launchLogin({
    loginService: "zendesk",
    loginStyle: loginStyle,
    loginUrl: loginUrl,
    credentialRequestCompleteCallback: credentialRequestCompleteCallback,
    credentialToken: credentialToken,
    popupOptions: {width: 900, height: 450}
  });
};