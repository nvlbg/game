var Friend = Tank.extend({
	init : function(x, y, direction, recoil, speed, friction) {
		this.parent(x, y, direction, recoil, speed, friction);

		this.lastDirection = direction;
		this.type = me.game.FRIEND_OBJECT;
	},

	update : function() {
		if(this.isExploding) {
			this.parent(this);
			return true;
		}

		
		if(this.direction !== this.lastDirection) {
			this.fixDirection();
		}

		this.lastDirection = this.direction;

		var updated = this.vel.x !== 0 || this.vel.y !== 0;
		
		if(updated) {
			this.parent(this);
			return true;
		}
		return false;
	}
});