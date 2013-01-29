(function() {

	window.game.Enemy = game.Tank.extend({
		init : function(x, y, direction, recoil, speed, friction) {
			this.parent(x, y, direction, recoil, speed, friction, true);
			
			this.pressed = 0;
			this.type = me.game.ENEMY_OBJECT;
		},

		update : function() {
			if(this.updateHelper() === true) {
				this.parent(this);
				return true;
			}
			return false;
		}
	});

})();