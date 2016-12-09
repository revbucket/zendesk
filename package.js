Package.describe({
  name: "revbucket:zendesk",
  summary: "Zendesk OAuth flow",
  version: '1.1.5',
  documentation: 'README.md',
  git: 'https://github.com/revbucket/zendesk.git'
});

Package.onUse(function(api) {
  api.use('http@1.2.10', ['client', 'server']);
  api.use('templating@1.2.13', 'client');
  api.use('base64@1.0.9', ['client', 'server']);
  api.use('oauth2@1.1.11', ['client', 'server']);
  api.use('oauth@1.1.11', ['client', 'server']);
  api.use('random@1.0.10', 'client');
  api.use('underscore@1.0.3', 'server');
  api.use('service-configuration@1.0.10', ['client', 'server']);

  api.export('Zendesk');

  api.addFiles(
    ['zendesk_configure.html', 'zendesk_configure.js'],
    'client');



  api.addFiles('zendesk_server.js', 'server');
  api.addFiles('zendesk_client.js', 'client');
});