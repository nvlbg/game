(function() {

	window.game.PlayScreen = me.ScreenObject.extend({
		onResetEvent : function() {
			me.levelDirector.loadLevel("water_hole");
			var network = new game.Networking();
		},

		onDestroyEvent : function() {
			
		}
	});

})();