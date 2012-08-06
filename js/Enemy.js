var Enemy = Tank.extend({
	init : function(x, y, direction, recoil, speed, friction) {
		this.parent(x, y, direction, recoil, speed, friction, true);
	},

	update : function() {
		var updated = this.vel.x !== 0 || this.vel.y !== 0;
		
		if(updated) {
			this.parent(this);
			return true;
		}
		return false;
	}
});