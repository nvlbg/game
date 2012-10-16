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
	PLAYER_DISCONNECTED : 5
};
var players = [];
var idCounter = 0;
var DIRECTION = {
	UP : 0,
	DOWN : 1,
	LEFT : 2,
	RIGHT : 3
};

function Player(x, y, dir) {
	var id = idCounter++;

	this.x = x;
	this.y = y;
	this.direction = dir;

	this.getId = function() { return id; };
	this.toJSON = function() {
		var res = {};
		res.i = id;
		res.x = this.x;
		res.y = this.y;
		res.d = this.direction;
		return res;
	};
}

io.sockets.on('connection', function (socket) {
	console.log('client connected');
	var player = null;

	socket.on(TYPE.SPAWN_REQUEST, function() {
		player = new Player(32, 64, DIRECTION.DOWN);
		var json = player.toJSON();
		json.p = players;

		socket.emit(TYPE.SPAWN, json);
		socket.broadcast.emit(TYPE.NEW_PLAYER, player.toJSON());

		players.push(player);

		socket.on(TYPE.MOVE, function(data) {
			player.x = data.x;
			player.y = data.y;
			player.direction = data.d;
			console.log(data.d);
		});

		setInterval(function() {
			socket.broadcast.emit(TYPE.PLAYER_UPDATED, player.toJSON());
		}, 50);
	});

	socket.on('disconnect', function() {
		socket.broadcast.emit(TYPE.PLAYER_DISCONNECTED, player.getId());

		if(players !== null) {
			players.splice(players.indexOf(player), 1);
		}
	});
});