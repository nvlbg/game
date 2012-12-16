var Player = Tank.extend({
	/**
	constructor
	*/
	init : function(x, y, direction, recoil, speed, friction, shootSpeed, socket) {
		this.parent(x, y, direction, recoil, speed, friction);
		//this.lastVel = new me.Vector2d(0, 0);
		this.shootSpeed = shootSpeed;
		this.socket = socket;
		this.lastPressed = 0;
		this.canShoot = true;
		
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
		this.pressed = 0;

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
				if(this.direction === Network.DIRECTION.UP) {
					this.vel.y += this.recoil;
				} else if(this.direction === Network.DIRECTION.DOWN) {
					this.vel.y -= this.recoil;
				} else if(this.direction === Network.DIRECTION.LEFT) {
					this.vel.x += this.recoil;
				} else if(this.direction === Network.DIRECTION.RIGHT) {
					this.vel.x -= this.recoil;
				}
			}

			updated = true;
		}

		this.updateMovement();

		if(this.pressed !== this.lastPressed) {
			this.socket.emit(Network.TYPE.MOVE, this.pressed);
			console.log(this.pressed);
		}
		this.lastPressed = this.pressed;

		/*if(this.vel.x !== this.lastVel.x || this.vel.y !== this.lastVel.y) {
			var data = {};
			data.x = this.vel.x;
			data.y = this.vel.y;
			data.d = this.direction;
			socket.emit(TYPE.MOVE, data);
			console.log(data);
		}*/

		//this.lastVel.x = this.vel.x;
		//this.lastVel.y = this.vel.y;

		updated = updated || this.vel.x !== 0 || this.vel.y !== 0;

		this.vel.x = 0;
		this.vel.y = 0;

		if(updated) {
			this.parent(this);
			return true;
		}
		return false;
	},

	shoot : function() {
		// if(this.isCurrentAnimation("shootForward") || this.isCurrentAnimation("shootSideward")) {
			// return false;
		// }
		if(this.canShoot) {
			this.canShoot = false;
			var that = this;
			setTimeout(function() {
				that.canShoot = true;
			}, this.shootSpeed);
		} else {
			return false;
		}

		var that = this,
			x = this.pos.x,
			y = this.pos.y;

		if(this.direction === Network.DIRECTION.UP) {
			this.setCurrentAnimation("shootForward", function() {
				that.setCurrentAnimation("moveForward");
				that.setAnimationFrame(0);
				that.animationspeed = me.sys.fps / 10;
			});
			this.vel.y += this.recoil;
			
			y -= 18;
		} else if (this.direction === Network.DIRECTION.DOWN) {
			this.setCurrentAnimation("shootForward", function() {
				that.setCurrentAnimation("moveForward");
				that.setAnimationFrame(0);
				that.animationspeed = me.sys.fps / 10;
			});
			this.flipY(true);
			this.vel.y -= this.recoil;

			y += 18;
		} else if (this.direction === Network.DIRECTION.LEFT) {
			this.setCurrentAnimation("shootSideward", function() {
				that.setCurrentAnimation("moveSideward");
				that.setAnimationFrame(0);
				that.animationspeed = me.sys.fps / 10;
			});
			this.flipX(true);
			this.vel.x += this.recoil;

			x -= 18;
		} else if (this.direction === Network.DIRECTION.RIGHT) {
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

		var bullet = new Bullet(x, y, this.direction, this.GUID);
		me.game.add(bullet, 5);
		me.game.sort();

		return true;
	},

	moveLeft : function() {
		this.parent();
		this.pressed |= Network.PRESSED.LEFT;
	},

	moveRight : function() {
		this.parent();
		this.pressed |= Network.PRESSED.RIGHT;
	},

	moveUp : function() {
		this.parent();
		this.pressed |= Network.PRESSED.UP;
	},

	moveDown : function() {
		this.parent();
		this.pressed |= Network.PRESSED.DOWN;
	}
});