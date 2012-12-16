var PlayScreen = me.ScreenObject.extend({
	onResetEvent : function() {
		me.levelDirector.loadLevel("water_hole");
		var network = new Networking();
	},

	onDestroyEvent : function() {
		
	}
});