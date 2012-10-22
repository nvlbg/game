var app = require('express').createServer().listen(8080),
	io = require('socket.io').listen(app);

app.get('*', function(req, res) {
	res.sendfile(__dirname + '/public/' + req.params[0]);
});

console.log('Server started at 127.0.0.1:8080');

var TYPE = {
	SPAWN_REQUEST : 0,
	SPAWN : 1,
	NEW_PLAYER : 2,
	MOVE : 3,
	PLAYER_UPDATED : 4,
	CORRECTION : 5,
	PLAYER_CORRECTION : 6,
	PLAYER_DISCONNECTED : 7
};
var players = {};
var idCounter = 0;
var DIRECTION = {
	UP : 0,
	DOWN : 1,
	LEFT : 2,
	RIGHT : 3
};

function Player(x, y, dir) {
	this.id = idCounter++;

	this.x = x;
	this.y = y;
	this.velX = 0;
	this.velY = 0;
	this.pressed = [false, false, false, false];
	this.direction = dir;

	this.update = function() {
		if(this.pressed[0]) {
			this.velX = -3;
			this.velY = 0;
		} else if(this.pressed[1]) {
			this.velX = 3;
			this.velY = 0;
		}

		if(this.pressed[2]) {
			this.velX = 0;
			this.velY = -3;
		} else if(this.pressed[3]) {
			this.velX = 0;
			this.velY = 3;
		}

		this.x += this.velX;
		this.y += this.velY;

		if(x < 32) {
			this.x = 32;
		}

		if(y < 32) {
			this.y = 32;
		}

		this.velX = this.velY = 0;
	};
}

io.sockets.on('connection', function (socket) {
	console.log('client connected');
	var player = null;

	socket.on(TYPE.SPAWN_REQUEST, function() {
		player = new Player(32, 64, DIRECTION.DOWN);
		var data = {
			x : player.x,
			y : player.y,
			d : player.direction,
			p : []
		};

		for(var i in players) {
			data.p.push({
				x : players[i].x,
				y : players[i].y,
				p : players[i].pressed,
				d : players[i].direction,

				i : players[i].id
			});
		}

		socket.emit(TYPE.SPAWN, data);

		socket.broadcast.emit(TYPE.NEW_PLAYER, {
			x : player.x,
			y : player.y,
			p : player.pressed,
			d : player.direction,

			i : player.id
		});

		players[player.id] = player;

		socket.on(TYPE.MOVE, function(data) {
			player.direction = data.d;
			player.pressed = data.p;

			
			socket.broadcast.emit(TYPE.PLAYER_UPDATED, {
				p : data.p,
				d : data.d,
				x : player.x,
				y : player.y,
				
				i : player.id
			});
		});

		setInterval(function() {
			player.update();
		}, 1000 / 60);

		setInterval(function() {
			var correction = {
				x : player.x,
				y : player.y,
				d : player.direction
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