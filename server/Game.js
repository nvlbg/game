require('./Util.js');

var Player = require('./Player.js'),
	World = require('./World.js'),
	Vector2d = require('./Vector2d.js');

var Game = {
	players : {},
	idCounter : 0,

	world : null,
	timer : null,
	constants : null,

	TYPE : null,
	POSITION : null,
	DIRECTION : null,
	TEAM : null,
	PRESSED : null,
	FRIENDLY_FIRE : false,

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
					x : player.delta.x,
					y : player.delta.y,
					
					i : player.id
				});

				player.updated = false;
			}
		}
	},

	correctionUpdate : function () {
		var player, correction;
		for(var i in Game.players) {
			player = Game.players[i];
			
			correction = {
				x : player.pos.x,
				y : player.pos.y
			};

			player.socket.emit(Game.TYPE.CORRECTION, correction);

			correction.i = player.id;
			player.socket.broadcast.emit(Game.TYPE.PLAYER_CORRECTION, correction);
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
			f : Game.FRIENDLY_FIRE,
			x : player.pos.x,
			y : player.pos.y,
			d : player.direction,
			t : player.team,
			p : []
		};

		for(var i in Game.players) {
			data.p.push({
				x : Game.players[i].pos.x,
				y : Game.players[i].pos.y,
				p : Game.players[i].pressed,
				d : Game.players[i].direction,
				t : Game.players[i].team,

				i : Game.players[i].id
			});
		}

		socket.emit(Game.TYPE.SPAWN, data);

		socket.broadcast.emit(Game.TYPE.NEW_PLAYER, {
			x : player.pos.x,
			y : player.pos.y,
			p : player.pressed,
			d : player.direction,
			t : player.team,

			i : player.id
		});

		Game.players[player.id] = player;

		socket.on(Game.TYPE.INPUT, function(input) {
			player.pressed = input[Game.TYPE.PRESSED];
			var delta = new Vector2d(input[Game.POSITION.X], input[Game.POSITION.Y]);
			delta.sub(player.pos);
			console.log(delta);
			player.delta = delta;
			player.updated = true;
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

		Game.constants = require('../shared/constants.js');
		Game.config = require('./config.js');
		Game.TYPE = Game.constants.TYPE;
		Game.POSITION = Game.constants.POSITION;
		Game.DIRECTION = Game.constants.DIRECTION;
		Game.TEAM = Game.constants.TEAM;
		Game.PRESSED = Game.constants.PRESSED;
		Game.FRIENDLY_FIRE = Game.constants.FRIENDLY_FIRE;
		
		Game.world = new World(require('./../public/data/maps/' + Game.config.MAP + '.json'));

		Game.timer = require('./timer.js');
		
		if(Game.timer.init()) {
			setInterval(Game.update,           1000 / Game.config.FPS          );
			setInterval(Game.correctionUpdate, Game.config.CORRECTION_TIME_STEP);
		}
	}

};

module.exports = Game;