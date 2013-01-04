(function() {

	window.game.Friend = game.Tank.extend({
		init : function(x, y, direction, recoil, speed, friction) {
			this.parent(x, y, direction, recoil, speed, friction);

			this.pressed = 0;
			this.lastDirection = direction;
			this.lastPos = new me.Vector2d(0, 0);
			this.type = me.game.FRIEND_OBJECT;
		},

		update : function() {
			if(this.isExploding) {
				this.parent(this);
				return true;
			}

			if(this.pressed & game.ENUM.PRESSED.LEFT) {
				this.moveLeft();
			} else if(this.pressed & game.ENUM.PRESSED.RIGHT) {
				this.moveRight();
			}

			if(this.pressed & game.ENUM.PRESSED.UP) {
				this.moveUp();
			} else if(this.pressed & game.ENUM.PRESSED.DOWN) {
				this.moveDown();
			}

			var updated = this.pos.x !== this.lastPos.x || this.pos.y !== this.lastPos.y;

			this.updateMovement();

			updated = updated || this.vel.x !== 0 || this.vel.y !== 0;

			this.vel.x = this.vel.y = 0;
			this.lastPos.x = this.pos.x;
			this.lastPos.y = this.pos.y;
			
			if(updated) {
				this.parent(this);
				return true;
			}
			return false;
		}
	});

})();