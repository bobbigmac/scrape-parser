
Meteor.publish('parser-helpers', function(_id) {
	if(this.userId && typeof Roles !== 'undefined' && Roles && Roles.userIsInRole(this.userId, 'admin')) {
		var filter = {};
		if(_id) {
			filter._id = _id;
		}
		return ParserHelpers.find(filter);
	}
	this.ready();
});

Meteor.publish('scrapers', function(_id) {
	if(this.userId && typeof Roles !== 'undefined' && Roles && Roles.userIsInRole(this.userId, 'admin')) {
		var filter = {};
		if(_id) {
			filter._id = _id;
		}
		return Parsers.find(filter);
	}
	this.ready();
});

Meteor.methods({
	removeParser: function(parserId) {
		if(this.userId && typeof Roles !== 'undefined' && Roles && Roles.userIsInRole(this.userId, 'admin')) {
			if(parserId && typeof(parserId) === 'string') {
				return Parsers.remove({ _id: parserId });
			}
		}
	},
	removeParserPath: function(parserId, path) {
		if(this.userId && typeof Roles !== 'undefined' && Roles && Roles.userIsInRole(this.userId, 'admin')) {
			if(parserId && path) {
				var unset = {};
				unset['paths.'+path] = "";
				return Parsers.update({ _id: parserId }, {
					$unset: unset
				});
			}
		}
	}
});