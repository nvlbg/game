var PlayScreen = me.ScreenObject.extend({
	onResetEvent : function() {
		me.levelDirector.loadLevel("water_hole");

		var player = new Player(257, 546, "up", 0.4, 3, 0.2);
		me.game.add(player, 4);
		me.game.sort();

		var enemy = new Enemy(250, 580, "right", 0.4, 3, 0.2);
		me.game.add(enemy, 4);
		me.game.sort();
	},

	onDestroyEvent : function() {
		
	}
});