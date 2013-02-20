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
			this.lastCorrectionPos = this.pos.clone();
			this.inputs = [];
			this.input_seq = 0;

			this.bullets = {};
			this.bulletsCounter = 0;

			this.delta = new me.Vector2d(0, 0);
			this.deltaFrames = 0;

			this.lastPressed = 0;
			this.pressed = 0;

			this.isShooting = false;
			
			me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
		},

		/**
		called on each frame
		*/
		update: function() {
			if(this.isExploding) {
				this.parent(this);
				return true;
			}

			if(!this.visible) {
				return false;
			}

			var updated = this.isShooting;

			if (!updated && this.needsUpdate) {
				this.needsUpdate = false;
				updated = true;
			}

			if (this.smarthphoneConnected) {
				updated = this.applyClientSideInterpolation() || updated;
			} else {
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

				if (this.delta.x > 0.1 || this.delta.y > 0.1) {
					this.delta.div(2);
					this.pos.add(this.delta);

					updated = true;
				}
				
				/*
				// TODO: choose (or add option to switch) between this and the aproach above
				if (this.deltaFrames > 0) {
					this.deltaFrames -= 1;
					this.pos.add(this.delta);
				}
				*/
			
				var bullet = null;
				if(me.input.isKeyPressed("shoot")) {
					bullet = this.shoot();

					if (bullet) {
						this.bullets[this.bulletsCounter] = bullet;
						this.bulletsCounter += 1;
					}
				}

				if(this.pressed > 0 || bullet !== null) {
					var input = {
						s: this.input_seq
					};

					if (this.pressed > 0) {
						input.p = this.pressed;
					}

					if (bullet !== null) {
						input.a = bullet.angle;
						input.i = bullet.id;
					}

					setTimeout(function() {
						this.socket.emit(game.ENUM.TYPE.UPDATE, input);
					}.bind(this), window.game.network.fake_latency);

					this.input_seq += 1;
					this.inputs.push(input);
				}

				this.updateMovement();
				updated = updated || this.vel.x !== 0 || this.vel.y !== 0;
				this.vel.setZero();
			}
		
			if(updated) {
				this.parent(this);
				return true;
			}
			return false;
		},

		removeBulletById: function(id) {
			if (this.bullets[id]) {
				me.game.remove(this.bullets[id]);
				delete this.bullets[id];
			}
		},

		applyClientSideAdjustment: function() {
			if(this.correction !== null) {
				var i, len;

				// remove bullets that the server declined
				if (this.correction.u !== undefined) {
					for (i = 0, len = this.correction.u.length; i < len; i++) {
						this.removeBulletById(this.correction.u[i]);
					}
				}

				// set correction x/y if it doesn't exist to the previous one that we have
				// (x or y won't exist in correction, because it hasn't changed)
				if (this.correction.x !== undefined) {
					this.lastCorrectionPos.x = this.correction.x;
				} else {
					this.correction.x = this.lastCorrectionPos.x;
				}

				if (this.correction.y !== undefined) {
					this.lastCorrectionPos.y = this.correction.y;
				} else {
					this.correction.y = this.lastCorrectionPos.y;
				}

				if (this.correction.a !== undefined) {
					if (this.correction.a === false) {
						this.explode();
					} else {
						this.pos.set(this.correction.x, this.correction.y);
						this.respawn();
					}

					this.delta.setZero();
					this.correction = null;
					return;
				}

				// keep a copy of our pos that we see before the correction
				var currentPos = this.pos.clone();

				// set the pos to the correction pos, so we can predict the new pos 
				this.pos.set(this.correction.x, this.correction.y);

				// discard all processed inputs by server
				for (i = 0, len = this.inputs.length; i < len; i++) {
					if (this.inputs[i].s === this.correction.s) {
						this.inputs.splice(0, i + 1);
						break;
					}
				}

				// re-process the moves that the server hasn't recieved/processed yet
				for (i = 0, len = this.inputs.length; i < len; i++) {
					var pressed = this.inputs[i].p;

					if (pressed === undefined) {
						continue;
					}

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
					this.vel.setZero();
				}

				// compute a delta with the difference between client-side predicted pos
				// and our new predicted pos (after the correction we recieved)
				// each frame we will add half of that delta to our pos, so it will smoothly
				// be corrected after few frames
				this.delta.copy(this.pos);
				this.delta.sub(currentPos);

				// set pos to the original one
				// the delta will make sure we get to the predicted pos in a few frames
				this.pos.copy(currentPos);

				this.correction = null;

				return true;
			}

			return false;
		},

		_shootInternal: function(dir, flipX, flipY, animFrame) {
			this.isShooting = true;

			var capitalizedDirection = dir.charAt(0).toUpperCase() + dir.slice(1);
			this.setCurrentAnimation("shoot" + capitalizedDirection, function() {
				this.setCurrentAnimation("move" + capitalizedDirection);
				this.setAnimationFrame(animFrame);
				this.isShooting = false;
			}.bind(this));

			this.flipX(flipX);
			this.flipY(flipY);
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

			var animFrame = this.getCurrentAnimationFrame();
			if(this.direction === game.ENUM.DIRECTION.UP) {
				this._shootInternal("forward", false, false, animFrame);
				this.vel.y += this.recoil;
			} else if (this.direction === game.ENUM.DIRECTION.DOWN) {
				this._shootInternal("forward", false, true, animFrame);
				this.vel.y -= this.recoil;
			} else if (this.direction === game.ENUM.DIRECTION.LEFT) {
				this._shootInternal("sideward", true, false, animFrame);
				this.vel.x += this.recoil;
			} else if (this.direction === game.ENUM.DIRECTION.RIGHT) {
				this._shootInternal("sideward", false, false, animFrame);
				this.vel.x -= this.recoil;
			} else { // this should never happen
				throw "unknown direction \"" + this.direction + "\"";
			}

			// compute angle/direction
			var dir = new me.Vector2d(
							me.input.mouse.pos.x - this.pos.x + me.game.viewport.pos.x - 16,
							me.input.mouse.pos.y - this.pos.y + me.game.viewport.pos.y - 16
						);
			dir.normalize();

			var bullet = me.entityPool.newInstanceOf('Bullet',
													this.pos.x + dir.x*16, this.pos.y + dir.y*16,
													dir, 5, this.GUID, this.team, this.input_seq,
													this.bulletsCounter);
			me.game.add(bullet, 5);
			me.game.sort();

			return bullet;
		},

		moveLeft : function() {
			this.parent();
			this.pressed |= game.ENUM.PRESSED.LEFT;
			this.isShooting = false;
		},

		moveRight : function() {
			this.parent();
			this.pressed |= game.ENUM.PRESSED.RIGHT;
			this.isShooting = false;
		},

		moveUp : function() {
			this.parent();
			this.pressed |= game.ENUM.PRESSED.UP;
			this.isShooting = false;
		},

		moveDown : function() {
			this.parent();
			this.pressed |= game.ENUM.PRESSED.DOWN;
			this.isShooting = false;
		},

		explode: function() {
			this.parent();
			me.game.viewport.follow(this.pos, me.game.viewport.AXIS.NONE);
		},

		respawn: function() {
			this.parent();
			/*var tween = new me.Tween(me.game.viewport.pos).to(this.pos, 2000).onComplete(function() {
				me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
			}.bind(this));
			tween.easing(me.Tween.Easing.Sinusoidal.EaseIn);
			tween.start();
			*/
			me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
		}
	});
	
})();