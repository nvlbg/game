(function() {

	window.game.Network = Object.extend({
		// members
		socket  : null,
		player  : null,
		players : null,

		net_latency: 0.001,
		net_offset: 100,
		net_ping_update_step: 1000,
		buffer_size: 2,
		client_smooth: 25,
		last_ping_time: 0.001,
		client_time: 0.01,
		server_time: 0.01,
		server_updates: [],

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
			this.socket.on(game.ENUM.TYPE.PING, this.onPing.bind(this));

			this.socket.emit(game.ENUM.TYPE.SPAWN_REQUEST);
		},


		// methods/events
		createPingTimer: function() {
			setInterval(function() {
				this.last_ping_time = new Date().getTime();
				this.socket.emit(game.ENUM.TYPE.PING, this.last_ping_time);
			}.bind(this), this.net_ping_update_step);
		},

		onPing: function(clientTime) {
			var now = new Date().getTime();
		
			// round trip time in seconds
			var roundTripSeconds = now-clientTime;
		
			// latency is how long message took to get to server
			var latency = roundTripSeconds/2;
		
			// store averages
			// TODO: maybe I could use better approach for finding latency
			if ( this.net_latency !== Number.MAX_VALUE ) {
				this.net_latency = ( this.net_latency+latency ) / 2;
			} else {
				this.net_latency = latency;
			}
		},

		onSmartphoneRequest : function() {
			var confirmRequest = window.confirm("Are you trying to connect with your smarthphone?");
			this.socket.emit(game.ENUM.TYPE.SMARTPHONE_ACCEPT, confirmRequest);

			if ( confirmRequest ) {
				this.player.smarthphoneConnected = true;
			}
		},

		onSpawn : function(data) {
			me.levelDirector.loadLevel(data.l);
			me.game.collisionMap.tileset.type.WATER = 'water';
			
			me.gamestat.add("team", data.t);
			me.gamestat.add("friendly_fire", data.f);

			this.player = new game.Player(data.x, data.y, data.d, 0, 3, 0, 250, this.socket);
			this.players[data.i] = this.player;
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

			me.game.add(p, 4);
			this.players[data.i] = p;
			me.game.sort();
		},

		onPlayerUpdate : function(data) {
			console.log(data);
			if (data.i === undefined) {
				this.player.pos.x = data.x;
				this.player.pos.y = data.y;
				this.player.pressed = data.p;
				return;
			}
			this.players[data.i].pressed = data.p;
			
			var delta = new me.Vector2d(data.x, data.y);
			delta.sub(this.players[data.i].pos);
			this.players[data.i].delta = delta;
		},

		onCorrection : function(data) {
			this.server_time = data.t;
			this.client_time = this.server_time - (this.net_offset/1000);
			this.server_updates.push(data);

			if(this.server_updates.length >= ( 60*this.buffer_size )) {
				this.server_updates.splice(0,1);
			}

			console.log(data);
			for (var i in data) {
				if (i === 't') {
					continue;
				}

				if (this.players[i] === this.player) {
					//TODO: maybe client side prediction should happen (or be called) here
					//so there won't be check for correction every frame
					this.player.correction = data[i];
				} else {
					//data[i].t = data.t;
					//this.players[i].updates.push(data[i]);
					
					var x = data[i].x - this.players[i].pos.x;
					var y = data[i].y - this.players[i].pos.y;

					if (Math.abs(x) > Math.abs(y)) {
						if (x < 0) {
							this.players[i].setDirection(game.ENUM.DIRECTION.LEFT);
						} else {
							this.players[i].setDirection(game.ENUM.DIRECTION.RIGHT);
						}
					} else {
						if (y < 0) {
							this.players[i].setDirection(game.ENUM.DIRECTION.UP);
						} else {
							this.players[i].setDirection(game.ENUM.DIRECTION.DOWN);
						}
					}

					this.players[i].pos.x = data[i].x;
					this.players[i].pos.y = data[i].y;
				}
			}
		},

		onPlayerCorrection : function(data) {
			// this.players[data.i].pos.x = data.x;
			// this.players[data.i].pos.y = data.y;
			// this.players[data.i].interpolations.push(new me.Vector2d(data.x, data.y));
		},

		onPlayerLeave : function(id) {
			if(this.players[id]) {
				me.game.remove(this.players[id]);
			} else {
				console.log('Error: no such player [' + id + ']');
			}
		}

	});

})();