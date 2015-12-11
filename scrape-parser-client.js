Meteor.startup(function(){
	if(typeof Router !== 'undefined' && Router) {
		var currentUser = {
		  ready: function() {
		    var user = Meteor.user();
		    return (user === null || typeof user !== "undefined");
		  }
		};

		Router.route('/scrapers/:_id?', {
			name: 'scrapers',
			waitOn: function() {
				return [
					currentUser,
					Meteor.subscribe('scrapers', this.params._id),
					Meteor.subscribe('parser-helpers')
				];
			},
			data: function() {
				return Parsers.find();
			}
		});

		Router.route('/scraper/:_id?', {
			name: 'scraper',
			waitOn: function() {
				return [
					currentUser,
					Meteor.subscribe('scrapers', this.params._id),
					Meteor.subscribe('parser-helpers')
				];
			},
			data: function() {
				return Parsers.find();
			}
		});
	}

	Template.unscrapedUrls.helpers({
		paths: function() {
			//TODO: Subscribe to unscraped paths
		}
	});

	Template.scraperSpec.rendered = function() {
		Session.set('confirm-delete', false);
	};

	Template.scraperSpec.events({
		'click .confirm-remove-parser': function(e, t) {
			Session.set('confirm-delete', this._id);
		},
		'click .remove-parser': function(e, t) {
			Meteor.call('removeParser', this._id);
		}
	});

	Template.scraperLink.helpers({
		pathKeys: function() {
			return this.paths && (Object.keys(this.paths)||[]).join(', ');
		},
		pathKeyCount: function() {
			return this.paths && Object.keys(this.paths).length;
		}
	});

	Template.scraperSpec.helpers({
		paths: function() {
			var paths = this.paths;
			if(paths) {
				var _id = this._id;
				paths = Object.keys(paths).map(function(key) {
					return { key: key, spec: paths[key], scraper: _id };
				});
				paths.push({ key: '', spec: {}, scraper: _id });
			} else {
				paths = [{ key: '', spec: {}, scraper: _id }];
			}
			return paths;
		},
		confirm: function() {
			return Session.equals('confirm-delete', this._id);
		}
	});

	Template.pathEntry.rendered = function(e, t) {
		var select = this.$(this.find('select'));
		if(select && select.selectpicker) {
			select.selectpicker();
		}
	};

	Template.pathEntry.helpers({
		confirm: function() {
			return Session.equals('confirm-delete', this.scraper+'_'+this.key);
		},
		helpers: function() {
			var available = [{ name: 'No Helper' }];
			ParserHelpers.find().fetch().forEach(function(helper) {
				available.push(helper);
			});
			return available;
		},
		equals: function(a, b) {
			return a === b;
		}
	});

	Template.pathEntry.events({
		'click .confirm-remove-path': function(e, t) {
			Session.set('confirm-delete', this.scraper+'_'+this.key);
		},
		'click .remove-path': function(e, t) {
			Meteor.call('removeParserPath', this.scraper, this.key, function() {
				Session.set('confirm-delete', false);
			});
		}
	})
});