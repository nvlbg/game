(function() {
	
	window.game.Bullet = me.ObjectEntity.extend({
		init : function(x, y, direction, speed, ownerID, team, seq, id) {
			var settings = {
				image : "tanks",
				spritewidth : 32,
				spriteheight : 32
			};

			this.parent(x, y, settings);

			this.collidable = true;
			this.gravity = 0;

			// this.renderable.addAnimation("forward", [39]);
			this.renderable.addAnimation("sideward", [40]);
			this.renderable.addAnimation("explode", [41,42]);

			this.type = me.game.BULLET_OBJECT;
			
			this.updateColRect(14, 6, 12, 6);

			this.confirmed = false;
			this.seq = seq;

			this.visible = true;
			this.ownerID = ownerID;
			this.id = id;
			this.team = team;
			this.isExploding = false;

			this.renderable.setCurrentAnimation("sideward");

			this.angle = this.renderable.angle = Math.atan2(direction.y, direction.x);

			this.speed = speed || 5;
			this.direction = direction;
			
			this.vel.x = this.direction.x * this.speed;
			this.vel.y = this.direction.y * this.speed;

			this.alwaysUpdate = true;

			if (me.game.viewport.isVisible(this)) {
				me.audio.play('shot');
			}
		},


		applyCompensation: function( delta ) {
			this.pos.x += this.vel.x * delta;
			this.pos.y += this.vel.y * delta;
		},

		update : function() {
			if(!this.isExploding) {
				this.updateMovement();
			}

			this.parent(this);
			return true;
		},

		remove: function() {
			if ( window.game.network.players[this.ownerID] === window.game.network.player ) {
				window.game.network.player.removeBulletById(this.id);
			} else {
				me.game.remove(this);
			}

			(function() {
				me.game.repaint();
			}).defer();
		},

		explode : function() {
			this.vel.x = this.vel.y = 0;
			this.isExploding = true;

			this.renderable.setCurrentAnimation("explode", this.remove.bind(this));

			if (me.game.viewport.isVisible(this)) {
				me.audio.play('impact');
			}
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

				if (collision.obj.team !== this.team ||   // Enemy Tank or
					(collision.obj.team === this.team &&  // Friend Tank
					me.gamestat.getItemValue("friendly_fire"))) { // with friendly_fire
					
					if (!collision.obj.invulnerable) {
						me.audio.play('armor');
						this.remove();
						return;
					}
					
				}
			}

			this.pos.add(this.vel);
		}
	});

})();
