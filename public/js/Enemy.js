(function() {

	window.game.Enemy = game.Tank.extend({
		init : function(x, y, direction, recoil, speed, friction) {
			this.parent(x, y, direction, recoil, speed, friction, true);
			
			this.pressed = 0;
			this.lastDirection = direction;
			this.lastPos = new me.Vector2d(0, 0);
			this.type = me.game.ENEMY_OBJECT;
		},

		update : function() {
			if(this.isExploding) {
				this.parent(this);
				return true;
			}

			if(this.pressed & game.Network.PRESSED.LEFT) {
				this.moveLeft();
			} else if(this.pressed & game.Network.PRESSED.RIGHT) {
				this.moveRight();
			}

			if(this.pressed & game.Network.PRESSED.UP) {
				this.moveUp();
			} else if(this.pressed & game.Network.PRESSED.DOWN) {
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