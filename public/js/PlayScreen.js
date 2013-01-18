(function() {

	window.game.PlayScreen = me.ScreenObject.extend({
		onResetEvent : function() {
			me.levelDirector.loadLevel("water_hole");
			me.game.collisionMap.tileset.type.WATER = 'water';
			// var network = new game.Network();
			
			me.gamestat.add("team", game.ENUM.TEAM.GREEN);
			me.gamestat.add("friendly_fire", true);

			var player = new game.Player(32, 32, 0, 0, 3, 0, 250);
			me.game.add(player, 4);

			var enemy = new game.EnemyBot(320, 320, 0, 0, 3, 0, 250);
			me.game.add(enemy, 4);

			me.game.sort();
		},

		onDestroyEvent : function() {
			
		}
	});

})();