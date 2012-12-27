(function() {

	window.game.PlayScreen = me.ScreenObject.extend({
		onResetEvent : function() {
			me.levelDirector.loadLevel("water_hole");
			me.game.collisionMap.tileset.type['WATER'] = 'water';
			var network = new game.Networking();
		},

		onDestroyEvent : function() {
			
		}
	});

})();