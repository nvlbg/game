(function() {

	// network enumeration
	window.game.Network = {
		TYPE : {
			SPAWN_REQUEST       : 0,
			SPAWN               : 1,
			NEW_PLAYER          : 2,
			MOVE                : 3,
			PLAYER_UPDATED      : 4,
			CORRECTION          : 5,
			PLAYER_CORRECTION   : 6,
			PLAYER_DISCONNECTED : 7
		},

		DIRECTION : {
			UP    : 0,
			DOWN  : 1,
			LEFT  : 2,
			RIGHT : 3
		},

		TEAM : {
			BLUE  : 0,
			GREEN : 1
		},

		PRESSED : {
			UP    : 1 << 0,
			DOWN  : 1 << 1,
			LEFT  : 1 << 2,
			RIGHT : 1 << 3
		}
	};

	window.game.Networking = Object.extend({
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
			this.socket.on(game.Network.TYPE.SPAWN, this.bind(this.onSpawn));
			this.socket.on(game.Network.TYPE.NEW_PLAYER, this.bind(this.onNewPlayer));
			this.socket.on(game.Network.TYPE.PLAYER_UPDATED, this.bind(this.onPlayerUpdate));
			this.socket.on(game.Network.TYPE.CORRECTION, this.bind(this.onCorrection));
			this.socket.on(game.Network.TYPE.PLAYER_CORRECTION, this.bind(this.onPlayerCorrection));
			this.socket.on(game.Network.TYPE.PLAYER_DISCONNECTED, this.bind(this.onPlayerLeave));

			this.socket.emit(game.Network.TYPE.SPAWN_REQUEST);
		},

		bind : function(callback) {
			var self = this;
			return (function(data) {
				callback(self, data);
			});
		},

		// methods/events
		onSpawn : function(self, data) {
			me.gamestat.add("team", data.t);
			me.gamestat.add("friendly_fire", data.f);

			self.player = new game.Player(data.x, data.y, data.d, 0, 3, 0, 250, self.socket);
			me.game.add(self.player, 4);

			var other;
			for(var i = 0, len = data.p.length; i < len; i++) {
				if (data.p[i].t === data.t) {
					other = new game.Friend(data.p[i].x, data.p[i].y, data.p[i].d, 0, 3, 0);
				} else {
					other = new game.Enemy(data.p[i].x, data.p[i].y, data.p[i].d, 0, 3, 0);
				}
				other.pressed = data.p[i].p;
				me.game.add(other, 4);
				self.players[data.p[i].i] = other;
			}

			me.game.sort();
		},

		onNewPlayer : function(self, data) {
			var p;
			if (data.t === me.gamestat.getItemValue("team")) {
				p = new game.Friend(data.x, data.y, data.d, 0, 3, 0);
			} else {
				p = new game.Enemy(data.x, data.y, data.d, 0, 3, 0);
			}

			p.pressed = data.p;
			me.game.add(p, 4);
			self.players[data.i] = p;
			me.game.sort();
		},

		onPlayerUpdate : function(self, data) {
			self.players[data.i].pos.x = data.x;
			self.players[data.i].pos.y = data.y;
			self.players[data.i].pressed = data.p;

			console.log(data.p);
		},

		onCorrection : function(self, data) {
			self.player.pos.x = data.x;
			self.player.pos.y = data.y;
		},

		onPlayerCorrection : function(self, data) {
			self.players[data.i].pos.x = data.x;
			self.players[data.i].pos.y = data.y;
		},

		onPlayerLeave : function(self, id) {
			if(self.players[id]) {
				me.game.remove(self.players[id]);
				delete self.players[id];
			} else {
				console.log('Error: no such player [' + id + ']');
			}
		}

	});

})();