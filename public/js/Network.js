(function() {

	window.game.Network = Object.extend({
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
			this.socket.on(game.ENUM.TYPE.SPAWN, this.onSpawn.bind(this));
			this.socket.on(game.ENUM.TYPE.NEW_PLAYER, this.onNewPlayer.bind(this));
			this.socket.on(game.ENUM.TYPE.PLAYER_UPDATED, this.onPlayerUpdate.bind(this));
			this.socket.on(game.ENUM.TYPE.CORRECTION, this.onCorrection.bind(this));
			this.socket.on(game.ENUM.TYPE.PLAYER_CORRECTION, this.onPlayerCorrection.bind(this));
			this.socket.on(game.ENUM.TYPE.PLAYER_DISCONNECTED, this.onPlayerLeave.bind(this));
			this.socket.on(game.ENUM.TYPE.SMARTPHONE_REQUEST, this.onSmartphoneRequest.bind(this));

			this.socket.emit(game.ENUM.TYPE.SPAWN_REQUEST);
		},


		// methods/events
		onSmartphoneRequest : function() {
			this.socket.emit(
								game.ENUM.TYPE.SMARTPHONE_ACCEPT,
								window.confirm("Are you trying to connect with your smarthphone?")
							);
		},

		onSpawn : function(data) {
			me.gamestat.add("team", data.t);
			me.gamestat.add("friendly_fire", data.f);

			this.player = new game.Player(data.x, data.y, data.d, 0, 3, 0, 250, this.socket);
			me.game.add(this.player, 4);

			var other;
			for(var i = 0, len = data.p.length; i < len; i++) {
				if (data.p[i].t === data.t) {
					other = me.entityPool.newInstanceOf('Friend', data.p[i].x, data.p[i].y, data.p[i].d, 0, 3, 0);
				} else {
					other = me.entityPool.newInstanceOf('Enemy', data.p[i].x, data.p[i].y, data.p[i].d, 0, 3, 0);
				}
				other.pressed = data.p[i].p;
				me.game.add(other, 4);
				this.players[data.p[i].i] = other;
			}

			me.game.sort();
		},

		onNewPlayer : function(data) {
			var p;
			if (data.t === me.gamestat.getItemValue("team")) {
				p = me.entityPool.newInstanceOf('Friend', data.x, data.y, data.d, 0, 3, 0);
			} else {
				p = me.entityPool.newInstanceOf('Enemy', data.x, data.y, data.d, 0, 3, 0);
			}

			p.pressed = data.p;
			me.game.add(p, 4);
			this.players[data.i] = p;
			me.game.sort();
		},

		onPlayerUpdate : function(data) {
			console.log(data.p);
			if (!data.i) {
				this.player.pos.x = data.x;
				this.player.pos.y = data.y;
				this.player.pressed = data.p;
				return;
			}

			this.players[data.i].pos.x = data.x;
			this.players[data.i].pos.y = data.y;
			this.players[data.i].pressed = data.p;

		},

		onCorrection : function(data) {
			this.player.pos.x = data.x;
			this.player.pos.y = data.y;
		},

		onPlayerCorrection : function(data) {
			this.players[data.i].pos.x = data.x;
			this.players[data.i].pos.y = data.y;
		},

		onPlayerLeave : function(id) {
			if(this.players[id]) {
				me.entityPool.freeInstance(this.players[id]);
			} else {
				console.log('Error: no such player [' + id + ']');
			}
		}

	});

})();