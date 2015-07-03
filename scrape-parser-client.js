Meteor.startup(function(){
	if(Router) {
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
					Meteor.subscribe('scrapers', this.params._id)
				];
			},
			data: function() {
				//TODO: sorting, and fix template, then remove log
				console.log('giving scrapers data for', this.params._id, Parsers.find().fetch());
				return Parsers.find();
			}
		});
	}

	Template.unscrapedPaths.helpers({
		paths: function() {
			//TODO: Subscribe to unscraped paths
		}
	})
});