(function() {
	
	window.game.Bullet = me.ObjectEntity.extend({
		init : function(x, y, direction, speed, ownerID, team, seq, id) {
			if (!this.initialized) { // on first pass
				var settings = {
					image : "tanks",
					spritewidth : 32,
					spriteheight : 32
				};

				this.parent(x, y, settings);

				this.collidable = true;
				this.gravity = 0;

				// this.addAnimation("forward", [43]);
				this.addAnimation("sideward", [44]);
				this.addAnimation("explode", [45,46]);

				this.type = me.game.BULLET_OBJECT;
				
				this.initialized = true;
				
				this.updateColRect(14, 6, 12, 6);
			} else {
				this.pos.x = x;
				this.pos.y = y;
			}

			this.confirmed = false;
			this.seq = seq;

			this.visible = true;
			this.ownerID = ownerID;
			this.id = id;
			this.team = team;
			this.isExploding = false;

			this.setCurrentAnimation("sideward");

			this.angle = Math.atan2(direction.y, direction.x);

			this.speed = speed || 5;
			this.direction = direction;
			
			this.vel.x = this.direction.x * this.speed;
			this.vel.y = this.direction.y * this.speed;

			this.compensation = new me.Vector2d(0,0);
			this.compensationFrames = 0;
		},

		applyCorrection: function(correction) {

		},

		applyCompensation: function() {
			this.compensation.copy(this.vel);
			this.compensation.x *= window.game.network.net_latency/4;
			this.compensation.y *= window.game.network.net_latency/4;
			this.compensationFrames = 4;
			console.log(this.compensation);
		},

		update : function() {
			if(!this.visible) {
				this.remove();
				return false;
			}

			if(this.isExploding) {
				this.parent(this);
				return true;
			}

			if (this.compensationFrames > 0) {
				console.log('compensation added');
				this.pos.add(this.compensation);
				this.compensationFrames -= 1;
			}

			this.updateMovement();
			this.parent(this);
			return true;
		},

		remove: function() {
			if ( window.game.network.players[this.ownerID] === window.game.network.player ) {
				window.game.network.player.removeBulletById(this.id);
			} else {
				me.game.remove(this);
			}
		},

		explode : function() {
			this.vel.x = this.vel.y = 0;
			this.isExploding = true;

			this.setCurrentAnimation("explode", this.remove.bind(this));
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
				
					this.remove();
					return;
				}
			}

			this.pos.add(this.vel);
		}
	});

})();