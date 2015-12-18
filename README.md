# Scrape Parser

Scrapes remote pages and runs regex matched parsers against the page content.

Define your own parsers and helpers for each site, and retrieve an object of keyed properties for each given url.

Will fall back to, and exposes [anonyfox:scrape](https://atmospherejs.com/anonyfox/scrape) when you don't define a parser for the url you provide.

All remote requests are made from the server.

## Intention

For light and customisable scrape use cases. Mainly intended for sites where you're including or organising links to pages from a manageable number of remote websites, where you want to pull in some data from their page, but either don't have, or too onerous to use a remote API.

Please scrape responsibly.

## Parser Usage (with helpers)
```
ScrapeParser.registerHelper('toInt', function(str, url) {
	return parseInt('0'+str.replace(',', ''));
});

ScrapeParser.registerHelper('titleLinks', function(arr, url) {
	return arr && arr.map(function(str) {
		var $ = cheerio.load(str);
		var link = $('a.title');
		return { link: link.attr('href'), title: link.text() };
	});
});

ScrapeParser.reset(); // Remove any/all stored parsers

ScrapeParser.parser('.*reddit.com.*', {
	topic: { path: 'meta[property="og:title"]', attribute: 'content' },
	subscribers: { path: '.subscribers .number', content: true, helper: 'toInt' },
	links: { path: 'a.title', attribute: 'href', multi: true },
	titles: { path: 'a.title', content: true, multi: true },
	titleLinks: { path: 'p.title', content: true, helper: 'titleLinks', multi: true },
});

ScrapeParser.resetExcept(['.*reddit.com.*']); // Remove stored parsers except those in array

ScrapeParser.get('http://www.reddit.com/r/javascript/');
```
### Parser Output
```
{ 
	topic: 'JavaScript • /r/javascript',
	subscribers: 67215,
	links: [
		'/r/javascript/comments/...', ...
	],
	titles: [
		'Some comments about javascript', ...
	],
	linkTitles: [
		{
			link: '/r/javascript/comments/...',
			title: 'Some comments about javascript'
		}, ...
	]
}
```

## Fallback (no parser match for given url)
```
ScrapeParser.get('https://www.meteor.com/');
```
### Standard anonyfox:scrape Output
```
{
	title: "Meteor",
	text: "Some text from the page",
	lang: "en",
	description: "Meteor is a complete platform for building web and mobile apps in pure JavaScript.",
	favicon: "https://www.meteor.com/favicon.png",
	references: [ "https://docs.meteor.com/",...],
	image: "https://d14jjfgstdxsoz.cloudfront.net/og-image-logo.png",
	feeds: ["http://info.meteor.com/blog/rss.xml"],
	tags: ["meteor", "javascript", "keywords"],
	domain: "www.meteor.com",
	url: "https://www.meteor.com/"
}
```

## TODO

No plans to change the api, but will probably add to the field spec allowed keys with additional built in helpers.

Currently runs only the first matched parser against the page body.

* Maybe add support for shared parsers
* Maybe add/edit/maintenance UI
* Could use some extra format checking
* Validate each field returns a result
* Flag failing paths for admin to review
* Need test suite

PRs welcome.