(function() {
	
	window.game.Tank = me.ObjectEntity.extend({
		// members
		pressed : 0,

		// constructor
		init : function(x, y, direction, recoil, speed, friction, enemy) {
			var settings = {
				image : "tanks",
				spritewidth : 32,
				spriteheight : 32
			};

			this.parent(x, y, settings);

			enemy = enemy || false;

			this.isExploding = false;
			this.collidable = true;
			this.direction = direction;
			this.recoil = recoil;
			this.gravity = 0;
			
			this.setVelocity(speed, speed);
			this.setFriction(friction, friction);

			if(enemy) {
				if(me.gamestat.getItemValue("team") === game.ENUM.TEAM.GREEN) {
					this.addAnimation("idleForward", [17]);
					this.addAnimation("moveForward", [17,16,15,14,13,12,11,10]);
					this.addAnimation("shootForward", [17,18,19,18,17]);
					this.addAnimation("idleSideward", [37]);
					this.addAnimation("moveSideward", [37,36,35,34,33,32,31,30]);
					this.addAnimation("shootSideward", [37,38,39,38,37]);
				} else if(me.gamestat.getItemValue("team") === game.ENUM.TEAM.BLUE) {
					this.addAnimation("idleForward", [7]);
					this.addAnimation("moveForward", [7,6,5,4,3,2,1,0]);
					this.addAnimation("shootForward", [7,8,9,8,7]);
					this.addAnimation("idleSideward", [27]);
					this.addAnimation("moveSideward", [27,26,25,24,23,22,21,20]);
					this.addAnimation("shootSideward", [27,28,29,28,27]);
				} else {
					throw "unknown team \"" + me.gamestat.getItemValue("team") + "\"";
				}
			} else {
				if(me.gamestat.getItemValue("team") === game.ENUM.TEAM.GREEN) {
					this.addAnimation("idleForward", [7]);
					this.addAnimation("moveForward", [7,6,5,4,3,2,1,0]);
					this.addAnimation("shootForward", [7,8,9,8,7]);
					this.addAnimation("idleSideward", [27]);
					this.addAnimation("moveSideward", [27,26,25,24,23,22,21,20]);
					this.addAnimation("shootSideward", [27,28,29,28,27]);
				} else if(me.gamestat.getItemValue("team") === game.ENUM.TEAM.BLUE) {
					this.addAnimation("idleForward", [17]);
					this.addAnimation("moveForward", [17,16,15,14,13,12,11,10]);
					this.addAnimation("shootForward", [17,18,19,18,17]);
					this.addAnimation("idleSideward", [37]);
					this.addAnimation("moveSideward", [37,36,35,34,33,32,31,30]);
					this.addAnimation("shootSideward", [37,38,39,38,37]);
				} else {
					throw "unknown team \"" + me.gamestat.getItemValue("team") + "\"";
				}
			}
			this.addAnimation("explode", [40,41,42]);

			var currentAnimation = "move";

			if(direction === game.ENUM.DIRECTION.UP || direction === game.ENUM.DIRECTION.DOWN) {
				this.updateColRect(4, 24, 1, 29);
				currentAnimation += "Forward";
			} else if(direction === game.ENUM.DIRECTION.LEFT || direction === game.ENUM.DIRECTION.RIGHT) {
				this.updateColRect(2, 29, 4, 24);
				currentAnimation += "Sideward";
			} else {
				throw "unknown direction \"" + direction + "\"";
			}
			
			this.setCurrentAnimation(currentAnimation);

			if(direction === game.ENUM.DIRECTION.LEFT) {
				this.flipX(true);
			} else if(direction === game.ENUM.DIRECTION.DOWN) {
				this.flipY(true);
			}
		},

		explode : function() {
			this.isExploding = true;
			this.collidable = false;

			this.setCurrentAnimation("explode", function() {
				this.isExploding = false;
				me.game.remove(this);
			});
		},

		fixDirection : function() {
			var currentAnimation = "move";
			if(this.direction === game.ENUM.DIRECTION.UP || this.direction === game.ENUM.DIRECTION.DOWN) {
				this.updateColRect(4, 24, 1, 29);
				currentAnimation += "Forward";
			} else if(this.direction === game.ENUM.DIRECTION.LEFT || this.direction === game.ENUM.DIRECTION.RIGHT) {
				this.updateColRect(2, 29, 4, 24);
				currentAnimation += "Sideward";
			} else {
				throw "unknown direction \"" + this.direction + "\"";
			}

			this.setCurrentAnimation(currentAnimation);

			if(this.direction === game.ENUM.DIRECTION.LEFT) {
				this.flipX(true);
			} else if(this.direction === game.ENUM.DIRECTION.RIGHT) {
				this.flipX(false);
			} else if(this.direction === game.ENUM.DIRECTION.UP) {
				this.flipY(false);
			} else if(this.direction === game.ENUM.DIRECTION.DOWN) {
				this.flipY(true);
			}
		},

		updateMovement : function() {
			this.computeVelocity(this.vel);

			var collision = this.collisionMap.checkCollision(this.collisionBox, this.vel);

			if (collision.y !== 0 || collision.yprop.type === 'water') {
				this.vel.y = 0;
			}

			if (collision.x !== 0 || collision.yprop.type === 'water') {
				this.vel.x = 0;
			}

			var x = this.pos.x, y = this.pos.y;
			this.pos.add(this.vel);
			collision = me.game.collide(this);

			if(collision && collision.obj instanceof game.Tank) {
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

			if(this.direction !== game.ENUM.DIRECTION.LEFT) {
				if(this.direction !== game.ENUM.DIRECTION.RIGHT) {
					this.updateColRect(2, 29, 4, 24);
					this.setCurrentAnimation("moveSideward");
				}

				this.flipX(true);
				this.direction = game.ENUM.DIRECTION.LEFT;
			}
		},

		moveRight : function() {
			this.vel.x += this.accel.x * me.timer.tick;
			this.vel.y = 0;

			if(this.direction !== game.ENUM.DIRECTION.RIGHT) {
				if(this.direction !== game.ENUM.DIRECTION.LEFT) {
					this.updateColRect(2, 29, 4, 24);
					this.setCurrentAnimation("moveSideward");
				}

				this.flipX(false);
				this.direction = game.ENUM.DIRECTION.RIGHT;
			}
		},

		moveUp : function() {
			this.vel.x = 0;
			this.vel.y -= this.accel.y * me.timer.tick;

			if(this.direction !== game.ENUM.DIRECTION.UP) {
				if(this.direction !== game.ENUM.DIRECTION.DOWN) {
					this.updateColRect(4, 24, 1, 29);
					this.setCurrentAnimation("moveForward");
				}

				this.flipY(false);
				this.direction = game.ENUM.DIRECTION.UP;
			}
		},

		moveDown : function() {
			this.vel.x = 0;
			this.vel.y += this.accel.y * me.timer.tick;

			if(this.direction !== game.ENUM.DIRECTION.DOWN) {
				if(this.direction !== game.ENUM.DIRECTION.UP) {
					this.updateColRect(4, 24, 1, 29);
					this.setCurrentAnimation("moveForward");
				}

				this.flipY(true);
				this.direction = game.ENUM.DIRECTION.DOWN;
			}
		}
	});
	
})();