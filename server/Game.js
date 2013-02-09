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
	local_time : null,

	authenticateSmathphone : function(socket, playerID) {
		if (!Game.players[playerID]) {
			socket.emit(Game.TYPE.SMARTPHONE_ACCEPT, false);
		} else {
			Game.players[playerID].connectSmartphone(socket);
		}
	},

	update : function () {
		Game.timer.update();
		
		var player;
		for(var i in Game.players) {
			player = Game.players[i];
			player.update();

			/*
			if(player.updated) {
				if (player.smartphoneConnected) {
					player.socket.emit(Game.TYPE.PLAYER_UPDATED, {
						p : player.pressed,
						x : player.pos.x,
						y : player.pos.y
					});
				}

				player.socket.broadcast.emit(Game.TYPE.PLAYER_UPDATED, {
					p : player.pressed,
					x : player.pos.x,
					y : player.pos.y,
					
					i : player.id
				});

				player.updated = false;
			}
			*/
		}
	},

	correctionUpdate : function () {
		var i, player, correction = {}, isEmpty = true;
		for(i in Game.players) {
			player = Game.players[i];
			
			if (!player.oldPos.equals(player.pos)) {
				correction[player.id] = {
					x: player.pos.x,
					y: player.pos.y,
					s: player.last_input_seq
				};

				player.oldPos = player.pos.clone();
				isEmpty = false;
			}
		}

		if(!isEmpty) {
			correction.t = Game.local_time;
			for(i in Game.players) {
				Game.players[i].socket.emit(Game.TYPE.CORRECTION, correction);
			}
			console.log(correction);
		}

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

		var player = new Player(new Vector2d(32, 64), this.DIRECTION.DOWN, 0, 3, 0, team, socket, this.idCounter++);

		while ( Game.collide(player) || 
				Game.world.checkCollision(player, new Vector2d(0, 0)).xtyle ||
				Game.world.checkCollision(player, new Vector2d(0, 0)).ytyle )
		{
			player.pos = new Vector2d(Number.prototype.random(32, 320), Number.prototype.random(32, 320));
		}

		var data = {
			x : player.pos.x,
			y : player.pos.y,
			d : player.direction,
			t : player.team,
			i : player.id,
			
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

		socket.on(Game.TYPE.INPUT, function(data) {
			player.pressed = data.p;
			var delta = new Vector2d(data.x, data.y);
			delta.sub(player.pos);
			player.delta = delta;
			player.updated = true;
		});

		socket.on(Game.TYPE.UPDATE, function(data) {
			player.inputs.push({
				input_seq: data.s,
				pressed: data.p
			});
		});

		socket.on(Game.TYPE.PING, function(data) {
			socket.emit(Game.TYPE.PING, data);
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
		
		Game.world = new World(require('./../public/data/maps/' + config.MAP + '.json'));

		Game.timer = require('./timer.js');
		Game.timer.init();

		setInterval(Game.update,           1000 / config.FPS          );
		setInterval(Game.correctionUpdate, config.CORRECTION_TIME_STEP);
	}

};

module.exports = Game;