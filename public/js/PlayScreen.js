var PlayScreen = me.ScreenObject.extend({
	onResetEvent : function() {
		me.levelDirector.loadLevel("water_hole");

		socket.on('spawn', function(pos) {
			console.log(pos);
			var player = new Player(pos.x, pos.y, "up", 0, 3, 0.2);
			me.game.add(player, 4);
			me.game.sort();
		});
		socket.emit('spawnRequest');

		/*
		socket.on('spawn', function(pos) {
			console.log(pos);
			console.log(me.game.viewport);
			var player = new Player(pos.x, pos.y, "up", 0, 3, 0.2);
			me.game.add(player, 4);
			me.game.sort();
		});
		socket.emit('spawn');

		var bonus = new Bonus(250, 500, 0, 3000);
		me.game.add(bonus, 4);
		me.game.sort();

		var enemy = new Enemy(250, 580, "right", 0.4, 3, 0.2);
		me.game.add(enemy, 4);
		me.game.sort();
		*/
	},

	onDestroyEvent : function() {
		
	}
});