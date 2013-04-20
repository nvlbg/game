(function() {
	window.game = {};
	window.game.config = {};

	// configuring system variables
	me.sys.pauseOnBlur = false;
	me.sys.useNativeAnimFrame = true;
	window.game.config.doubleBuffering = true;
	// me.sys.interpolation = true;
	me.sys.preRender = true;
	// me.sys.dirtyRegion = true;
	me.sys.fps = 60;

	// add custom types
	me.game.BULLET_OBJECT = 4;
	me.game.FRIEND_OBJECT = 5;
})();