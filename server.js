var app = require('express').createServer().listen(8080),
	io = require('socket.io').listen(app);

app.get('*', function(req, res) {
	res.sendfile(__dirname + '/public/' + req.params[0]);
});

console.log('Server started at 127.0.0.1:8080');

io.sockets.on('connection', function (socket) {
	console.log('client connected');
	
	socket.on('spawnRequest', function() {
		socket.emit('spawn', { x:32, y:64 });
	});

	socket.on('move', function(newPos) {
		
	});

	socket.on('disconnect', function() {

	});
});