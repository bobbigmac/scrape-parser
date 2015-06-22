# Scrape Parser

Scrapes remote pages and runs regex matched parsers against the page content.

Define your own parsers and helpers for each site, and retrieve an object of keyed properties for each given url.

Will fall back to, and exposes [anonyfox:scrape](https://atmospherejs.com/anonyfox/scrape) when you don't define a parser for the url you provide.

## Parser Usage
```
ScrapeParser.registerHelper('toInt', function(str) {
	return parseInt('0'+str.replace(',', ''));
});

ScrapeParser.registerHelper('titleLinks', function(arr) {
	return arr && arr.map(function(str) {
		var $ = cheerio.load(str);
		var link = $('a.title');
		return {
			link: link.attr('href'),
			title: link.text()
		};
	});
});

ScrapeParser.parser('.*reddit.com.*', {
	topic: { path: 'meta[property="og:title"]', attribute: 'content' },
	subscribers: { path: '.subscribers .number', content: true, helper: 'toInt' },
	links: { path: 'a.title', attribute: 'href', multi: true },
	titles: { path: 'a.title', content: true, multi: true },
	titleLinks: { path: 'p.title', content: true, helper: 'titleLinks', multi: true },
});

ScrapeParser.get('http://www.reddit.com/r/javascript/');
```
### Parser Output
```
{ 
	topic: 'JavaScript • /r/javascript',
	subscribers: 67215,
	links: [
		'/r/javascript/comments/......',
		'https://blog.javascriptin......'
	],
	titles: [
		'Some comments about javascript',
		'Some blog post about javascript'
	],
	linkTitles: [
		{
			link: '/r/javascript/comments/......',
			title: 'Some comments about javascript'
		}, 
		{ ... }
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