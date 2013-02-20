require('./Util.js');

var Vector2d = require('./Vector2d.js');
var Rect = require('./Rect.js');
var config = require('./config.json');

var Bullet = Rect.extend({
	// constructor
	init : function(pos, direction, speed, ownerID, team, id) {
		if (!this.initialized) { // on first pass
			this.parent(pos, 6, 6);
			this.vel = new Vector2d(0, 0);
			// this.initialized = true;
		} else {
			this.pos.x = pos.x;
			this.pos.y = pos.y;
		}

		this.isBroadcasted = false;

		this.ownerID = ownerID;
		this.team = team;
		this.id = id;

		this.speed = speed || 5;
		this.accel = new Vector2d(this.speed, this.speed);
		this.friction = new Vector2d(0, 0);

		this.vel.x = direction.x * this.speed;
		this.vel.y = direction.y * this.speed;

		this.angle = Math.atan2(direction.y, direction.x);
	},

	update : function() {
		this.updateMovement();
	},

	updateMovement : function() {
		this.computeVelocity(this.vel);

		var collision = Game.world.checkCollision(this, this.vel);

		if(collision.y && collision.ytile !== Game.world.collisionLayer.watergid) {
			Game.players[this.ownerID].removeBullet( this.id );
			return;
		}

		if(collision.x && collision.xtile !== Game.world.collisionLayer.watergid) {
			Game.players[this.ownerID].removeBullet( this.id );
			return;
		}

		collision = Game.collide(this);
		if (collision && collision.obj &&
			collision.obj.id !== this.ownerID) { // a Tank is hit

			if (collision.obj.team !== this.team ||
				(collision.obj.team === this.team && config.FRIENDLY_FIRE === true)) {
				// we have hit enemy
				// or friendly fire is enabled and we have hit friend
				
				if (!collision.obj.invulnerable) {
					collision.obj.explode();
					Game.players[this.ownerID].removeBullet( this.id );
					return;
				}
			}

		}

		this.pos.add(this.vel);
	},

	computeVelocity : function(vel) {
		// apply friction
		if (this.friction.x) {
			this.vel.x = Game.world.applyFriction(this.vel.x, this.friction.x);
		}
		if (this.friction.y) {
			this.vel.y = Game.world.applyFriction(this.vel.y, this.friction.y);
		}

		// cap velocity
		if (vel.y !== 0) {
			vel.y = vel.y.clamp(-this.accel.y,this.accel.y);
		}
		if (vel.x !== 0) {
			vel.x = vel.x.clamp(-this.accel.x,this.accel.x);
		}
		
	},

	onCollision: function(res, obj) {

	}
});

module.exports = Bullet;
