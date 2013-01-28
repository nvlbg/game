(function() {

	window.game.Friend = game.Tank.extend({
		init : function(x, y, direction, recoil, speed, friction) {
			this.parent(x, y, direction, recoil, speed, friction);

			this.pressed = 0;
			this.lastDirection = direction;
			this.lastPos = new me.Vector2d(0, 0);
			this.type = me.game.FRIEND_OBJECT;
		},

		update : function() {
			return this.updateHelper();
		}
	});

})();