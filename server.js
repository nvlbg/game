var connect = require('connect'),
	http = require('http'),
	app = connect(),
	server = http.createServer(app),
	io = require('socket.io').listen(server),

	Users = require('./server/Users.js'),

	config = require('./server/config.json'),
	constants = require('./shared/constants.json');

global.DB = require('mongojs').connect(config.MONGO_CONNECTION_STRING, ['users']);

global.Game = require('./server/Game.js');
global.Game.init();

app.use('/shared', connect.static(__dirname + '/shared'));
app.use('/smartphones', connect.static(__dirname + '/smartphones'));
app.use(connect.static(__dirname + '/public'));

server.listen(config.PORT);
console.log('Server started at 127.0.0.1:' + config.PORT);

// configure web sockets
io.configure(function () {
	io.set('log level', 0);

	io.set('authorization', function (handshakeData, callback) {
		callback(null, true); // error first callback style
	});
});


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

	socket.on('debug_ping', function(data) {
		console.log(data !== undefined ? 'DEBUG: ' + data : 'DEBUG');
	});
});
