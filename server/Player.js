require('./Util.js');

var Vector2d = require('./Vector2d.js');
var Rect = require('./Rect.js');

var Player = Rect.extend({
	init : function(pos, dir, recoil, speed, friction, team, socket, id) {
		this.parent(pos, 32, 32);

		this.updated = false;
		this.socket = socket;
		this.team = team;

		this.recoil = recoil;
		this.accel = new Vector2d(speed, speed);
		this.friction = new Vector2d(friction, friction);

		this.vel = new Vector2d(0, 0);
		this.pressed = 0;
		this.direction = dir;
		
		if(dir === Game.DIRECTION.UP || dir === Game.DIRECTION.DOWN) {
			this.updateColRect(24, 29);
		} else if(dir === Game.DIRECTION.LEFT || dir === Game.DIRECTION.RIGHT) {
			this.updateColRect(29, 24);
		} else {
			throw "unknown direction \"" + dir + "\"";
		}

		this.id = id;
	},

	update : function() {
		if(this.pressed & Game.PRESSED.LEFT) {
			this.moveLeft();
		} else if(this.pressed & Game.PRESSED.RIGHT) {
			this.moveRight();
		}

		if(this.pressed & Game.PRESSED.UP) {
			this.moveUp();
		} else if(this.pressed & Game.PRESSED.DOWN) {
			this.moveDown();
		}

		this.updateMovement();

		this.vel.x = 0;
		this.vel.y = 0;
	},

	moveLeft : function() {
		this.vel.x -= this.accel.x * Game.timer.tick;
		this.vel.y = 0;

		if(this.direction !== Game.DIRECTION.LEFT) {
			this.updateColRect(29, 24);
			this.direction = Game.DIRECTION.LEFT;
		}
	},

	moveRight : function() {
		this.vel.x += this.accel.x * Game.timer.tick;
		this.vel.y = 0;

		if(this.direction !== Game.DIRECTION.RIGHT) {
			this.updateColRect(29, 24);
			this.direction = Game.DIRECTION.RIGHT;
		}
	},

	moveUp : function() {
		this.vel.x = 0;
		this.vel.y -= this.accel.y * Game.timer.tick;

		if(this.direction !== Game.DIRECTION.UP) {
			this.updateColRect(24, 29);
			this.direction = Game.DIRECTION.UP;
		}
	},

	moveDown : function() {
		this.vel.x = 0;
		this.vel.y += this.accel.y * Game.timer.tick;

		if(this.direction !== Game.DIRECTION.DOWN) {
			this.updateColRect(24, 29);
			this.direction = Game.DIRECTION.DOWN;
		}
	},

	updateMovement : function() {
		this.computeVelocity(this.vel);

		var collision = Game.world.checkCollision(this, this.vel);
		
		if (collision.y !== 0) {
			this.vel.y = 0;
			console.log((new Date().getTime()) + ": I'm colliding with y: " + collision.y);
		}
		
		if (collision.x !== 0) {
			this.vel.x = 0;
			console.log((new Date().getTime()) + ": I'm colliding with x: " + collision.x);
		}
		
		var x = this.pos.x, y = this.pos.y;
		
		this.pos.add(this.vel);
		
		collision = Game.collide(this);
		
		if(collision && collision.obj instanceof Player) {
			console.log((new Date().getTime()) + " colliding");
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
	
	computeVelocity : function(vel) {
		// apply friction
		if (this.friction.x)
			this.vel.x = Game.world.applyFriction(this.vel.x, this.friction.x);
		if (this.friction.y)
			this.vel.y = Game.world.applyFriction(this.vel.y, this.friction.y);

		// cap velocity
		if (vel.y !=0)
			vel.y = vel.y.clamp(-this.accel.y,this.accel.y);
		if (vel.x !=0)
			vel.x = vel.x.clamp(-this.accel.x,this.accel.x);
		
	},

	updateColRect : function(w, h) {
		this.width = w;
		this.height = h;
	},

	onCollision : function(res, obj) {

	}
});

module.exports = Player;