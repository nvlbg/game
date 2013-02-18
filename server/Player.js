require('./Util.js');

var Vector2d = require('./Vector2d.js');
var Rect = require('./Rect.js');
var Bullet = require('./Bullet.js');
var config = require('./config.json');

var Player = Rect.extend({
	// constructor
	init : function(pos, dir, recoil, speed, friction, team, shootSpeed, socket, id) {
		this.parent(pos, 32, 32);

		this.updated = false;
		this.socket = socket;
		this.team = team;

		this.net_latency = 0.001;
		this.net_offset = 100;
		this.last_ping_time = 0.001;
		this.socket.on(Game.TYPE.PING, this.onPing.bind(this));
		this.createPingTimer();

		this.canShoot = true;
		this.shootSpeed = shootSpeed - 25;
		this.bullets = {};
		this.unconfirmedBullets = [];
		this.bulletsCounter = 0;

		this.alive = true;

		this.recoil = recoil;
		this.accel = new Vector2d(speed, speed);
		this.friction = new Vector2d(friction, friction);

		this.vel = new Vector2d(0, 0);
		this.pressed = 0;
		this.direction = this.lastSentDir = dir;

		this.lastSentPos = null;
		this.inputs = [];
		this.last_input_seq = 0;

		this.fake_latency = 0;
		/*
		if(dir === Game.DIRECTION.UP || dir === Game.DIRECTION.DOWN) {
			this.updateColRect(24, 29);
		} else if(dir === Game.DIRECTION.LEFT || dir === Game.DIRECTION.RIGHT) {
			this.updateColRect(29, 24);
		} else {
			throw "unknown direction \"" + dir + "\"";
		}*/

		this.id = id;
	},

	answerSmartphone : function (answer) {
		this.smartphone.emit(Game.TYPE.SMARTPHONE_ACCEPT, answer);

		if ( answer === true ) {
			this.smartphoneConnected = true;
			this.smartphone.on(Game.TYPE.UPDATE, function(data) {
				this.inputs.push({
					input_seq: data.s,
					pressed: data.p
				});
			}.bind(this));
		} else {
			this.smartphone = null;
		}
	},

	update : function() {
		if (!this.alive) {
			return;
		}

		var bullet, b;
		for (b in this.bullets) {
			bullet = this.bullets[b];

			bullet.update();
		}

		if (this.inputs.length > 0) {
			var pressed, shootAngle, clientBulletId;
			for (var i = 0, len = this.inputs.length; i < len; i++) {
				pressed = this.inputs[i].pressed;
				shootAngle = this.inputs[i].shootAngle;
				clientBulletId = this.inputs[i].clientBulletId;

				if ( pressed !== undefined ) {
					if(pressed & Game.PRESSED.LEFT) {
						this.moveLeft();
					} else if(pressed & Game.PRESSED.RIGHT) {
						this.moveRight();
					}

					if(pressed & Game.PRESSED.UP) {
						this.moveUp();
					} else if(pressed & Game.PRESSED.DOWN) {
						this.moveDown();
					}

					this.updateMovement();
					this.vel.x = this.vel.y = 0;
				}

				if ( shootAngle !== undefined && clientBulletId !== undefined ) {
					this.shoot(shootAngle, clientBulletId);
				}

				pressed = shootAngle = clientBulletId = undefined;
			}


			this.last_input_seq = this.inputs[this.inputs.length - 1].input_seq;

			this.inputs = [];
		}
	},

	moveLeft : function() {
		this.vel.x -= this.accel.x * Game.timer.tick;
		this.vel.y = 0;

		if(this.direction !== Game.DIRECTION.LEFT) {
			//this.updateColRect(29, 24);
			this.direction = Game.DIRECTION.LEFT;
		}
	},

	moveRight : function() {
		this.vel.x += this.accel.x * Game.timer.tick;
		this.vel.y = 0;

		if(this.direction !== Game.DIRECTION.RIGHT) {
			//this.updateColRect(29, 24);
			this.direction = Game.DIRECTION.RIGHT;
		}
	},

	moveUp : function() {
		this.vel.x = 0;
		this.vel.y -= this.accel.y * Game.timer.tick;

		if(this.direction !== Game.DIRECTION.UP) {
			//this.updateColRect(24, 29);
			this.direction = Game.DIRECTION.UP;
		}
	},

	moveDown : function() {
		this.vel.x = 0;
		this.vel.y += this.accel.y * Game.timer.tick;

		if(this.direction !== Game.DIRECTION.DOWN) {
			//this.updateColRect(24, 29);
			this.direction = Game.DIRECTION.DOWN;
		}
	},

	shoot : function( angle, clientBulletId ) {
		if(this.canShoot) {
			this.canShoot = false;
			setTimeout(function() {
				this.canShoot = true;
			}.bind(this), this.shootSpeed);
		} else {
			console.log('you cannot shoot: ' + clientBulletId);
			this.unconfirmedBullets.push(clientBulletId);
			return false;
		}

		//TODO: recoil won't work when interpolating
		//TODO: most likely, get rid of recoil
		/*
		if(this.direction === game.ENUM.DIRECTION.UP) {
			this.vel.y += this.recoil;
		} else if (this.direction === game.ENUM.DIRECTION.DOWN) {
			this.vel.y -= this.recoil;
		} else if (this.direction === game.ENUM.DIRECTION.LEFT) {
			this.vel.x += this.recoil;
		} else if (this.direction === game.ENUM.DIRECTION.RIGHT) {
			this.vel.x -= this.recoil;
		} else { // this should never happen
			throw "unknown direction \"" + this.direction + "\"";
		}
		*/

		// compute angle/direction
		var dir = new Vector2d(Math.cos(angle), Math.sin(angle));
		var pos = new Vector2d(this.pos.x + dir.x*16, this.pos.y + dir.y*16);

		this.bullets[this.bulletsCounter] = new Bullet (pos, dir, 5, this.id, this.team,
														this.bulletsCounter);
		this.bulletsCounter += 1;

		return true;
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
		
		this.pos.add(this.vel);
		/*
		var pos = this.pos.clone();
		collision = Game.collide(this);
		
		if(collision && collision.obj instanceof Player) {
			console.log((new Date().getTime()) + " colliding");
			if(collision.y !== 0) {
				this.vel.y = 0;
			}
			
			if(collision.x !== 0) {
				this.vel.x = 0;
			}
			
			pos.add(this.vel);
			this.pos.x = pos.x;
			this.pos.y = pos.y;
		}
		*/
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

	updateColRect : function(w, h) {
		this.width = w;
		this.height = h;
	},

	onCollision : function(res, obj) {

	},

	smartphone : null,
	smartphoneConnected : false,
	connectSmartphone : function (smartphone) {
		this.smartphone = smartphone;
		this.socket.emit(Game.TYPE.SMARTPHONE_REQUEST);
	},

	createPingTimer: function() {
		this.last_ping_time = new Date().getTime();
		this.socket.emit(Game.TYPE.PING_REQUEST, this.last_ping_time);
	},

	// event handlers
	onPing: function(clientTime) {
		var now = new Date().getTime();
	
		// latency is how long message took to get to server
		var latency = (now-clientTime)/2;
		
		// TODO: maybe I could use better approach for finding latency
		if (this.net_latency !== Number.MAX_VALUE) {
			this.net_latency = (this.net_latency + latency) / 2;
		} else {
			this.net_latency = latency;
		}

		setTimeout(this.createPingTimer.bind(this), Game.net_ping_update_step);
	},

	removeBullet: function(id) {
		if (this.bullets[id]) {
			delete this.bullets[id];
		}
	},

	explode: function() {
		this.alive = false;

		for (var i in Game.players) {
			Game.players[i].socket.emit(Game.TYPE.PLAYER_DIED, this.id);
		}

		setTimeout(function() {
			this.alive = true;

			do {
				this.pos = new Vector2d(Number.prototype.random(32, 320), Number.prototype.random(32, 320));
			} while ( Game.collide(this) || 
					Game.world.checkCollision(this, new Vector2d(0, 0)).xtile ||
					Game.world.checkCollision(this, new Vector2d(0, 0)).ytile );

			var update = {};
			update.i = this.id;
			update.x = this.pos.x;
			update.y = this.pos.y;

			for (var i in Game.players) {
				Game.players[i].socket.emit(Game.TYPE.PLAYER_RESPAWNED, update);
			}
		}.bind(this), config.RESPAWN_TIME_STEP);
	}
});

module.exports = Player;
