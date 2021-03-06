(function() {

	window.game.Enemy = game.Tank.extend({
		init : function(x, y, direction, speed, friction, nickname) {
			this.parent(x, y, direction, speed, friction, nickname, true);
			
			this.pressed = 0;
			this.type = me.game.ENEMY_OBJECT;

			/*
			var debug = window.game.debugPanel.gui.addFolder('Other player: ' + this.GUID);
			debug.add(this.pos, 'x').listen();
			debug.add(this.pos, 'y').listen();
			debug.open();
			*/
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