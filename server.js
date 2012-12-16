var app = require('express').createServer().listen(8080),
	io = require('socket.io').listen(app),
	
	constants = require('./server/constants.js'),
	Vector2d = require('./server/Vector2d.js'),

	TYPE = constants.TYPE,
	DIRECTION = constants.DIRECTION,

	Player = require('./server/Player.js');

timer = require('./server/timer.js');
timer.init();

app.get('*', function(req, res) {
	res.sendfile(__dirname + '/public/' + req.params[0]);
});

console.log('Server started at 127.0.0.1:8080');

players = {};
var idCounter = 0;


setInterval(function() {
	timer.update();
	tick = timer.tick;
	
	for(var i in players) {
		var player = players[i];
		player.update();

		if(player.updated) {
			player.socket.broadcast.emit(TYPE.PLAYER_UPDATED, {
				p : player.pressed,
				x : player.pos.x,
				y : player.pos.y,
				
				i : player.id
			});

			player.updated = false;
		}
	}
}, 1000 / constants.fps);

setInterval(function() {
	for(var i in players) {
		var player = players[i];
		var correction = {
			x : player.pos.x,
			y : player.pos.y
		};

		player.socket.emit(TYPE.CORRECTION, correction);

		correction.i = player.id;
		player.socket.broadcast.emit(TYPE.PLAYER_CORRECTION, correction);
	}
}, 3000);

io.sockets.on('connection', function (socket) {
	console.log('client connected');
	var player = null;

	socket.on(TYPE.SPAWN_REQUEST, function() {
		player = new Player(new Vector2d(32, 64), DIRECTION.DOWN, 0, 3, 0, socket, idCounter++);
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
			player.updated = true;
		});
	});

	socket.on('disconnect', function() {
		socket.broadcast.emit(TYPE.PLAYER_DISCONNECTED, player.id);

		if(players !== null && typeof player !== 'undefined') {
			delete players[player.id];
		}
	});
});