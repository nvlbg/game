// (function() {
	var resources = [
		{ name : "sprites",    type : "image", src : "data/sprites/sprites.png" },
		{ name : "tanks",      type : "image", src : "data/sprites/tanks.png" },
		{ name : "star",       type : "image", src : "data/sprites/star.png" },
		{ name : "bullet",     type : "image", src : "data/sprites/bullet.png" },
		// I think the followint line is unnecessary
		// { name : "metatiles",  type : "image", src : "data/sprites/metatiles.png" },
		{ name : "water_hole", type : "tmx",   src : "data/maps/water_hole.tmx" }
	];

	// configuring system variables
	me.sys.pauseOnBlur = false;
	me.sys.useNativeAnimFrame = true;
	me.sys.interpolation = true;
	me.sys.fps = 60;

	var jsApp = {
		/**
		called when document is loaded
		*/
		onload : function() {
			// init the video
			if (!me.video.init('jsapp', 800, 600, false, 1.0)) {
				alert("Sorry but your browser does not support html 5 canvas.");
				return;
			}
			
			// initialize the "audio"
			me.audio.init("mp3,ogg");
			
			// set custom constants for the game
			me.game.BULLET_OBJECT = 4;
			me.game.FRIEND_OBJECT = 5;
			
			// set all resources to be loaded
			me.loader.onload = this.loaded.bind(this);
			me.loader.preload(resources);

			// load everything & display a loading screen
			me.state.change(me.state.LOADING);
		},

		/**
		callback when everything is loaded
		*/
		loaded : function() {
			// set game screens
			me.state.set(me.state.LOADING, new LoadingScreen());
			me.state.set(me.state.MENU, new MenuScreen());
			me.state.set(me.state.PLAY, new PlayScreen());

			me.entityPool.add("mainPlayer", Player);

			// bind key events
			me.input.bindKey(me.input.KEY.UP,    "up"   );
			me.input.bindKey(me.input.KEY.RIGHT, "right");
			me.input.bindKey(me.input.KEY.DOWN,  "down" );
			me.input.bindKey(me.input.KEY.LEFT,  "left" );
			me.input.bindKey(me.input.KEY.SPACE, "shoot");

			// start the game 
			me.state.change(me.state.PLAY);
		}
	};

	window.onReady(function() {
		jsApp.onload();
	});
// })();