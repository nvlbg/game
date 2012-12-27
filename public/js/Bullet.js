(function() {
	
	window.game.Bullet = me.ObjectEntity.extend({
		init : function(x, y, direction, speed, ownerID) {
			var settings = {
				image : "tanks",
				spritewidth : 32,
				spriteheight : 32
			};

			this.parent(x, y, settings);

			this.ownerID = ownerID;

			this.collidable = true;
			this.gravity = 0;
			this.isExploding = false;

			this.addAnimation("forward", [43]);
			this.addAnimation("sideward", [44]);
			this.addAnimation("explode", [45,46]);

			this.speed = speed || 5;
			this.speedAccel = this.speed / 100;
			this.direction = direction;

			if(direction === game.Network.DIRECTION.UP) {
				this.setCurrentAnimation("forward");
				this.updateColRect(14, 5, 12, 8);
				this.vel.y = -this.speed;
			} else if(direction === game.Network.DIRECTION.DOWN) {
				this.setCurrentAnimation("forward");
				this.flipY(true);
				this.updateColRect(14, 5, 12, 8);
				this.vel.y = this.speed;
			} else if(direction === game.Network.DIRECTION.LEFT) {
				this.setCurrentAnimation("sideward");
				this.flipX(true);
				this.updateColRect(12, 8, 14, 5);
				this.vel.x = -this.speed;
			} else if(direction === game.Network.DIRECTION.RIGHT) {
				this.setCurrentAnimation("sideward");
				this.updateColRect(12, 8, 14, 5);
				this.vel.x = this.speed;
			}

			this.type = me.game.BULLET_OBJECT;
		},

		update : function() {
			if(!this.visible) {
				me.game.remove(this);
				return false;
			}

			if(!this.isExploding) {
				if(this.direction === game.Network.DIRECTION.UP) {
					this.vel.y -= this.speedAccel;
				} else if(this.direction === game.Network.DIRECTION.DOWN) {
					this.vel.y += this.speedAccel;
				} else if(this.direction === game.Network.DIRECTION.LEFT) {
					this.vel.x -= this.speedAccel;
				} else if(this.direction === game.Network.DIRECTION.RIGHT) {
					this.vel.x += this.speedAccel;
				}
			}

			this.updateMovement();
			this.parent(this);
			return true;
		},

		explode : function() {
			this.isExploding = true;

			var that = this;
			this.setCurrentAnimation("explode", function() {
				me.game.remove(that);
			});
		},

		updateMovement : function() {
			this.computeVelocity(this.vel);

			var collision = this.collisionMap.checkCollision(this.collisionBox, this.vel);

			if(collision.y && collision.yprop.isSolid && collision.yprop.type !== 'water') {
				this.vel.y = 0;
				this.explode();
				return;
			}

			if(collision.x && collision.xprop.isSolid && collision.xprop.type !== 'water') {
				this.vel.x = 0;
				this.explode();
				return;
			}

			collision = me.game.collide(this);
			if(collision && collision.obj instanceof game.Tank &&
			   collision.obj.GUID !== this.ownerID) { // a Tank is hit

				if(collision.obj.type === me.game.ENEMY_OBJECT ||   // Enemy Tank or
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