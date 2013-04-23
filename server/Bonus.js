require('./Util.js');
var Rect = require('./Rect.js');

var idTracker = 0;
var Bonus = Rect.extend({
	init: function(pos, type, validTime) {
		this.parent(pos, 32, 32);
		this.type = type;
		this.valid = true;
		this.updated = true;
		this.id = idTracker++;

		setTimeout(function() {
			this.updated = true;
			this.valid = false;
		}.bind(this), validTime);
	}
});

module.exports = Bonus;
