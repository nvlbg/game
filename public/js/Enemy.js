var Enemy = Tank.extend({
	init : function(x, y, direction, recoil, speed, friction) {
		this.parent(x, y, direction, recoil, speed, friction, true);
		
		this.pressed = [false, false, false, false];
		this.lastDirection = direction;
		this.lastPos = new me.Vector2d(0, 0);
		this.type = me.game.ENEMY_OBJECT;
	},

	update : function() {
		if(this.isExploding) {
			this.parent(this);
			return true;
		}

		if(this.pressed[0]) {
			this.moveLeft();
		} else if(this.pressed[1]) {
			this.moveRight();
		}

		if(this.pressed[2]) {
			this.moveUp();
		} else if(this.pressed[3]) {
			this.moveDown();
		}

		
		//if(this.direction !== this.lastDirection) {
		//	this.fixDirection();
		//}
		//this.lastDirection = this.direction;

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