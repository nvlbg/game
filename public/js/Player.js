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
			this.canShoot = true;
			this.smarthphoneConnected = false;

			this.correction = null;
			this.inputs = [];
			this.input_seq = 0;

			this.delta = new me.Vector2d(0, 0);

			this.lastPressed = 0;
			this.pressed = 0;
			
			me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
		},

		/**
		called on each frame
		*/
		/*
		update : function() {
			if(this.isExploding) {
				this.parent(this);
				return true;
			}

			if (!this.smarthphoneConnected) {
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
			} else {
				if(this.pressed & game.ENUM.PRESSED.LEFT) {
					this.moveLeft();
				} else if (this.pressed & game.ENUM.PRESSED.RIGHT) {
					this.moveRight();
				}

				if(this.pressed & game.ENUM.PRESSED.UP) {
					this.moveUp();
				} else if (this.pressed & game.ENUM.PRESSED.DOWN) {
					this.moveDown();
				}
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

			if(!this.smarthphoneConnected && this.pressed !== this.lastPressed) {
				this.lastPressed = this.pressed;
				
				var input = {
					p: this.pressed,
					x: this.pos.x,
					y: this.pos.y
				};

				this.socket.emit(game.ENUM.TYPE.INPUT, input);
			}

			var updated = this.vel.x !== 0 || this.vel.y !== 0;
			this.vel.x = this.vel.y = 0;

			if(updated) {
				this.parent(this);
				return true;
			}
			return false;
		},
		*/
		update: function() {
			if(this.isExploding) {
				this.parent(this);
				return true;
			}

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

			/*
			if(this.pressed !== this.lastPressed) {
				this.lastPressed = this.pressed;
				
				var input = {
					p: this.pressed,
					x: this.pos.x,
					y: this.pos.y
				};

				this.socket.emit(game.ENUM.TYPE.INPUT, input);
			}
			*/
		
			if(this.pressed > 0) {
				//TODO: no local time in input (but maybe not needed?)
				var input = {
					s: this.input_seq,
					p: this.pressed
				};

				this.socket.emit(game.ENUM.TYPE.UPDATE, input);

				this.input_seq += 1;
				this.inputs.push(input);
			}

			if (this.delta.x > 0.1 || this.delta.y > 0.1) {
				//TODO: maybe the delta should be added to the vel
				this.delta.div(2);
				this.pos.add(this.delta);
			}

			this.updateMovement();
			this.applyClientSideAdjustment();

			var updated = this.vel.x !== 0 || this.vel.y !== 0;
			this.vel.x = this.vel.y = 0;
			
			if(updated) {
				this.parent(this);
				return true;
			}
			return false;
		},

		applyClientSideAdjustment: function() {
			if(this.correction !== null) {
				var currentPos = this.pos.clone();

				this.pos.x = this.correction.x;
				this.pos.y = this.correction.y;

				var i, len;
				// discard all processed inputs by server
				for (i = 0, len = this.inputs.length; i < len; i++) {
					if (this.inputs[i].s === this.correction.s) {
						this.inputs.splice(0, i + 1);
						break;
					}
				}

				// re-process the moves that the server hasn't recieved/processed yet
				for (i = 0, len = this.inputs.length; i < len; i++) {
					this.vel.x = this.vel.y = 0;
					var pressed = this.inputs[i].pressed;

					if(pressed & game.ENUM.PRESSED.LEFT) {
						this.moveLeft();
					} else if(pressed & game.ENUM.PRESSED.RIGHT) {
						this.moveRight();
					}

					if(pressed & game.ENUM.PRESSED.UP) {
						this.moveUp();
					} else if(pressed & game.ENUM.PRESSED.DOWN) {
						this.moveDown();
					}

					this.updateMovement();
				}

				// compute a delta with the difference between client-side predicted pos
				// and our new predicted pos (after the correction we recieved)
				// each frame we will add half of that delta to our pos, so it will smoothly
				// be corrected after few frames
				this.delta = this.pos.clone();
				this.delta.sub(currentPos);

				this.pos.x = currentPos.x;
				this.pos.y = currentPos.y;

				this.correction = null;
			}
		},

		shoot : function() {
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

			var dir = new me.Vector2d(
							me.input.mouse.pos.x - this.pos.x + me.game.viewport.pos.x - 16,
							me.input.mouse.pos.y - this.pos.y + me.game.viewport.pos.y - 16
						);
		
			dir.normalize();

			this.animationspeed = me.sys.fps / 50;

			var bullet = me.entityPool.newInstanceOf('Bullet', this.pos.x + dir.x*16, this.pos.y + dir.y*16, dir, 5, this.GUID);
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