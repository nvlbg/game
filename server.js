var app = require('express').createServer().listen(8080),
	io = require('socket.io').listen(app),
	
	constants = require('./server/constants.js'),
	Vector2d = require('./server/Vector2d.js'),

	TYPE = constants.TYPE,
	DIRECTION = constants.DIRECTION,

	Player = require('./server/Player.js');

app.get('*', function(req, res) {
	res.sendfile(__dirname + '/public/' + req.params[0]);
});

console.log('Server started at 127.0.0.1:8080');

var players = {};
var idCounter = 0;


io.sockets.on('connection', function (socket) {
	console.log('client connected');
	var player = null;

	socket.on(TYPE.SPAWN_REQUEST, function() {
		player = new Player(new Vector2d(32, 64), DIRECTION.DOWN, 0, 3, 0, idCounter++);
		var data = {
			x : player.pos.x,
			y : player.pos.y,
			d : player.direction,
			p : []
		};

		for(var i in players) {
			data.p.push({
				x : players[i].pos.x,
				y : players[i].pos.y,
				p : players[i].pressed,
				d : players[i].direction,

				i : players[i].id
			});
		}

		socket.emit(TYPE.SPAWN, data);

		socket.broadcast.emit(TYPE.NEW_PLAYER, {
			x : player.pos.x,
			y : player.pos.y,
			p : player.pressed,
			d : player.direction,

			i : player.id
		});

		players[player.id] = player;

		socket.on(TYPE.MOVE, function(pressed) {
			player.pressed = pressed;

			
			socket.broadcast.emit(TYPE.PLAYER_UPDATED, {
				p : player.pressed,
				x : player.pos.x,
				y : player.pos.y,
				
				i : player.id
			});
		});

		setInterval(function() {
			player.update();
		}, 1000 / 60);

		setInterval(function() {
			var correction = {
				x : player.pos.x,
				y : player.pos.y
			};

			socket.emit(TYPE.CORRECTION, correction);

			correction.i = player.id;
			socket.broadcast.emit(TYPE.PLAYER_CORRECTION, correction);
		}, 3000);
	});

	socket.on('disconnect', function() {
		socket.broadcast.emit(TYPE.PLAYER_DISCONNECTED, player.id);

		if(players !== null && typeof player !== 'undefined') {
			delete players[player.id];
		}
	});
});