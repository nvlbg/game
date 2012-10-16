var Player = Tank.extend({
	/**
	constructor
	*/
	init : function(x, y, direction, recoil, speed, friction) {
		this.parent(x, y, direction, recoil, speed, friction);
		
		me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
	},

	/**
	called on each frame
	*/
	update : function() {
		if(this.isExploding) {
			this.parent(this);
			return true;
		}

		var updated = this.vel.x !== 0 || this.vel.y !== 0;

		if(me.input.isKeyPressed("left")) {
			this.moveLeft();
		} else if (me.input.isKeyPressed("right")) {
			this.moveRight();
		}

		if(me.input.isKeyPressed("up")) {
			this.moveUp();
		} else if (me.input.isKeyPressed("down")) {
			this.moveDown();
		}


		if(me.input.isKeyPressed("shoot")) {
			this.shoot();
		}

		
		if(this.isCurrentAnimation("shootForward") || this.isCurrentAnimation("shootSideward")) {
			if(this.recoil > 0) {
				if(this.direction === DIRECTION.UP) {
					this.vel.y += this.recoil;
				} else if(this.direction === DIRECTION.DOWN) {
					this.vel.y -= this.recoil;
				} else if(this.direction === DIRECTION.LEFT) {
					this.vel.x += this.recoil;
				} else if(this.direction === DIRECTION.RIGHT) {
					this.vel.x -= this.recoil;
				}
			}

			updated = true;
		}

		this.updateMovement();

		updated = updated || this.vel.x !== 0 || this.vel.y !== 0;

		if(updated) {
			this.parent(this);
			// return true;
		}
		return true;
	},

	shoot : function() {
		// if(this.isCurrentAnimation("shootForward") || this.isCurrentAnimation("shootSideward")) {
			// return false;
		// }

		var that = this,
			x = this.pos.x,
			y = this.pos.y;

		if(this.direction === DIRECTION.UP) {
			this.setCurrentAnimation("shootForward", function() {
				that.setCurrentAnimation("moveForward");
				that.setAnimationFrame(0);
				that.animationspeed = me.sys.fps / 10;
			});
			this.vel.y += this.recoil;
			
			y -= 18;
		} else if (this.direction === DIRECTION.DOWN) {
			this.setCurrentAnimation("shootForward", function() {
				that.setCurrentAnimation("moveForward");
				that.setAnimationFrame(0);
				that.animationspeed = me.sys.fps / 10;
			});
			this.flipY(true);
			this.vel.y -= this.recoil;

			y += 18;
		} else if (this.direction === DIRECTION.LEFT) {
			this.setCurrentAnimation("shootSideward", function() {
				that.setCurrentAnimation("moveSideward");
				that.setAnimationFrame(0);
				that.animationspeed = me.sys.fps / 10;
			});
			this.flipX(true);
			this.vel.x += this.recoil;

			x -= 18;
		} else if (this.direction === DIRECTION.RIGHT) {
			this.setCurrentAnimation("shootSideward", function() {
				that.setCurrentAnimation("moveSideward");
				that.setAnimationFrame(0);
				that.animationspeed = me.sys.fps / 10;
			});
			this.vel.x -= this.recoil;

			x += 18;
		} else {
			// return false;
		}

		this.animationspeed = me.sys.fps / 50;

		var bullet = new Bullet(x, y, this.direction);
		me.game.add(bullet, 5);
		me.game.sort();

		return true;
	},

	updateMovement : function() {
		this.computeVelocity(this.vel);

		var collision = this.collisionMap.checkCollision(this.collisionBox, this.vel);

		if (collision.y !== 0) {
			this.vel.y = 0;
		}

		if (collision.x !== 0) {
			this.vel.x = 0;
		}

		var x = this.pos.x, y = this.pos.y;
		this.pos.add(this.vel);
		collision = me.game.collide(this);

		if(collision && collision.obj instanceof Tank) {
			if(collision.y !== 0) {
				this.vel.y = 0;
			}

			if(collision.x !== 0) {
				this.vel.x = 0;
			}

			this.pos.x = x;
			this.pos.y = y;
		}
	},

	moveLeft : function() {
		this.vel.x -= this.accel.x * me.timer.tick;
		this.vel.y = 0;

		if(this.direction !== DIRECTION.LEFT) {
			if(this.direction !== DIRECTION.RIGHT) {
				this.updateColRect(2, 29, 4, 24);
				this.setCurrentAnimation("moveSideward");
			}

			this.flipX(true);
			this.direction = DIRECTION.LEFT;
		}
	},

	moveRight : function() {
		this.vel.x += this.accel.x * me.timer.tick;
		this.vel.y = 0;

		if(this.direction !== DIRECTION.RIGHT) {
			if(this.direction !== DIRECTION.LEFT) {
				this.updateColRect(2, 29, 4, 24);
				this.setCurrentAnimation("moveSideward");
			}

			this.flipX(false);
			this.direction = DIRECTION.RIGHT;
		}
	},

	moveUp : function() {
		this.vel.x = 0;
		this.vel.y -= this.accel.y * me.timer.tick;

		if(this.direction !== DIRECTION.UP) {
			if(this.direction !== DIRECTION.DOWN) {
				this.updateColRect(4, 24, 1, 29);
				this.setCurrentAnimation("moveForward");
			}

			this.flipY(false);
			this.direction = DIRECTION.UP;
		}
	},

	moveDown : function() {
		this.vel.x = 0;
		this.vel.y += this.accel.y * me.timer.tick;

		if(this.direction !== DIRECTION.DOWN) {
			if(this.direction !== DIRECTION.UP) {
				this.updateColRect(4, 24, 1, 29);
				this.setCurrentAnimation("moveForward");
			}

			this.flipY(true);
			this.direction = DIRECTION.DOWN;
		}
	}
});