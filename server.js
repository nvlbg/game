var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server),

	config = require('./server/config.js'),
	constants = require('./shared/constants.js');

global.Game = require('./server/Game.js');
global.Game.init();

// serve requests
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/public/index.html');
});

app.get('/favicon.ico', function(req, res) { console.log('favicon');
	res.writeHead(200, {'Content-Type': 'image/x-icon'} );
	res.end();
});

app.get('/shared/*', function(req, res) {
	res.sendfile(__dirname + '/shared/' + req.params[0]);
});

app.get('/smartphones/*', function(req, res) {
	console.log('smartphone trying to connect ... ');
	res.sendfile(__dirname + '/smartphones/' + req.params[0]);
});

app.get('*', function(req, res) {
	res.sendfile(__dirname + '/public/' + req.params[0]);
});


// configure web sockets
io.configure(function () {
	io.set('log level', 0);

	io.set('authorization', function (handshakeData, callback) {
		callback(null, true); // error first callback style
	});
});

server.listen(config.PORT);
console.log('Server started at 127.0.0.1:' + config.PORT);

io.sockets.on('connection', function (socket) {
	socket.on(constants.TYPE.SPAWN_REQUEST, function() {
		global.Game.addNewPlayer(socket);
	});

	socket.on(constants.TYPE.SMARTPHONE_CONNECT, function(playerID) {
		global.Game.authenticateSmathphone(socket, playerID);
	});
});