// network enumeration
var Network = {
	TYPE : {
		SPAWN_REQUEST : 0,
		SPAWN : 1,
		NEW_PLAYER : 2,
		MOVE : 3,
		PLAYER_UPDATED : 4,
		CORRECTION : 5,
		PLAYER_CORRECTION : 6,
		PLAYER_DISCONNECTED : 7
	},

	DIRECTION : {
		UP : 0,
		DOWN : 1,
		LEFT : 2,
		RIGHT : 3
	},

	PRESSED : {
		UP : 1 << 0,
		DOWN : 1 << 1,
		LEFT : 1 << 2,
		RIGHT : 1 << 3
	}
};

var Networking = Object.extend({
	// members
	socket  : null,
	player  : null,
	players : null,

	// constructor
	init : function() {
		// set players into an empty dict
		this.players = {};

		// establish websocket connection
		this.socket = io.connect();

		// bind socket events
		this.socket.on(Network.TYPE.SPAWN, this.bind(this.onSpawn));
		this.socket.on(Network.TYPE.NEW_PLAYER, this.bind(this.onNewPlayer));
		this.socket.on(Network.TYPE.PLAYER_UPDATED, this.bind(this.onPlayerUpdate));
		this.socket.on(Network.TYPE.CORRECTION, this.bind(this.onCorrection));
		this.socket.on(Network.TYPE.PLAYER_CORRECTION, this.bind(this.onPlayerCorrection));
		this.socket.on(Network.TYPE.PLAYER_DISCONNECTED, this.bind(this.onPlayerLeave));

		this.socket.emit(Network.TYPE.SPAWN_REQUEST);
	},

	bind : function(callback) {
		var that = this;
		return (function(data) {
			callback(that, data);
		});
	},

	// methods/events
	onSpawn : function(that, data) {
		// TODO: make this vars coming from the server
		me.gamestat.add("team", "blue");
		me.gamestat.add("friendly_fire", false);

		// player = new Player(data.x, data.y, data.d, 0, 3, 0.2);
		that.player = new Player(data.x, data.y, data.d, 0, 3, 0, 250, that.socket);
		me.game.add(that.player, 4);

		var other;
		for(var i = 0, len = data.p.length; i < len; i++) {
			other = new Enemy(data.p[i].x, data.p[i].y, data.p[i].d, 0, 3, 0);
			me.game.add(other, 4);
			that.players[data.p[i].i] = other;
		}

		me.game.sort();
	},

	onNewPlayer : function(that, data) {
		var p = new Enemy(data.x, data.y, data.d, 0, 3, 0);
		p.pressed = data.p;
		me.game.add(p, 4);
		that.players[data.i] = p;
		me.game.sort();
	},

	onPlayerUpdate : function(that, data) {
		that.players[data.i].pos.x = data.x;
		that.players[data.i].pos.y = data.y;
		that.players[data.i].pressed = data.p;

		console.log(data.p);
	},

	onCorrection : function(that, data) {
		that.player.pos.x = data.x;
		that.player.pos.y = data.y;
	},

	onPlayerCorrection : function(that, data) {
		that.players[data.i].pos.x = data.x;
		that.players[data.i].pos.y = data.y;
	},

	onPlayerLeave : function(that, id) {
		if(that.players[id]) {
			me.game.remove(that.players[id]);
			delete that.players[id];
		} else {
			console.log('Error: no such player [' + id + ']');
		}
	}

});