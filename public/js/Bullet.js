(function() {
	
	window.game.Bullet = me.ObjectEntity.extend({
		init : function(x, y, direction, speed, ownerID) {
			if (!this.initialized) { // on first pass
				var settings = {
					image : "tanks",
					spritewidth : 32,
					spriteheight : 32
				};

				this.parent(x, y, settings);

				this.collidable = true;
				this.gravity = 0;

				this.addAnimation("forward", [43]);
				this.addAnimation("sideward", [44]);
				this.addAnimation("explode", [45,46]);

				this.type = me.game.BULLET_OBJECT;
			} else {
				this.pos.x = x;
				this.pos.y = y;
			}

			this.visible = true;
			this.initialized = true;
			this.ownerID = ownerID;
			this.isExploding = false;

			this.setCurrentAnimation("sideward");
			this.updateColRect(14, 5, 12, 8);

			this.angle = Math.atan2(direction.y, direction.x);

			// me.debug.renderHitBox = true;
			// me.debug.renderVelocity = true;
			// me.debug.renderCollisionMap = true;

			this.speed = speed || 5;
			this.direction = new me.Vector2d(
									direction.x * this.speed,
									direction.y * this.speed
								);
			// console.log(this.direction);
			this.vel.x = this.direction.x;
			this.vel.y = this.direction.y;
		},

		update : function() {
			if(!this.visible) {
				me.game.remove(this);
				return false;
			}

			if(this.isExploding) {
				this.parent(this);
				return true;
			}

			this.updateMovement();
			this.parent(this);
			return true;
		},

		explode : function() {
			this.vel.x = this.vel.y = 0;
			this.isExploding = true;

			this.setCurrentAnimation("explode", function() {
				me.game.remove(this);
			}.bind(this));
		},

		updateMovement : function() {
			this.computeVelocity(this.vel);

			var collision = this.collisionMap.checkCollision(this.collisionBox, this.vel);

			if(collision.y && collision.yprop.isSolid && collision.yprop.type !== 'water') {
				this.explode();
				return;
			}

			if(collision.x && collision.xprop.isSolid && collision.xprop.type !== 'water') {
				this.explode();
				return;
			}

			collision = me.game.collide(this);
			if (collision && collision.obj instanceof game.Tank &&
				collision.obj.GUID !== this.ownerID) { // a Tank is hit

				if (collision.obj.type === me.game.ENEMY_OBJECT ||   // Enemy Tank or
					(collision.obj.type === me.game.FRIEND_OBJECT && // Friend Tank
					me.gamestat.getItemValue("friendly_fire"))) {    // with friendly_fire
				
					collision.obj.explode();
					me.game.remove(this);
					return;
				}
			}

			this.pos.add(this.vel);
		}
	});

})();