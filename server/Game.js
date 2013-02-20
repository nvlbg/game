require('./Util.js');

var Player = require('./Player.js');
var World = require('./World.js');
var Vector2d = require('./Vector2d.js');
var config = require('./config.json');

var Game = {
	players : {},
	idCounter : 0,

	world : null,
	timer : null,

	TYPE : null,
	POSITION : null,
	DIRECTION : null,
	TEAM : null,
	PRESSED : null,

	blue  : 0,
	green : 0,

	_dt : null,
	_dte : null,
	local_time : 0,

	net_ping_update_step: 0,
	buffer_size: 0,
	buffer: null,

	authenticateSmathphone : function(socket, playerID) {
		if (!Game.players[playerID]) {
			socket.emit(Game.TYPE.SMARTPHONE_ACCEPT, false);
		} else {
			Game.players[playerID].connectSmartphone(socket);
		}
	},

	update : function () {
		Game.timer.update();

		//TODO: maybe this isn't the right approach
		if (Game.buffer.length > Game.buffer_size) {
			Game.buffer.splice(0, 1);
		}
		
		var player, state = {};
		for(var i in Game.players) {
			player = Game.players[i];

			state[player.id] = {
				x: player.pos.x,
				y: player.pos.y
			};

			player.update();
		}

		state.t = Game.local_time;
		Game.buffer.push(state);
	},

	correctionUpdate : function () {
		//TODO: last_input_seq should be send only to your player and not to others
		//TODO: only what has changed should be sent
		var i, player, correction = {}, isEmpty = true, j, bullet, unconfimedCnt;
		for(i in Game.players) {
			player = Game.players[i];
			
			if (!player.lastSentPos.equals(player.pos)) {
				correction[player.id] = {
					s: player.last_input_seq
				};

				if (player.lastSentPos.x !== player.pos.x) {
					correction[player.id].x = player.pos.x;
				}

				if (player.lastSentPos.y !== player.pos.y) {
					correction[player.id].y = player.pos.y;
				}

				player.lastSentPos = player.pos.clone();
				isEmpty = false;
			}

			if (player.lastSentDir !== player.direction) {
				if (correction[player.id] !== undefined) {
					correction[player.id].d = player.direction;
				} else {
					correction[player.id] = {
						d: player.direction,
						s: player.last_input_seq
					};
				}

				player.lastSentDir = player.direction;
				isEmpty = false;
			}

			if (player.alive !== player.lastAliveState) {
				if (correction[player.id] !== undefined) {
					correction[player.id].a = player.alive;
				} else {
					correction[player.id] = {
						a: player.alive,
						s: player.last_input_seq
					};
				}

				if (player.alive === true) {
					correction[player.id].x = player.pos.x;
					correction[player.id].y = player.pos.y;
				}

				player.lastAliveState = player.alive;
				isEmpty = false;
			}

			for (j in player.bullets) {
				bullet = player.bullets[j];

				if (!bullet.isBroadcasted) {
					if (correction[player.id] === undefined) {
						correction[player.id] = {s: player.last_input_seq};
					}

					if (correction[player.id].b === undefined) {
						correction[player.id].b = [];
					}

					correction[player.id].b.push({
						x: bullet.pos.x,
						y: bullet.pos.y,
						z: bullet.vel.x,
						c: bullet.vel.y
					});

					isEmpty = false;
					bullet.isBroadcasted = true;
				}
			}

			unconfimedCnt = player.unconfirmedBullets.length;
			if (unconfimedCnt > 0) {
				if (correction[player.id] === undefined) {
					correction[player.id] = {s: player.last_input_seq};
				}

				correction[player.id].u = player.unconfirmedBullets.splice(0, unconfimedCnt);

				isEmpty = false;
			}
		}

		if(!isEmpty) {
			correction.t = Game.local_time;
			console.log(correction);

			for(i in Game.players) {
				if (Game.players[i].fake_latency) {
					Game.delayCorrectionUpdate(Game.players[i], correction);
				} else {
					Game.players[i].socket.emit(Game.TYPE.CORRECTION, correction);
				}
			}
		}

	},

	delayCorrectionUpdate: function(player, correction) {
		setTimeout(function() {
			player.socket.emit(Game.TYPE.CORRECTION, correction);
		}, player.fake_latency);
	},

	addNewPlayer : function (socket) {
		var team;

		if (Game.blue > Game.green) {
			team = Game.TEAM.GREEN;
			Game.green += 1;
		} else {
			team = Game.TEAM.BLUE;
			Game.blue += 1;
		}

		var player = new Player(new Vector2d(32, 64), this.DIRECTION.DOWN, 0, 3, 0,
								team, 500, socket, this.idCounter++);

		while ( Game.collide(player) || 
				Game.world.checkCollision(player, new Vector2d(0, 0)).xtile ||
				Game.world.checkCollision(player, new Vector2d(0, 0)).ytile )
		{
			player.pos = new Vector2d(Number.prototype.random(32, 320), Number.prototype.random(32, 320));
		}
		player.lastSentPos = player.pos.clone();

		var data = {
			x : player.pos.x,
			y : player.pos.y,
			d : player.direction,
			t : player.team,
			i : player.id,

			z : Game.local_time,
			q : config.INVULNERABLE_TIME_STEP,
			
			l : config.MAP,
			f : config.FRIENDLY_FIRE,
			p : []
		};

		for(var i in Game.players) {
			data.p.push({
				x : Game.players[i].pos.x,
				y : Game.players[i].pos.y,
				d : Game.players[i].direction,
				t : Game.players[i].team,
				i : Game.players[i].id,

				p : Game.players[i].pressed
			});
		}

		socket.emit(Game.TYPE.SPAWN, data);

		socket.broadcast.emit(Game.TYPE.NEW_PLAYER, {
			x : player.pos.x,
			y : player.pos.y,
			d : player.direction,
			t : player.team,

			i : player.id
		});

		Game.players[player.id] = player;

		socket.on(Game.TYPE.UPDATE, function(data) {
			var update = {input_seq: data.s};
			if (data.p !== undefined) {
				update.pressed = data.p;
			}
			if (data.a !== undefined && data.i !== undefined) {
				update.shootAngle = data.a;
				update.clientBulletId = data.i;
			}

			//if (player.fake_latency) {
			//	setTimeout(function() {
			//		player.inputs.push(update);
			//	}, player.fake_latency/2);
			//} else {
				player.inputs.push(update);
			//}
		});

		socket.on(Game.TYPE.PING_REQUEST, function(data) {
			socket.emit(Game.TYPE.PING, data);
		});

		socket.on(Game.TYPE.FAKE_LATENCY_CHANGE, function(newFakeLatency) {
			player.fake_latency = newFakeLatency;
		});

		socket.on(Game.TYPE.SMARTPHONE_ACCEPT, player.answerSmartphone.bind(player));

		console.log('Client connected: ' + player.id);
		socket.on('disconnect', function() {
			console.log('Client disconnect: ' + player.id);

			if (player.team === Game.TEAM.BLUE) {
				Game.blue -= 1;
			} else {
				Game.green -= 1;
			}

			socket.broadcast.emit(Game.TYPE.PLAYER_DISCONNECTED, player.id);

			if(this.players !== null && typeof player !== 'undefined') {
				delete Game.players[player.id];
			}
		});
	},

	collide : function (obj) {
		var res, player;
		for ( var i in Game.players ) {
			player = Game.players[i];
			if (player !== obj) {
				res = obj.collideVsAABB.call(obj, player);
				if (res.x !== 0 || res.y !== 0) {
					// notify the object
					obj.onCollision.call(res, player);
					// return a reference of the colliding object
					res.obj  = player;
					return res;
				}
			}
		}
		return null;
	},

	createTimer : function() {
		setInterval(function() {
			this._dt = new Date().getTime() - this._dte;
			this._dte = new Date().getTime();
			this.local_time += this._dt/1000.0;
		}.bind(this), 4);
	},

	init : function () {
		this.local_time = 0.016;
		this._dt = this._dte = new Date().getTime();
		this.createTimer();

		var constants = require('../shared/constants.js');

		Game.TYPE = constants.TYPE;
		Game.POSITION = constants.POSITION;
		Game.DIRECTION = constants.DIRECTION;
		Game.TEAM = constants.TEAM;
		Game.PRESSED = constants.PRESSED;

		Game.net_ping_update_step = config.NET_PING_UPDATE_STEP;
		Game.buffer_size = config.BUFFER_SIZE * 60;
		Game.buffer = [];
		
		Game.world = new World(require('./../public/data/maps/' + config.MAP + '.json'));

		Game.timer = require('./timer.js');
		Game.timer.init();

		setInterval(Game.update,           1000 / config.FPS          );
		setInterval(Game.correctionUpdate, config.CORRECTION_TIME_STEP);
	}

};

module.exports = Game;
