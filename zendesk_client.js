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
  var subdomain = (options && options.subdomain) || Meteor.settings.public.zendeskSubdomain;
  //https://{subdomain}.zendesk.com/oauth/authorizations/new?response_type=token&client_id={your_unique_identifier}&scope=read%20write
  var loginUrl =
    'https://' + subdomain + '.zendesk.com/oauth/authorizations/new' +
    '?response_type=code' +
    '&redirect_uri=' + OAuth._redirectUri('zendesk', config) +
    '&client_id=' + config.clientId +
    '&scope=' + flatScope +
    '&state=' + Zendesk._stateParam(loginStyle, credentialToken, undefined,
                                    subdomain) ;

  console.log("Zendesk login initiated w/ URL: ", loginUrl);
  console.log("LoginStyle", loginStyle);
  OAuth.launchLogin({
    loginService: "zendesk",
    loginStyle: loginStyle,
    loginUrl: loginUrl,
    credentialRequestCompleteCallback: credentialRequestCompleteCallback,
    credentialToken: credentialToken,
    popupOptions: {width: 900, height: 450}
  });
};


// WHO LIKES HACKS? CAUSE I SURE DO!
// This is identical to the OAuth._stateParam function with the added
// functionality to handle subdomain passing
Zendesk._stateParam = function (loginStyle, credentialToken, redirectUrl,
                                subdomain) {
  var state = {
    loginStyle: loginStyle,
    credentialToken: credentialToken,
    isCordova: Meteor.isCordova
  };

  if (subdomain) {
    state.subdomain = subdomain;
  }
  if (loginStyle === 'redirect') {
    state.redirectUrl = redirectUrl || ('' + window.location);
  }

  // Encode base64 as not all login services URI-encode the state
  // parameter when they pass it back to us.
  // Use the 'base64' package here because 'btoa' isn't supported in IE8/9.
  return Base64.encode(JSON.stringify(state));
};


