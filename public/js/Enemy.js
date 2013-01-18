(function() {

	window.game.Enemy = game.Tank.extend({
		init : function(x, y, direction, recoil, speed, friction) {
			this.parent(x, y, direction, recoil, speed, friction, true);
			
			this.pressed = 0;
			this.type = me.game.ENEMY_OBJECT;
			this.interpolations = [];
			this.currentInterpolation = null;
		},

		update : function() {
			if(this.isExploding) {
				this.parent(this);
				return true;
			}

			/*
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

			var updated = this.pos.x !== this.lastPos.x || this.pos.y !== this.lastPos.y;
			*/
			
			/*
			if (this.tween === null && this.interpolations.lenght > 0) {
				console.log("YESSSSSSSSSSSSS");
				var interpolation = new me.Vector2d(
											this.pos.x - this.interpolations[0].x,
											this.pos.y - this.interpolations[0].y
										);
				var ratio = interpolation.x / (interpolation.y + interpolation.x);
				this.createTween(ratio, 1 - ratio);
			}
			*/
		
			if (this.currentInterpolation === null && this.interpolations.length > 0) {
				this.currentInterpolation = new me.Vector2d(
													this.pos.x - this.interpolations[0].x,
													this.pos.y - this.interpolations[0].y
												);
				this.interpolations.shift();

				this.vel.x = this.currentInterpolation.x / 50;
				this.vel.y = this.currentInterpolation.y / 50;

				setTimeout(function() {
					this.currentInterpolation = null;
					this.vel.x = this.vel.y = 0;
				}.bind(this), 50);
			}

			/*
			// console.log('Enemy: ' + Array.isArray(this.interpolations) + ' ' + this.interpolations.length);
			if (this.currentInterpolation === null && this.interpolations.length > 0) {
				this.currentInterpolation = this.interpolations.shift();

				var distanceX = this.pos.x - this.currentInterpolation.x;
				var distanceY = this.pos.y - this.currentInterpolation.y;
				var ratioX = 50 * (distanceX / (distanceX + distanceY));
				var ratioY = 50 - ratioX;

				if (this.direction === game.ENUM.DIRECTION.UP || this.direction === game.ENUM.DIRECTION.DOWN) {
					this.vel.x = 0;
					this.vel.y = ratioY / distanceY;
					setTimeout(function() {
						this.vel.x = ratioX / distanceX;
						this.vel.y = 0;

						setTimeout(function() {
							this.currentInterpolation = null;

							this.vel.x = this.vel.y = 0;
						}.bind(this), ratioX);
					}.bind(this), ratioY);
				} else {
					this.vel.x = ratioX / distanceX;
					this.vel.y = 0;
					setTimeout(function() {
						this.vel.x = 0;
						this.vel.y = ratioY / distanceY;

						setTimeout(function() {
							this.currentInterpolation = null;

							this.vel.x = this.vel.y = 0;
						}.bind(this), ratioY);
					}.bind(this), ratioX);
				}
			}
			*/

			this.updateMovement();

			var updated = this.vel.x !== 0 || this.vel.y !== 0;

			// this.vel.x = this.vel.y = 0;
			
			if(updated) {
				this.parent(this);
				return true;
			}
			return false;
		},

		createTween : function(xDuration, yDuration) { console.log('new tween');
			var to = {};
			var next = {};
			var durationFirst = 0;
			var durationSecond = 0;

			if (this.direction === game.ENUM.DIRECTION.UP || this.direction === game.ENUM.DIRECTION.DOWN) {
				to.y   = this.interpolations[0].y;
				next.x = this.interpolations[0].x;
				durationFirst  = yDuration * 50;
				durationSecond = xDuration * 50;
			} else {
				to.x   = this.interpolations[0].x;
				next.y = this.interpolations[0].y;
				durationFirst  = xDuration * 50;
				durationSecond = yDuration * 50;
			}

			this.tween = new me.Tween(this.pos).to(to, durationFirst).onComplete(function() {
				this.tween = new me.Tween(this.pos).to(next, durationSecond).onComplete(function() {
					this.interpolations = this.interpolations.slice(1);
					this.tween = null;
				}.bind(this));
				this.tween.easing(me.Tween.Easing.Linear.EaseNone);
				this.tween.start();
			}.bind(this));

			this.tween.easing(me.Tween.Easing.Linear.EaseNone);
			this.tween.start();
		}
	});

})();