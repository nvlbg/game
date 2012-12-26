(function() {
	
	window.game.MenuScreen = me.ScreenObject.extend({
		init: function() {
			this.parent(true);
			this.font = null;
			this.arrow = null;
			this.menuItems = null;
			this.selectedItem = 0;
			this.tween =  null;

			this.initialized = false;
		},

		onResetEvent: function() {
			if(!this.initialized) {
				this.font = new me.Font('visitor1', 32, 'white');
				this.arrow = new me.SpriteObject(80, 80, me.loader.getImage("bullet"));
				this.menuItems = [
					new me.Vector2d(200, 350),
					new me.Vector2d(200, 415)
				];
				this.selectedItem = 0;

				//this.tween = new me.Tween(this.arrow.pos).to({
				//	x: 200
				//},400).onComplete(this.tweenbw.bind(this)).start();

				this.initialized = true;
			}

			this.arrow.pos.y = this.menuItems[this.selectedItem].y;
			me.game.add(this.arrow, 100);
		},

		onDestroyEvent: function() {
			this.font = null;
			this.arrow = null;
			this.selectedItem = 0;
			this.tween = null;
			this.initialized = false;
		},

		update: function() {
			if (me.input.isKeyPressed("up")) {
				if (this.selectedItem > 0) {
					this.selectedItem--;
				}
				this.arrow.pos.y = this.menuItems[this.selectedItem].y;
				return true;
			}
			if (me.input.isKeyPressed("down")) {
				if (this.selectedItem < this.menuItems.length - 1) {
					this.selectedItem++;
				}
				this.arrow.pos.y = this.menuItems[this.selectedItem].y;
				return true;
			}
			if (me.input.isKeyPressed("enter")) {
				if (this.selectedItem == 0) {
					//me.state.change(me.state.PLAY)
				}
				if (this.selectedItem == 1) {
					//me.state.change(me.state.CREDITS)
				}
				return true;
			}

			return true;
		},

		draw: function(context) {
			me.video.clearSurface(context, "black");
		}
	});

})();