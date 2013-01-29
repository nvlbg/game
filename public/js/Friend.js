(function() {

	window.game.Friend = game.Tank.extend({
		init : function(x, y, direction, recoil, speed, friction) {
			this.parent(x, y, direction, recoil, speed, friction);

			this.pressed = 0;
			this.type = me.game.FRIEND_OBJECT;
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