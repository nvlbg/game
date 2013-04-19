(function() {

	window.game.PlayScreen = me.ScreenObject.extend({
		stats: null,

		onResetEvent : function() {
			// window.game.network = new game.Network();
			window.game.network.start();
			//window.game.melonDebugPanel = new window.debugPanel();
			window.game.debugPanel = new window.game.debug();
			
			//me.gamestat.add("team", game.ENUM.TEAM.GREEN);
			//me.gamestat.add("friendly_fire", true);

			//var player = new game.Player(32, 32, 0, 0, 3, 0, 500);
			//me.game.add(player, 4);

			//window.game.player = player;
			
			//var enemy = new game.EnemyBot(320, 320, 0, 0, 3, 0, 500);
			//me.game.add(enemy, 4);

			//me.game.sort();
			
			/*
			this.stats = new Stats();
			this.stats.setMode(0); // 0: fps, 1: ms

			// Align top-left
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.left = '0px';
			this.stats.domElement.style.top = '0px';

			document.body.appendChild( this.stats.domElement );
			*/
		},

		onUpdateFrame : function() {
			//this.stats.begin();
			this.parent();
			//this.stats.end();
		}
	});

})();