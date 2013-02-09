(function() {
	window.game = {};

	window.game.ENUM = window.ENUM;

	// configuring system variables
	me.sys.pauseOnBlur = false;
	me.sys.useNativeAnimFrame = true;
	me.sys.interpolation = true;
	// me.sys.preRender = true;
	me.sys.fps = 60;

	// add custom types
	me.game.BULLET_OBJECT = 4;
	me.game.FRIEND_OBJECT = 5;
})();