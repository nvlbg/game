var Enemy = Tank.extend({
	init : function(x, y, direction, recoil, speed, friction) {
		this.parent(x, y, direction, recoil, speed, friction, true);
		
		this.type = me.game.ENEMY_OBJECT;
	},

	update : function() {
		if(this.isExploding) {
			this.parent(this);
			return true;
		}

		var updated = this.vel.x !== 0 || this.vel.y !== 0;
		
		if(updated) {
			this.parent(this);
			return true;
		}
		return false;
	}
});