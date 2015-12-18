Package.describe({
  name: 'bobbigmac:scrape-parser',
  version: '0.5.4',
  // Brief, one-line summary of the package.
  summary: 'Meteor package to scrape and parse remote webpages with definable parser specifications',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/bobbigmac/scrape-parser',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.1');
  api.use('mongo', ['server', 'client']);
  api.use('http', ['server']);

  //Tecnically templating is a weak dependency, but doesn't work if I specify weak manually
  api.use('templating', ['client']);

  api.use('rclai89:cheerio@1.0.0', ['server']);
  api.use('anonyfox:scrape@0.0.10', ['server']);

  //The router and roles are weak dependencies, include them in your project if you want to access the >scrapers template at /scrapers route
  api.use('iron:router@1.0.9', ['client'], { weak: true });
  api.use('alanning:roles@1.2.13', ['server', 'client'], { weak: true });

  api.addFiles('models/model.js', ['server', 'client']);

  api.addFiles('scrape-parser.js', ['server']);
  api.addFiles('scrape-parser-publish.js', ['server']);

  api.addFiles('scrape-parser.html', ['client']);
  api.addFiles('scrape-parser-client.js', ['client']);
  
  api.export("cheerio", ['server']);
  api.export("ScrapeParser", ['server']);
  api.export("ParserHelpers", ['client']);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('bobbigmac:scrape-parser');

  api.addFiles('scrape-parser-tests.js');
});
