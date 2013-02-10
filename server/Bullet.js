require('./Util.js');

var Vector2d = require('./Vector2d.js');
var Rect = require('./Rect.js');
var config = require('./config.json');
/*
var Bullet = Rect.extend({
	// constructor
	init : function(pos, angle, speed, ownerID, team) {
		if (!this.initialized) { // on first pass
			this.parent(pos, settings);
		} else {
			this.pos = pos;
		}

		this.initialized = true;
		this.ownerID = ownerID;
		this.team = team;

		this.updateColRect(6, 6);

		this.speed = speed || 5;
		this.direction = new me.Vector2d(
								Math.cos(angle),
								Math.sin(angle)
							);
		this.angle = angle;

		this.vel.x = this.direction.x * this.speed;
		this.vel.y = this.direction.y * this.speed;
	},

	update : function() {
		this.updateMovement();
	},

	updateMovement : function() {
		this.computeVelocity(this.vel);

		var collision = Game.world.checkCollision(this, this.vel);

		if(collision.y && collision.yprop.isSolid && collision.yprop.type !== 'water') {
			me.game.remove(this);
			return;
		}

		if(collision.x && collision.xprop.isSolid && collision.xprop.type !== 'water') {
			me.game.remove(this);
			return;
		}

		collision = Game.collide(this);
		if (collision && collision.obj instanceof Player &&
			collision.obj.id !== this.ownerID) { // a Tank is hit

			if (collision.obj.team !== this.team ||
				(collision.obj.team === this.team && config.FRIENDLY_FIRE === true)) {
				// we have hit enemy
				// or friendly fire is enabled and we have hit friend
				
				// TODO: broadcast to everyone that collision.obj is hit/dead
				
				me.game.remove(this); // remove bullet from game simulation
				return;
			}
		}

		this.pos.add(this.vel);
	},

	updateColRect : function(w, h) {
		this.width = w;
		this.height = h;
	}
});

module.exports = Bullet;
*/