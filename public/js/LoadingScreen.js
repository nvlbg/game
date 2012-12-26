(function() {

	window.game.LoadingScreen = me.ScreenObject.extend({
		init: function() {
			// pass true to the parent constructor
			// as we draw our progress bar in the draw function
			this.parent(true);

			// a font logo
			this.font = new me.Font('visitor1', 32, 'white');

			// flag to know if we need to refresh the display
			this.invalidate = false;

			// load progress in percent
			this.loadPercent = 0;

			// setup a callback
			me.loader.onProgress = this.onProgressUpdate.bind(this);
		},

		// will be fired by the loader each time a resource is loaded
		onProgressUpdate: function(progress) {
			this.loadPercent = progress;
			this.invalidate = true;
		},

		// make sure the screen is only refreshed on load progress
		update: function() {
			if (this.invalidate === true) {
				this.invalidate = false;
				return true;
			}
			return false;
		},

		// on destroy event
		onDestroyEvent : function () {
			// "nullify" all fonts
			this.font = null;
		},

		//	draw function
		draw : function(context) {
			// clear the screen
			me.video.clearSurface(context, "black");

			// measure the logo size
			var logo_width = this.font.measureText(context, "LOADING...").width;

			// draw our text somewhere in the middle
			this.font.draw(context,
						   "LOADING...",
						   (context.canvas.width - logo_width) / 2,
						   context.canvas.height / 2 - 30
						  );

			// display a progressive loading bar
			var width = Math.floor(this.loadPercent * context.canvas.width);

			// draw the progress bar
			context.strokeStyle = "#FFF";
			context.strokeRect(0, (context.canvas.height / 2) + 40, context.canvas.width, 16);
			context.fillStyle = "#0F0";
			context.fillRect(2, (context.canvas.height / 2) + 42, width-4, 12);
		}
	});

})();