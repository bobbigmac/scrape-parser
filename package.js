Package.describe({
  name: 'bobbigmac:scrape-parser',
  version: '0.5.1',
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
  api.use('mongo', ['server']);
  api.use('http', ['server']);
  api.use('rclai89:cheerio@1.0.0', ['server']);
  api.use('anonyfox:scrape@0.0.10', ['server']);

  api.addFiles('models/model.js', ['server']);
  api.addFiles('scrape-parser.js', ['server']);
  
  api.export("cheerio", ['server']);
  api.export("ScrapeParser", ['server']);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('bobbigmac:scrape-parser');

  api.addFiles('scrape-parser-tests.js');
});
