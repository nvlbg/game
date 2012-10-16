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
		PLAYER_DISCONNECTED : 5
	};
	var players = [];
	var player = null;
	var DIRECTION = {
		UP : 0,
		DOWN : 1,
		LEFT : 2,
		RIGHT : 3
	};

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

			// me.Tileset.type.WATER = "water";

			// set custom constants for the game
			me.game.BULLET_OBJECT = 4;
			me.game.FRIEND_OBJECT = 5;

			me.state.set(me.state.LOADING, new LoadingScreen());
			me.state.set(me.state.MENU, new MenuScreen());
			me.state.set(me.state.PLAY, new PlayScreen());

			me.sys.pauseOnBlur = false;
			me.sys.useNativeAnimFrame = true;

			// load everything & display a loading screen
			me.state.change(me.state.LOADING);

			me.state.onPause = function() {};
			me.state.onResume = function() {};
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
				player = new Player(data.x, data.y, data.d, 0, 3, 0.2);
				me.game.add(player, 4);

				var other;
				for(var i = 0, len = data.p.length; i < len; i++) {
					other = new Enemy(data.p[i].x, data.p[i].y, data.p[i].d, 0, 3, 0.2);
					other.id = data.p[i].i; // TODO: fix by passing this to the constructor 
					me.game.add(other, 4);
					players.push(other);
				}

				me.game.sort();
			});
			socket.on(TYPE.NEW_PLAYER, function(data) {
				var p = new Enemy(data.x, data.y, data.d, 0, 3, 0.2);
				p.id = data.i;
				players.push(p);
				me.game.add(p, 4);
				me.game.sort();
			});
			socket.on(TYPE.PLAYER_UPDATED, function(data) {
				for(var i = 0, len = players.length; i < len; i++) {
					if(players[i].id === data.i) {
						players[i].pos.x = data.x;
						players[i].pos.y = data.y;
						players[i].direction = data.d;
						break;
					}
				}
			});
			socket.emit(TYPE.SPAWN_REQUEST);

			setInterval(function() {
				var data = {};
				data.x = player.pos.x;
				data.y = player.pos.y;
				data.d = player.direction;
				socket.emit(TYPE.MOVE, data);
			}, 50);
		}
	};

	window.onReady(function() {
		jsApp.onload();
		socket = io.connect('http://92.62.251.95:8080/');
	});
// })();