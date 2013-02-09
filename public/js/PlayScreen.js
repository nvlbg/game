(function() {

	window.game.PlayScreen = me.ScreenObject.extend({
		onResetEvent : function() {
			game.network = new game.Network();
			new window.debugPanel();
			
			//me.gamestat.add("team", game.ENUM.TEAM.GREEN);
			//me.gamestat.add("friendly_fire", true);

			//var player = new game.Player(32, 32, 0, 0, 3, 0, 500);
			//me.game.add(player, 4);

			//window.game.player = player;
			
			//var enemy = new game.EnemyBot(320, 320, 0, 0, 3, 0, 500);
			//me.game.add(enemy, 4);

			//me.game.sort();
		},

		onDestroyEvent : function() {
			
		}
	});

})();