(function() {

	window.game.Player = game.Tank.extend({
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
			this.input_seq = 0;
			this.inputs = [];
			
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
					if(this.direction === game.ENUM.DIRECTION.UP) {
						this.vel.y += this.recoil;
					} else if(this.direction === game.ENUM.DIRECTION.DOWN) {
						this.vel.y -= this.recoil;
					} else if(this.direction === game.ENUM.DIRECTION.LEFT) {
						this.vel.x += this.recoil;
					} else if(this.direction === game.ENUM.DIRECTION.RIGHT) {
						this.vel.x -= this.recoil;
					}
				}

				updated = true;
			}

			this.updateMovement();

			if(this.pressed !== this.lastPressed) {
				this.lastPressed = this.pressed;
				
				this.input_seq += 1;

				var input = {};
				input[game.ENUM.TYPE.PRESSED]         = this.pressed;
				input[game.ENUM.TYPE.SEQUENCE_NUMBER] = this.input_seq;
				input[game.ENUM.TYPE.LOCAL_TIME]      = window.game.local_time;

				this.inputs.push(input);
				this.socket.emit(game.ENUM.TYPE.INPUT, input);
			}

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
				setTimeout(function() {
					this.canShoot = true;
				}.bind(this), this.shootSpeed);
			} else {
				return false;
			}

			var x = this.pos.x,
				y = this.pos.y;

			if(this.direction === game.ENUM.DIRECTION.UP) {
				this.setCurrentAnimation("shootForward", function() {
					this.setCurrentAnimation("moveForward");
					this.setAnimationFrame(0);
					this.animationspeed = me.sys.fps / 10;
				}.bind(this));
				this.vel.y += this.recoil;
				
				y -= 18;
			} else if (this.direction === game.ENUM.DIRECTION.DOWN) {
				this.setCurrentAnimation("shootForward", function() {
					this.setCurrentAnimation("moveForward");
					this.setAnimationFrame(0);
					this.animationspeed = me.sys.fps / 10;
				}.bind(this));
				this.flipY(true);
				this.vel.y -= this.recoil;

				y += 18;
			} else if (this.direction === game.ENUM.DIRECTION.LEFT) {
				this.setCurrentAnimation("shootSideward", function() {
					this.setCurrentAnimation("moveSideward");
					this.setAnimationFrame(0);
					this.animationspeed = me.sys.fps / 10;
				}.bind(this));
				this.flipX(true);
				this.vel.x += this.recoil;

				x -= 18;
			} else if (this.direction === game.ENUM.DIRECTION.RIGHT) {
				this.setCurrentAnimation("shootSideward", function() {
					this.setCurrentAnimation("moveSideward");
					this.setAnimationFrame(0);
					this.animationspeed = me.sys.fps / 10;
				}.bind(this));
				this.vel.x -= this.recoil;

				x += 18;
			} else { // this should never happen
				throw "unknown direction \"" + this.direction + "\"";
			}

			this.animationspeed = me.sys.fps / 50;

			var bullet = me.entityPool.newInstanceOf('Bullet', x, y, this.direction, 5, this.GUID);
			me.game.add(bullet, 5);
			me.game.sort();

			return true;
		},

		moveLeft : function() {
			this.parent();
			this.pressed |= game.ENUM.PRESSED.LEFT;
		},

		moveRight : function() {
			this.parent();
			this.pressed |= game.ENUM.PRESSED.RIGHT;
		},

		moveUp : function() {
			this.parent();
			this.pressed |= game.ENUM.PRESSED.UP;
		},

		moveDown : function() {
			this.parent();
			this.pressed |= game.ENUM.PRESSED.DOWN;
		}
	});
	
})();