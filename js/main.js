(function() {
	var resources = [
		{ name : "sprites",    type : "image", src : "data/sprites/sprites.png" },
		{ name : "tanks",      type : "image", src : "data/sprites/tanks.png" },
		{ name : "water_hole", type : "tmx",   src : "data/maps/water_hole.tmx" }
	];

	me.gamestat.add("team", "green"); // your team (green or blue)

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
			
			// set all resources to be loaded
			me.loader.onload = this.loaded.bind(this);
			
			// set all resources to be loaded
			me.loader.preload(resources);

			// load everything & display a loading screen
			me.state.change(me.state.LOADING);
		},

		/**
		callback when everything is loaded
		*/
		loaded : function() {
			// set the "Play/Ingame" Screen Object
			me.state.set(me.state.PLAY, new PlayScreen());

			me.entityPool.add("mainPlayer", Player);

			me.input.bindKey(me.input.KEY.UP,    "up"         );
			me.input.bindKey(me.input.KEY.RIGHT, "right"      );
			me.input.bindKey(me.input.KEY.DOWN,  "down"       );
			me.input.bindKey(me.input.KEY.LEFT,  "left"       );
			me.input.bindKey(me.input.KEY.SPACE, "shoot", true);

			// start the game 
			me.state.change(me.state.PLAY);
		}
	};

	window.onReady(function() {
		jsApp.onload();
	});
})();