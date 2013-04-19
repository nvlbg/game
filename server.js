var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server),

	Users = require('./server/Users.js'),

	config = require('./server/config.json'),
	constants = require('./shared/constants.js');

global.Game = require('./server/Game.js');
global.Game.init();

var ips = [];
app.use(function(req, res, next) {
	var ip_address = null;
	if(req.headers['x-forwarded-for']){
		ip_address = req.headers['x-forwarded-for'];
	}
	else {
		ip_address = req.connection.remoteAddress;
	}

	if (ips.indexOf(ip_address) === -1) {
		console.log('Client connected: ' + ip_address);
		ips.push(ip_address);
	}

	next();
});
app.use('/shared', express.static(__dirname + '/shared'));
app.use('/smartphones', express.static(__dirname + '/smartphones'));
app.use(express.static(__dirname + '/public'));

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
	// login dealing
	Users.bindEventListeners(socket);

	// player client connected
	socket.on(constants.TYPE.SPAWN_REQUEST, function() {
		global.Game.addNewPlayer(socket);
	});

	// smartphone client conneted
	socket.on(constants.TYPE.SMARTPHONE_CONNECT, function(player) {
		global.Game.authenticateSmathphone(socket, player);
	});
});
