var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server),

	PORT = require('./server/constants.js').PORT,
	TYPE = require('./server/constants.js').TYPE;

Game = require('./server/Game.js');
Game.init();

app.get('*', function(req, res) {
	res.sendfile(__dirname + '/public/' + req.params[0]);
});

io.configure(function () {
	io.set('log level', 0);

	io.set('authorization', function (handshakeData, callback) {
		callback(null, true); // error first callback style
	});
});

server.listen(PORT);
console.log('Server started at 127.0.0.1:' + PORT);

io.sockets.on('connection', function (socket) {
	socket.on(TYPE.SPAWN_REQUEST, function() {
		Game.addNewPlayer(socket);
	});
});