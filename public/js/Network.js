(function() {

	window.game.Network = Object.extend({
		// members
		socket  : null,
		player  : null,
		players : null,
		bonuses : null,

		_dt : null,
		_dte : null,

		net_latency: 0.001,
		net_offset: 100,
		net_ping_update_step: 2500,
		fake_latency: 0,
		last_ping_time: 0.001,
		last_server_time: 0.01,
		client_time: 0.01,
		server_time: 0.01,

		INVULNERABLE_TIME_STEP: 0,

		// constructor
		init : function() {
			// set players and bonuses into an empty dict
			this.players = {};
			this.bonuses = {};

			// establish websocket connection
			this.socket = io.connect();

			// bind socket events
			this.socket.on(game.ENUM.TYPE.SPAWN, this.onSpawn.bind(this));
			this.socket.on(game.ENUM.TYPE.NEW_PLAYER, this.onNewPlayer.bind(this));
			this.socket.on(game.ENUM.TYPE.CORRECTION, this.onCorrection.bind(this));
			this.socket.on(game.ENUM.TYPE.PLAYER_DISCONNECTED, this.onPlayerLeave.bind(this));
			this.socket.on(game.ENUM.TYPE.SMARTPHONE_REQUEST, this.onSmartphoneRequest.bind(this));
			this.socket.on(game.ENUM.TYPE.PING, this.onPing.bind(this));

			// init chat stuff
			window.game.AchievementManager.init(this.socket);
		},

		// methods
		start: function() {
			this.socket.emit(game.ENUM.TYPE.SPAWN_REQUEST);
		},
		
		createTimer : function() {
			setInterval(function() {
				this._dt = new Date().getTime() - this._dte;
				this._dte = new Date().getTime();
				this.server_time += this._dt/1000.0;
				this.client_time = this.server_time - (this.net_offset/1000);
			}.bind(this), 4);
		},

		createPingTimer: function() {
			this.last_ping_time = new Date().getTime() - this.fake_latency;
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
			apprise('Are you trying to connect with your smarthphone?', {'verify':true}, function(answer) {
				this.socket.emit(game.ENUM.TYPE.SMARTPHONE_AUTH, answer);

				if ( answer === true ) {
					this.player.smarthphoneConnected = true;

					var toggleInput = $('#toggleInput');

					toggleInput.bind('click', function(e) {
						e.preventDefault();

						this.player.smarthphoneConnected = !this.player.smarthphoneConnected;
						this.socket.emit(game.ENUM.TYPE.SET_INPUT,
										 this.player.smarthphoneConnected ? 
										 game.ENUM.INPUT_TYPE.SMARTPHONE_CONTROLLER :
										 game.ENUM.INPUT_TYPE.KEYBOARD_AND_MOUSE);
					}.bind(this)).show();

					this.socket.on(game.ENUM.TYPE.SMARTPHONE_DISCONNECTED, function() {
						toggleInput.unbind('click').hide();
						this.player.smarthphoneConnected = false;
					}.bind(this));
				}
			}.bind(this));

		},

		onSpawn : function(data) {
			me.levelDirector.loadLevel(data.l);
			me.game.collisionMap.tileset.type.WATER = 'water';
			
			me.gamestat.add("team", data.t);
			me.gamestat.add("friendly_fire", data.f);

			this.INVULNERABLE_TIME_STEP = data.q;

			this.player = new game.Player(data.x, data.y, data.d, 3, 0, data.n, 500, this.socket);
			this.player.makeInvulnerable();
			this.players[data.i] = this.player;
			me.game.add(this.player, 4);

			var other;
			for(var i = 0, len = data.p.length; i < len; i++) {
				if (data.p[i].t === data.t) {
					other = me.entityPool.newInstanceOf('Friend', data.p[i].x, data.p[i].y, data.p[i].d, 3, 0, data.p[i].n);
				} else {
					other = me.entityPool.newInstanceOf('Enemy', data.p[i].x, data.p[i].y, data.p[i].d, 3, 0, data.p[i].n);
				}
				other.pressed = data.p[i].p;
				me.game.add(other, 4);
				this.players[data.p[i].i] = other;
			}

			me.game.sort();

			this.server_time = this.last_server_time = data.z;
			this.createPingTimer();
			this.createTimer();
			window.game.Chat.init();
		},

		onNewPlayer : function(data) {
			var p;
			if (data.t === me.gamestat.getItemValue("team")) {
				p = me.entityPool.newInstanceOf('Friend', data.x, data.y, data.d, 3, 0, data.n);
			} else {
				p = me.entityPool.newInstanceOf('Enemy', data.x, data.y, data.d, 3, 0, data.n);
			}

			this.players[data.i] = p;
			p.makeInvulnerable();
			
			me.game.add(p, 4);
			me.game.sort();
		},

		onCorrection : function(data) {
			this.client_time = this.server_time - (this.net_offset/1000);

			var i, player;
			for (i in data) {
				player = this.players[i];
				if (i === 't' || i === 'b' || player === undefined) {
					continue;
				}

				if (player === this.player && !player.smarthphoneConnected) {
					if (data[i].g !== undefined && data[i].g === true) {
						//TODO: play a sound or something
						console.log('a bonus has been gained');
					}

					player.correction = data[i];
					player.applyClientSideAdjustment();
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

					if (data[i].a === true) {
						player.alive = true;
					}

					player.updates.push(data[i]);
				}
			}

			// handle bonuses
			if (data.b !== undefined) {
				var idx, bonus;
				for (idx in data.b) {
					bonus = data.b[idx];

					if (bonus.v) { // is bonus valid?
						// add this bonus
						this.bonuses[idx] = me.entityPool.newInstanceOf('Bonus', bonus.x, bonus.y, bonus.t);
						me.game.add(this.bonuses[idx], 3);
						me.game.sort();
					} else {
						// remove this bonus
						if (this.bonuses[idx] !== undefined) {
							me.game.remove(this.bonuses[idx]);
							me.game.sort();
						}
					}
				}
			}

			this.last_server_time = this.server_time = data.t;
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
