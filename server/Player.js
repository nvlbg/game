require('./Util.js');
var constants = require('./constants.js');
var game = require('./game.js');

var TYPE = constants.TYPE;
var DIRECTION = constants.DIRECTION;
var PRESSED = constants.PRESSED;

var Vector2d = require('./Vector2d.js');
var Rect = require('./Rect.js');

var Player = Rect.extend({
	init : function(pos, dir, recoil, speed, friction, socket, id) {
		this.parent(pos, 32, 32);

		this.updated = false;
		this.socket = socket;

		this.recoil = recoil;
		this.accel = new Vector2d(speed, speed);
		this.friction = new Vector2d(friction, friction);

		this.vel = new Vector2d(0, 0);
		this.pressed = 0;
		this.direction = dir;
		
		if(dir === DIRECTION.UP || dir === DIRECTION.DOWN) {
			this.updateColRect(24, 29);
		} else if(dir === DIRECTION.LEFT || dir === DIRECTION.RIGHT) {
			this.updateColRect(29, 24);
		} else {
			throw "unknown direction \"" + dir + "\"";
		}

		this.id = id;
	},

	update : function() {
		if(this.pressed & PRESSED.LEFT) {
			this.moveLeft();
		} else if(this.pressed & PRESSED.RIGHT) {
			this.moveRight();
		}

		if(this.pressed & PRESSED.UP) {
			this.moveUp();
		} else if(this.pressed & PRESSED.DOWN) {
			this.moveDown();
		}

		this.updateMovement();

		this.vel.x = 0;
		this.vel.y = 0;
	},

	moveLeft : function() {
		this.vel.x -= this.accel.x * timer.tick;
		this.vel.y = 0;

		if(this.direction !== DIRECTION.LEFT) {
			this.updateColRect(29, 24);
			this.direction = DIRECTION.LEFT;
		}
	},

	moveRight : function() {
		this.vel.x += this.accel.x * timer.tick;
		this.vel.y = 0;

		if(this.direction !== DIRECTION.RIGHT) {
			this.updateColRect(29, 24);
			this.direction = DIRECTION.RIGHT;
		}
	},

	moveUp : function() {
		this.vel.x = 0;
		this.vel.y -= this.accel.y * timer.tick;

		if(this.direction !== DIRECTION.UP) {
			this.updateColRect(24, 29);
			this.direction = DIRECTION.UP;
		}
	},

	moveDown : function() {
		this.vel.x = 0;
		this.vel.y += this.accel.y * timer.tick;

		if(this.direction !== DIRECTION.DOWN) {
			this.updateColRect(24, 29);
			this.direction = DIRECTION.DOWN;
		}
	},


	// TODO: make this method
	updateMovement : function() {
		this.computeVelocity(this.vel);

		/*
		var collision = game.checkCollision(this.collisionBox, this.vel);
		
		if (collision.y !== 0) {
			this.vel.y = 0;
		}
		
		if (collision.x !== 0) {
			this.vel.x = 0;
		}
		
		var x = this.pos.x, y = this.pos.y;
		*/
		
		this.pos.add(this.vel);
		
		/*
		collision = game.collide(this);
		
		if(collision && collision.obj instanceof Player) {
			if(collision.y !== 0) {
				this.vel.y = 0;
			}
			
			if(collision.x !== 0) {
				this.vel.x = 0;
			}
			
			this.pos.x = x;
			this.pos.y = y;
		}
		*/
	},
	
	computeVelocity : function(vel) {
		// apply friction
		if (this.friction.x)
			this.vel.x = game.applyFriction(this.vel.x, this.friction.x);
		if (this.friction.y)
			this.vel.y = game.applyFriction(this.vel.y, this.friction.y);

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

	checkCollision : function(obj) {
		var res = this.collideVsAABB(obj);

		if (res.x != 0 || res.y != 0) {
			// notify the object
			this.onCollision(res, obj);
			// return a reference of the colliding object
			res.obj = this;
			return res;
		}
		return null;
	},

	onCollision : function(res, obj) {

	}
});

module.exports = Player;