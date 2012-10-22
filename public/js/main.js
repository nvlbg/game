// (function() {
	var resources = [
		{ name : "sprites",    type : "image", src : "data/sprites/sprites.png" },
		{ name : "tanks",      type : "image", src : "data/sprites/tanks.png" },
		{ name : "star",       type : "image", src : "data/sprites/star.png" },
		{ name : "bullet",     type : "image", src : "data/sprites/bullet.png" },
		// I think the followint line is unnecessary
		// { name : "metatiles",  type : "image", src : "data/sprites/metatiles.png" },
		{ name : "water_hole", type : "tmx",   src : "data/maps/water_hole.tmx" }
	];

	var TYPE = {
		SPAWN_REQUEST : 0,
		SPAWN : 1,
		NEW_PLAYER : 2,
		MOVE : 3,
		PLAYER_UPDATED : 4,
		CORRECTION : 5,
		PLAYER_CORRECTION : 6,
		PLAYER_DISCONNECTED : 7
	};
	var DIRECTION = {
		UP : 0,
		DOWN : 1,
		LEFT : 2,
		RIGHT : 3
	};
	var players = {};
	var player = null;
	var socket = null;

	var jsApp = {
		/**
		called when document is loaded
		*/
		onload : function() {
			// init the video
			if (!me.video.init('jsapp', 800, 600, false, 1.0)) {
				alert("Sorry but your browser does not support html 5 canvas.");
				return;
			}
			
			// initialize the "audio"
			me.audio.init("mp3,ogg");
			
			// set all resources to be loaded
			me.loader.onload = this.loaded.bind(this);
			
			// set all resources to be loaded
			me.loader.preload(resources);

			me.gamestat.add("team", "blue"); // your team (green or blue)
			me.gamestat.add("friendly_fire", false);

			// set custom constants for the game
			me.game.BULLET_OBJECT = 4;
			me.game.FRIEND_OBJECT = 5;

			me.state.set(me.state.LOADING, new LoadingScreen());
			me.state.set(me.state.MENU, new MenuScreen());
			me.state.set(me.state.PLAY, new PlayScreen());

			me.sys.pauseOnBlur = false;
			me.sys.useNativeAnimFrame = true;

			me.state.onPause = function() {};
			me.state.onResume = function() {};

			// load everything & display a loading screen
			me.state.change(me.state.LOADING);
		},

		/**
		callback when everything is loaded
		*/
		loaded : function() {
			me.entityPool.add("mainPlayer", Player);

			me.input.bindKey(me.input.KEY.UP,    "up"         );
			me.input.bindKey(me.input.KEY.RIGHT, "right"      );
			me.input.bindKey(me.input.KEY.DOWN,  "down"       );
			me.input.bindKey(me.input.KEY.LEFT,  "left"       );
			me.input.bindKey(me.input.KEY.SPACE, "shoot", true);

			// start the game 
			me.state.change(me.state.PLAY);


			socket.on(TYPE.SPAWN, function(data) {
				// player = new Player(data.x, data.y, data.d, 0, 3, 0.2);
				player = new Player(data.x, data.y, data.d, 0, 3, 0);
				me.game.add(player, 4);

				var other;
				for(var i = 0, len = data.p.length; i < len; i++) {
					other = new Enemy(data.p[i].x, data.p[i].y, data.p[i].d, 0, 3, 0);
					me.game.add(other, 4);
					players[data.p[i].i] = other;
				}

				me.game.sort();
			});
			socket.on(TYPE.NEW_PLAYER, function(data) {
				var p = new Enemy(data.x, data.y, data.d, 0, 3, 0);
				p.pressed = data.p;
				me.game.add(p, 4);
				players[data.i] = p;
				me.game.sort();
			});
			socket.on(TYPE.PLAYER_UPDATED, function(data) {
				players[data.i].pos.x = data.x;
				players[data.i].pos.y = data.y;
				players[data.i].pressed = data.p;
				players[data.i].direction = data.d;
			});
			socket.on(TYPE.CORRECTION, function(data) {
				player.pos.x = data.x;
				player.pos.y = data.y;
				player.direction = data.d;
			});
			socket.on(TYPE.PLAYER_CORRECTION, function(data) {
				players[data.i].pos.x = data.x;
				players[data.i].pos.y = data.y;
				players[data.i].direction = data.d;
			});
			socket.on(TYPE.PLAYER_DISCONNECTED, function(id) {
				if(players[id]) {
					me.game.remove(players[id]);
					delete players[id];
				} else {
					console.log('Error: no such player [' + id + ']');
				}
			});
			socket.emit(TYPE.SPAWN_REQUEST);
		}
	};

	window.onReady(function() {
		socket = io.connect();
		jsApp.onload();
	});
// })();