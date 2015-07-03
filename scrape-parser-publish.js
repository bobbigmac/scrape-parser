
Meteor.publish('scrapers', function(_id) {
	if(this.userId && Roles && Roles.userIsInRole(this.userId, 'admin')) {
		//console.log('User', this.userId, 'has permission to subscribe to scrapers');
		var filter = {};
		if(_id) {
			filter._id = _id;
		}
		return Parsers.find(filter);
	}
	//console.log('User', this.userId, 'DOES NOT HAVE permission to subscribe to scrapers');
	this.ready();
});