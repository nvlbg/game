var Player = Tank.extend({
	/**
	constructor
	*/
	init : function(x, y, direction, recoil, speed, friction) {
		this.parent(x, y, direction, recoil, speed, friction);
		//this.lastVel = new me.Vector2d(0, 0);
		this.lastPressed = [false, false, false, false];
		
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

		this.pressed = [me.input.isKeyPressed("left"), me.input.isKeyPressed("right"), me.input.isKeyPressed("up"), me.input.isKeyPressed("down")];
		if(this.pressed[0] !== this.lastPressed[0] || this.pressed[1] !== this.lastPressed[1] || this.pressed[2] !== this.lastPressed[2] || this.pressed[3] !== this.lastPressed[3]) {
			socket.emit(TYPE.MOVE, this.pressed);
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
	}
});