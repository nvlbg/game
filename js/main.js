(function() {
	var resources = [];

	var jsApp = {
		/**
		called when document is loaded
		*/
		onload : function() {
			// init the video
			if (!me.video.init('jsapp', 640, 480, false, 1.0)) {
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
			
			// start the game 
			me.state.change(me.state.PLAY);
		}
	};

	var PlayScreen = me.ScreenObject.extend({
		onResetEvent : function() {

		},

		onDestroyEvent : function() {
			
		}
	});

	window.onReady( jsApp.onload );
})();