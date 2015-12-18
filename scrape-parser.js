
parseHelpers = {};

ScrapeParser = {
	/**
 * Returns all registered parsers
 * @param  {string} match    String representation of regular expression as given to new RegExp(match)
 * @return {array}           Array of objects with match, paths and _id properties
 */
	parsers: function(match) {
		return Parsers.find().fetch().map(function(parser) {
			return { match: parser.match, paths: parser.paths, _id: parser._id };
		});
	},
	/**
 * Removes all registered parsers
 * @return {integer}         Number of removed parsers
 */
	reset: function() {
		return Parsers.remove({});
	},
	/**
 * Removes all registered parsers except those with a match string in provided array
 * @param  {array} exceptMatches    Array of match strings for the parsers to keep
 * @return {integer}                Number of removed parsers
 */
	resetExcept: function(exceptMatches) {
		exceptMatches = exceptMatches || [];
		return Parsers.remove({ match: { $nin: exceptMatches }});
	},
	/**
 * Fetches, or updates a parser by match or parserId. Sets new paths if provided.
 * @param  {string} match    String representation of regular expression as given to new RegExp(match)
 * @param  {object} paths    Optional. Object of key/values where each key will parse by provided settings to a resulting parse object
 * @param  {string} parserId Optional. Internal _id of parser record to fetch or update.
 * @return {object}          Returns the parser specified by either the parserId or the match regexp string representation. If you provide replacement paths you will receive the updated version.
 */
	parser: function(match, paths, parserId) {
		if(!parserId || (parserId && typeof parserId === 'string')) {
			//console.log(typeof match, match);
			if(match && typeof match === 'string') {
				var query = {};
			  if(parserId && typeof(parserId) === 'string') {
			  	query._id = parserId
			  } else {
			  	query.match = match+'';
			  }

				var parser = Parsers.findOne(query);

				if(paths && typeof paths === 'object' && !(paths instanceof Array)) {
					if(!parser) {
						Parsers.insert({ match: match+'', paths: paths });
					} else {
						Parsers.update(query, { $set: {
							paths: paths
						}});
					}
					
					parser = Parsers.findOne(query);
				}
				return parser;
			} else {
				throw new Meteor.Error(400, 'match must be string');
			} 
		} else {
			throw new Meteor.Error(400, 'parserId must be string, or undefined');
		}
	},
	/**
 * Get the page for a url and check for a parser to handle it. If no parser is available, fallback to using Scrape.
 * @param  {string} url      A string url
 * @param  {string} parserId Explicitly specify which parser you'd like to use. Must already have been registered using ScrapeParser.parser(match, paths)
 * @return {object}          Object with keys as specified by your parser object's paths properties
 */
	get: function(url, parserId) {
		if(url) {
			var parsers = Parsers.find({}, {
				fields: { _id: 1, match: 1, matches: 1 }
			}).fetch();

	  	var parser = false;
	  	for(var i = 0; i < parsers.length && !parser; i++) {
	  		if(parsers[i].match && RegExp(parsers[i].match, 'gim').test(url)) {
	  			parser = parsers[i];
	  		}
	  		if(parsers[i].matches && parsers[i].matches.some(function(match) {
	  			return new RegExp(match, 'gim').test(url);
	  		})) {
	  			parser = parsers[i];
	  		}
	  	}

	  	var query = { _id: parser._id };
	  	if(parserId && typeof(parserId) === 'string') {
	  		query._id = parserId;
	  	}
	  	parser = Parsers.findOne(query);
	  	parser = (parser && parser.paths) || false;

	  	var scanned = false;
	  	if(parser) {
	  		var response = Meteor.http.get(url);
	    	var body = response && response.content;
	    	if(body) {
		    	var $ = cheerio.load(body);

		    	scanned = {};
		    	Object.keys(parser).forEach(function(key, pos) {
		    		var node = $(parser[key].path);
		    		var val = false;

		    		if(!parser[key].multi) {
			    		if(parser[key].content) {
			    			val = node.html();
			    		}
			    		if(parser[key].attribute) {
			    			val = node.attr(parser[key].attribute);
			    		}
			    		val = (val+'').trim();
			    	} else {
			    		val = [];

			    		for(var i = 0; i < node.length; i++) {
				    		if(parser[key].content) {
			    				subVal = $(node[i]).html();
				    		}
				    		if(parser[key].attribute) {
				    			subVal = $(node[i]).attr(parser[key].attribute);
				    		}
				    		if(subVal) {
				    			val.push(subVal);
				    		}
			    		};
			    	}

		    		if(parser[key].helper && typeof parseHelpers[parser[key].helper] === 'function') {
		    			val = parseHelpers[parser[key].helper](val, url);
		    		}
		    		scanned[key] = val;
		    	});
	    		
	    		scanned['scrape-parser-id'] = (''+parser._id);
		    } else {
					throw new Meteor.Error(400, 'url returns no body content');
		    }

	    	//TODO: Support parser output validation and raising issues to admin, recording changed page, and elegant fallback
	    } else {
	    	scanned = (Scrape && Scrape.website(url));
	    	scanned['scrape-parser-id'] = 'fallback';
	    }

	    return scanned;
	  } else {
			throw new Meteor.Error(400, 'url must be string');
		}
	},
	/**
 * Registers a helper function to be used to process the result of a cheerio selector into a string, value or object
 * @param  {string}   name Name of the helper function, as you would pass to parse property of field specifier
 * @param  {function} func Parser implementation handler, will receive the string resulting from html content or attribute value for the field specifier.
 */
	registerHelper: function(name, func) {
		if(name && typeof name === 'string') {
			if(!func || (func && typeof func === 'function')) {
				parseHelpers[name] = func;

				var keys = Object.keys(parseHelpers);
				var registered = ParserHelpers.find();

				if(keys.length !== registered.count()) {
					registered.fetch().forEach(function(oldHelper) {
						ParserHelpers.remove({ _id: oldHelper._id });
					});
					keys.forEach(function(newHelper) {
						ParserHelpers.insert({ name: newHelper });
					});
				}
			} else {
				throw new Meteor.Error(400, 'func must be a function, or undefined');
			}
		} else {
			throw new Meteor.Error(400, 'name must be string');
		}
	}
};