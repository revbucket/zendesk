Package.describe({
  name: "revbucket:zendesk",
  summary: "Zendesk OAuth flow",
  version: '1.1.0'
  documentation: 'README.md',
  git: 'https://github.com/revbucket/zendesk.git'
});

Package.onUse(function(api) {
  api.use('http', ['client', 'server']);
  api.use('templating@1.2.13', 'client');
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('random', 'client');
  api.use('underscore', 'server');
  api.use('service-configuration', ['client', 'server']);

  api.export('Zendesk');

  api.addFiles(
    ['zendesk_configure.html', 'zendesk_configure.js'],
    'client');



  api.addFiles('zendesk_server.js', 'server');
  api.addFiles('zendesk_client.js', 'client');
});