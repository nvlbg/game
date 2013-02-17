(function() {

	window.game.Network = Object.extend({
		// members
		socket  : null,
		player  : null,
		players : null,

		_dt : null,
		_dte : null,

		net_latency: 0.001,
		net_offset: 100,
		net_ping_update_step: 2500,
		last_ping_time: 0.001,
		last_server_time: 0.01,
		client_time: 0.01,
		server_time: 0.01,

		// constructor
		init : function() {
			// set players into an empty dict
			this.players = {};

			// establish websocket connection
			this.socket = io.connect();

			// bind socket events
			this.socket.on(game.ENUM.TYPE.SPAWN, this.onSpawn.bind(this));
			this.socket.on(game.ENUM.TYPE.NEW_PLAYER, this.onNewPlayer.bind(this));
			this.socket.on(game.ENUM.TYPE.CORRECTION, this.onCorrection.bind(this));
			this.socket.on(game.ENUM.TYPE.PLAYER_DIED, this.onPlayerDeath.bind(this));
			this.socket.on(game.ENUM.TYPE.PLAYER_RESPAWNED, this.onPlayerRespawn.bind(this));
			this.socket.on(game.ENUM.TYPE.PLAYER_DISCONNECTED, this.onPlayerLeave.bind(this));
			this.socket.on(game.ENUM.TYPE.SMARTPHONE_REQUEST, this.onSmartphoneRequest.bind(this));
			this.socket.on(game.ENUM.TYPE.PING, this.onPing.bind(this));

			this.socket.emit(game.ENUM.TYPE.SPAWN_REQUEST);
		},

		// methods
		createTimer : function() {
			setInterval(function() {
				this._dt = new Date().getTime() - this._dte;
				this._dte = new Date().getTime();
				this.server_time += this._dt/1000.0;
				this.client_time = this.server_time - (this.net_offset/1000);
			}.bind(this), 4);
		},

		createPingTimer: function() {
			this.last_ping_time = new Date().getTime();
			this.socket.emit(game.ENUM.TYPE.PING_REQUEST, this.last_ping_time);
		},

		// event handlers
		onPing: function(clientTime) {
			var now = new Date().getTime();
		
			// latency is how long message took to get to server
			var latency = (now-clientTime)/2;
			
			if (this.net_latency !== Number.MAX_VALUE) {
				this.net_latency = (this.net_latency + latency) / 2;
			} else {
				this.net_latency = latency;
			}

			setTimeout(this.createPingTimer.bind(this), this.net_ping_update_step);
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

			this.player = new game.Player(data.x, data.y, data.d, 0, 3, 0, 500, this.socket);
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

			this.server_time = this.last_server_time = data.z;
			this.createPingTimer();
			this.createTimer();
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

		onCorrection : function(data) {
			this.client_time = this.server_time - (this.net_offset/1000);

			var i, player;
			for (i in data) {
				player = this.players[i];
				if (i === 't' || player === undefined) {
					continue;
				}

				if (player === this.player && !player.smarthphoneConnected) {
					//TODO: maybe client side prediction should happen (or be called) here
					//so there won't be check for correction every frame
					if (!data[i].x) {
						data[i].x = player.pos.x;
					}

					if(!data[i].y) {
						data[i].y = player.pos.y;
					}

					player.correction = data[i];
				} else {
					data[i].t = data.t;

					var middleDataNeeded = data[i].d && data[i].x && data[i].y;
					
					var lastData;
					if (player.updates.length > 0) {
						lastData = player.updates[player.updates.length - 1];
					} else {
						lastData = {
							x: player.pos.x,
							y: player.pos.y,
							d: player.direction
						};
					}

					if (data[i].x === undefined) {
						data[i].x = lastData.x;
					}

					if (data[i].y === undefined) {
						data[i].y = lastData.y;
					}

					if (data[i].d === undefined) {
						data[i].d = lastData.d;
					}

					if (middleDataNeeded) {
						var middleUpdate = {
							d: lastData.d
						};

						var dx = Math.abs(data[i].x - lastData.x);
						var dy = Math.abs(data[i].y - lastData.y);

						if (lastData.d === game.ENUM.DIRECTION.UP ||
							lastData.d === game.ENUM.DIRECTION.DOWN) {
							middleUpdate.x = lastData.x;
							middleUpdate.y = data[i].y;
							middleUpdate.t = (dy/(dx+dy))*
											(this.server_time-this.last_server_time)+
											this.last_server_time;
						} else if (lastData.d === game.ENUM.DIRECTION.LEFT ||
									lastData.d === game.ENUM.DIRECTION.RIGHT) {
							middleUpdate.x = data[i].x;
							middleUpdate.y = lastData.y;
							middleUpdate.t = (dx/(dx+dy))*
											(this.server_time-this.last_server_time)+
											this.last_server_time;
						}

						if (player.updates.length > 0) {
							player.updates[ player.updates.length - 1 ] = middleUpdate;
						} else {
							player.updates.push(middleUpdate);
						}
					}

					player.updates.push(data[i]);

					var bullet, dir, bulletObj;
					for (var j = 0, len = data[i].b.length; i < len; i++) {
						bullet = data[i].b[j];
						dir = new me.Vector2d(bullet.z, bullet.c);

						bulletObj = me.entityPool.newInstanceOf('Bullet',
														bullet.x,
														bullet.y,
														dir, 1, this.players[i].GUID, this.players[i].team);

						me.game.add(bulletObj, 5);
						me.game.sort();
					}
				}
			}

			this.last_server_time = this.server_time = data.t;
		},

		onPlayerDeath: function(id) {
			this.players[id].explode();
		},

		onPlayerRespawn: function(data) {
			this.players[data.i].pos.x = data.x;
			this.players[data.i].pos.y = data.y;
			this.players[data.i].respawn();
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