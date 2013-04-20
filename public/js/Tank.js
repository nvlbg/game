(function() {
	
	window.game.Tank = me.ObjectEntity.extend({
		// members
		pressed : 0,

		// constructor
		init : function(x, y, direction, speed, friction, nickname, enemy) {
			var settings = {
				image : "tanks",
				spritewidth : 32,
				spriteheight : 32
			};

			this.parent(x, y, settings);

			enemy = enemy || false;

			this.nickname = nickname;

			this.isExploding = false;
			this.collidable = true;
			this.direction = direction;
			this.gravity = 0;
			this.delta = new me.Vector2d(0, 0);

			this.alive = true;

			this.needsUpdate = false;
			
			this.setVelocity(speed, speed);
			this.setFriction(friction, friction);

			if(enemy) {
				if(me.gamestat.getItemValue("team") === game.ENUM.TEAM.GREEN) {
					this.renderable.addAnimation("idleForward", [17]);
					this.renderable.addAnimation("moveForward", [17,16,15,14,13,12,11,10], me.sys.fps / 10);
					this.renderable.addAnimation("shootForward", [17,18,19,18,17], me.sys.fps / 50);
					this.renderable.addAnimation("idleSideward", [37]);
					this.renderable.addAnimation("moveSideward", [37,36,35,34,33,32,31,30], me.sys.fps / 10);
					this.renderable.addAnimation("shootSideward", [37,38,39,38,37], me.sys.fps / 50);

					this.team = game.ENUM.TEAM.BLUE;
				} else if(me.gamestat.getItemValue("team") === game.ENUM.TEAM.BLUE) {
					this.renderable.addAnimation("idleForward", [7]);
					this.renderable.addAnimation("moveForward", [7,6,5,4,3,2,1,0], me.sys.fps / 10);
					this.renderable.addAnimation("shootForward", [7,8,9,8,7], me.sys.fps / 50);
					this.renderable.addAnimation("idleSideward", [27]);
					this.renderable.addAnimation("moveSideward", [27,26,25,24,23,22,21,20], me.sys.fps / 10);
					this.renderable.addAnimation("shootSideward", [27,28,29,28,27], me.sys.fps / 50);

					this.team = game.ENUM.TEAM.GREEN;
				} else {
					throw "unknown team \"" + me.gamestat.getItemValue("team") + "\"";
				}
			} else {
				if(me.gamestat.getItemValue("team") === game.ENUM.TEAM.GREEN) {
					this.renderable.addAnimation("idleForward", [7]);
					this.renderable.addAnimation("moveForward", [7,6,5,4,3,2,1,0], me.sys.fps / 10);
					this.renderable.addAnimation("shootForward", [7,8,9,8,7], me.sys.fps / 50);
					this.renderable.addAnimation("idleSideward", [27]);
					this.renderable.addAnimation("moveSideward", [27,26,25,24,23,22,21,20], me.sys.fps / 10);
					this.renderable.addAnimation("shootSideward", [27,28,29,28,27], me.sys.fps / 50);

					this.team = game.ENUM.TEAM.GREEN;
				} else if(me.gamestat.getItemValue("team") === game.ENUM.TEAM.BLUE) {
					this.renderable.addAnimation("idleForward", [17]);
					this.renderable.addAnimation("moveForward", [17,16,15,14,13,12,11,10], me.sys.fps / 10);
					this.renderable.addAnimation("shootForward", [17,18,19,18,17], me.sys.fps / 50);
					this.renderable.addAnimation("idleSideward", [37]);
					this.renderable.addAnimation("moveSideward", [37,36,35,34,33,32,31,30], me.sys.fps / 10);
					this.renderable.addAnimation("shootSideward", [37,38,39,38,37], me.sys.fps / 50);

					this.team = game.ENUM.TEAM.BLUE;
				} else {
					throw "unknown team \"" + me.gamestat.getItemValue("team") + "\"";
				}
			}
			this.renderable.addAnimation("explode", [40,41,42]);

			var currentAnimation = "move";

			if(direction === game.ENUM.DIRECTION.UP || direction === game.ENUM.DIRECTION.DOWN) {
				//this.updateColRect(4, 24, 1, 29);
				currentAnimation += "Forward";
			} else if(direction === game.ENUM.DIRECTION.LEFT || direction === game.ENUM.DIRECTION.RIGHT) {
				//this.updateColRect(2, 29, 4, 24);
				currentAnimation += "Sideward";
			} else {
				throw "unknown direction \"" + direction + "\"";
			}
			
			this.renderable.setCurrentAnimation(currentAnimation);

			if(direction === game.ENUM.DIRECTION.LEFT) {
				this.renderable.flipX(true);
			} else if(direction === game.ENUM.DIRECTION.DOWN) {
				this.renderable.flipY(true);
			}

			this.updates = [];
			this.lastProcessedSeq = -1;

			this.invulnerable = false;

			this.alphaFadeInTween  = null;
			this.alphaFadeOutTween = null;
		},

		draw: function(context) {
			this.parent(context);

			var x = this.pos.x + 15;
			var y = this.pos.y + 36;
			
			window.game.font.draw(context, this.nickname, x, y);
		},

		applyClientSideInterpolation: function() {
			//TODO: clear this method a bit
			if (this.updates.length > 0) {
				var current_time = game.network.client_time;
				var count = this.updates.length - 1;

				var target = null;
				var previous = null;

				var point, nextPoint;

				for(var i = 0; i < count; i++) {
					point = this.updates[i];
					nextPoint = this.updates[i+1];

					if(current_time > point.t && current_time < nextPoint.t) {
						this.updates.splice(0, i+1);
						target = nextPoint;
						previous = point;
						break;
					}
				}

				if(!target) {
					target = previous = this.updates[0];
				}

				var pos = new me.Vector2d(previous.x, previous.y);
				var time_point = (current_time - previous.t) / (target.t - previous.t);

				if( isNaN(time_point) || time_point === Infinity || time_point === -Infinity) {
					time_point = 0;
				}

				pos.x += (target.x - previous.x) * time_point;
				pos.y += (target.y - previous.y) * time_point;

				this.vel.x = pos.x - this.pos.x;
				this.vel.y = pos.y - this.pos.y;

				this.setDirection(target.d);

				// this.computeVelocity(this.vel);
				this.pos.add(this.vel);

				if (previous.b !== undefined) {
					var bullet, dir, bulletObj;
					for (var j = 0, len = previous.b.length; j < len; j++) {
						bullet = previous.b[j];
						dir = new me.Vector2d(bullet.z, bullet.c);

						bulletObj = me.entityPool.newInstanceOf('Bullet',
																bullet.x - 14,
																bullet.y - 12,
																dir,
																1,
																this.GUID,
																this.team);
						bulletObj.applyCompensation( current_time - previous.t );

						me.game.add(bulletObj, 5);
					}
					
					me.game.sort();

					previous.b = undefined;
				}

				if (previous.a !== undefined) {
					if (previous.a === false) {
						this.explode();
					} else {
						this.pos.set(previous.x, previous.y);
						this.respawn();
					}
					
					previous.a = undefined;
					return;
				}

				var updated = this.vel.x !== 0 || this.vel.y !== 0;
				this.vel.setZero();
				return updated;
			}

			return false;
		},

		/*
		makeInvulnerable: function() {
			this.invulnerable = true;
			this.needsUpdate = true;

			this.renderable.alpha = 0.5;
			var	fadeIn  = new me.Tween(this.renderable).to({alpha: 1.0}, 500).onComplete(function() {
				this.renderable.alpha = 0.5;
				fadeIn.start();
			}.bind(this)).start();

			setTimeout(function() {
				fadeIn.stop();
				
				this.invulnerable = false;
				this.renderable.alpha = 1.0;
				this.needsUpdate = true;
			}.bind(this), window.game.network.INVULNERABLE_TIME_STEP);
		},
		*/

		makeInvulnerable: function() {
			this.invulnerable = true;
			this.needsUpdate = true;

			if (this.alphaFadeInTween === null && this.alphaFadeOutTween === null) {
				this.alphaFadeInTween  = new me.Tween(this.renderable).to({alpha: 0.9}, 250);
				this.alphaFadeOutTween = new me.Tween(this.renderable).to({alpha: 0.6}, 250);

				this.alphaFadeInTween.chain(this.alphaFadeOutTween);
				this.alphaFadeOutTween.chain(this.alphaFadeInTween);
			}

			this.alphaFadeOutTween.start();

			setTimeout(function() {
				this.alphaFadeInTween.stop();
				this.alphaFadeOutTween.stop();

				this.invulnerable = false;
				this.needsUpdate = true;
			}.bind(this), window.game.network.INVULNERABLE_TIME_STEP);
		},
		
		updateHelper: function() {
			if(this.isExploding) {
				this.parent(this);
				return true;
			}

			if(!this.alive) {
				return false;
			}

			if ( this.applyClientSideInterpolation() ) {
				this.parent(this);
				return true;
			}
			
			if (this.needsUpdate) {
				this.parent(this);

				if (!this.invulnerable && this.renderable.alpha !== 1.0) {
					this.renderable.alpha = 1.0;
				}

				this.needsUpdate = false;
				return true;
			}

			return false;
		},

		explode : function() {
			this.isExploding = true;

			this.renderable.setCurrentAnimation("explode", function() {
				this.collidable = false;
				this.visible = false;
				this.isExploding = false;
				this.alive = false;
			}.bind(this));
		},

		respawn : function() {
			this.visible = true;
			this.collidable = true;
			this.needsUpdate = true;

			if (this.direction === game.ENUM.DIRECTION.LEFT || this.direction === game.ENUM.DIRECTION.RIGHT) {
				this.renderable.setCurrentAnimation("idleSideward");
			} else if (this.direction === game.ENUM.DIRECTION.DOWN || this.direction === game.ENUM.DIRECTION.UP) {
				this.renderable.setCurrentAnimation("idleForward");
			}

			this.makeInvulnerable();
		},

		updateMovement: function() {
			this.computeVelocity(this.vel);

			var collision = this.collisionMap.checkCollision(this.collisionBox, this.vel);

			if (collision.y !== 0 || collision.yprop.type === 'water') {
				this.vel.y = 0;
			}

			if (collision.x !== 0 || collision.yprop.type === 'water') {
				this.vel.x = 0;
			}

			// var pos = this.pos.clone();
			this.pos.add(this.vel);

			/*
			collision = me.game.collide(this);

			if(collision && collision.obj instanceof game.Tank && !collision.obj.isExploding) {
				if(collision.y !== 0) {
					this.vel.y = 0;
				}

				if(collision.x !== 0) {
					this.vel.x = 0;
				}

				pos.add(this.vel);
				this.pos.x = pos.x;
				this.pos.y = pos.y;
			}
			*/
		},

		moveLeft : function() {
			this.vel.x -= this.accel.x * me.timer.tick;
			this.vel.y = 0;

			this.setDirection(game.ENUM.DIRECTION.LEFT);
		},

		moveRight : function() {
			this.vel.x += this.accel.x * me.timer.tick;
			this.vel.y = 0;

			this.setDirection(game.ENUM.DIRECTION.RIGHT);
		},

		moveUp : function() {
			this.vel.x = 0;
			this.vel.y -= this.accel.y * me.timer.tick;

			this.setDirection(game.ENUM.DIRECTION.UP);
		},

		moveDown : function() {
			this.vel.x = 0;
			this.vel.y += this.accel.y * me.timer.tick;

			this.setDirection(game.ENUM.DIRECTION.DOWN);
		},

		setDirection : function(dir) {
			if (this.direction === dir) {
				return;
			}

			this.needsUpdate = true;
			this.direction = dir;

			var currentAnimation;
			if(dir === game.ENUM.DIRECTION.UP || dir === game.ENUM.DIRECTION.DOWN) {
				//this.updateColRect(4, 24, 1, 29);
				currentAnimation = "moveForward";
			} else if(dir === game.ENUM.DIRECTION.LEFT || dir === game.ENUM.DIRECTION.RIGHT) {
				//this.updateColRect(2, 29, 4, 24);
				currentAnimation = "moveSideward";
			}

			this.renderable.setCurrentAnimation(currentAnimation);

			if(dir === game.ENUM.DIRECTION.LEFT) {
				this.renderable.flipX(true);
			} else if(dir === game.ENUM.DIRECTION.RIGHT) {
				this.renderable.flipX(false);
			} else if(dir === game.ENUM.DIRECTION.UP) {
				this.renderable.flipY(false);
			} else if(dir === game.ENUM.DIRECTION.DOWN) {
				this.renderable.flipY(true);
			}
		}
	});
	
})();