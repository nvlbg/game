(function() {

	window.game.EnemyBot = game.Tank.extend({
		/**
		constructor
		*/
		init : function(x, y, direction, speed, friction, shootSpeed) {
			this.parent(x, y, direction, speed, friction, true);
			//this.lastVel = new me.Vector2d(0, 0);
			this.shootSpeed = shootSpeed;
			this.lastPressed = 0;
			this.type = me.game.ENEMY_OBJECT;
			this.canShoot = true;
			this.pressed = 0;
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

			if (Number.prototype.random(0, 50) === 0) {
				this.pressed = Number.prototype.random(1, 8);
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

			this.shoot();


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

			var dir = new me.Vector2d();

			if (this.direction === game.ENUM.DIRECTION.LEFT) {
				dir.x = -1;
			} else if (this.direction === game.ENUM.DIRECTION.RIGHT) {
				dir.x = 1;
			} if (this.direction === game.ENUM.DIRECTION.UP) {
				dir.y = -1;
			} else if (this.direction === game.ENUM.DIRECTION.DOWN) {
				dir.y = 1;
			}

			var bullet = me.entityPool.newInstanceOf('Bullet', x, y, dir, 5, this.GUID);
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
		},

		updateMovement : function() {
			this.computeVelocity(this.vel);

			var collision = this.collisionMap.checkCollision(this.collisionBox, this.vel);

			if (collision.y !== 0 || collision.yprop.type === 'water') {
				this.vel.y = 0;
				this.pressed = Number.prototype.random(1, 8);
			}

			if (collision.x !== 0 || collision.yprop.type === 'water') {
				this.vel.x = 0;
				this.pressed = Number.prototype.random(1, 8);
			}

			var x = this.pos.x, y = this.pos.y;
			this.pos.add(this.vel);
			collision = me.game.collide(this);

			if(collision && collision.obj instanceof game.Tank) {
				this.pressed = Number.prototype.random(1, 8);
				if(collision.y !== 0) {
					this.vel.y = 0;
				}

				if(collision.x !== 0) {
					this.vel.x = 0;
				}

				this.pos.x = x;
				this.pos.y = y;
			}
		}
	});
	
})();