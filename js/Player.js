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
				if(this.direction === "up") {
					this.vel.y += this.recoil;
				} else if(this.direction === "down") {
					this.vel.y -= this.recoil;
				} else if(this.direction === "left") {
					this.vel.x += this.recoil;
				} else if(this.direction === "right") {
					this.vel.x -= this.recoil;
				}
			}

			this.parent(this);
			updated = true;
		}

		this.updateMovement();
		
		updated = updated || this.vel.x !== 0 || this.vel.y !== 0;

		if(updated) {
			this.parent(this);
			return true;
		}
		return false;
	},

	shoot : function() {
		if(this.isCurrentAnimation("shootForward") || this.isCurrentAnimation("shootSideward")) {
			return false;
		}

		var that = this,
			x = this.pos.x,
			y = this.pos.y;

		if(this.direction === "up") {
			this.setCurrentAnimation("shootForward", function() {
				that.setCurrentAnimation("moveForward");
				that.setAnimationFrame(0);
				that.animationspeed = me.sys.fps / 10;
			});
			this.vel.y += this.recoil;
			
			y -= 18;
		} else if (this.direction === "down") {
			this.setCurrentAnimation("shootForward", function() {
				that.setCurrentAnimation("moveForward");
				that.setAnimationFrame(0);
				that.animationspeed = me.sys.fps / 10;
			});
			this.flipY(true);
			this.vel.y -= this.recoil;

			y += 18;
		} else if (this.direction === "left") {
			this.setCurrentAnimation("shootSideward", function() {
				that.setCurrentAnimation("moveSideward");
				that.setAnimationFrame(0);
				that.animationspeed = me.sys.fps / 10;
			});
			this.flipX(true);
			this.vel.x += this.recoil;

			x -= 18;
		} else if (this.direction === "right") {
			this.setCurrentAnimation("shootSideward", function() {
				that.setCurrentAnimation("moveSideward");
				that.setAnimationFrame(0);
				that.animationspeed = me.sys.fps / 10;
			});
			this.vel.x -= this.recoil;

			x += 18;
		} else {
			return false;
		}

		this.animationspeed = me.sys.fps / 50;

		var bullet = new Bullet(x, y, { direction : this.direction });
		me.game.add(bullet, 5);
		me.game.sort();

		return true;
	},


	// TODO: optimize move methods with some checks
	moveLeft : function() {
		this.vel.x = -this.accel.x * me.timer.tick;
		this.vel.y = 0;

		if(this.direction !== "left") {
			this.setCurrentAnimation("moveSideward");
			this.flipX(true);
			this.updateColRect(2, 29, 4, 24);

			this.direction = "left";
		}
	},

	moveRight : function() {
		this.vel.x = this.accel.x * me.timer.tick;
		this.vel.y = 0;

		if(this.direction !== "right") {
			this.setCurrentAnimation("moveSideward");
			this.flipX(false);
			this.updateColRect(2, 29, 4, 24);

			this.direction = "right";
		}
	},

	moveUp : function() {
		this.vel.x = 0;
		this.vel.y = -this.accel.y * me.timer.tick;

		if(this.direction !== "up") {
			this.setCurrentAnimation("moveForward");
			this.flipY(false);
			this.updateColRect(4, 24, 1, 29);

			this.direction = "up";
		}
	},

	moveDown : function() {
		this.vel.x = 0;
		this.vel.y = this.accel.y * me.timer.tick;

		if(this.direction !== "down") {
			this.setCurrentAnimation("moveForward");
			this.flipY(true);
			this.updateColRect(4, 24, 1, 29);

			this.direction = "down";
		}
	}
});