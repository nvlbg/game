(function() {

	/**
	assets to be loaded
	*/
	window.game.resources = [
		{ name : "sprites",    type : "image", src : "data/sprites/sprites.png"   },
		{ name : "tanks",      type : "image", src : "data/sprites/tanks.png"     },
		{ name : "star",       type : "image", src : "data/sprites/star.png"      },
		{ name : "bullet",     type : "image", src : "data/sprites/bullet.png"    },
		{ name : "metatiles",  type : "image", src : "data/sprites/metatiles.png" },

		{ name : "water_hole", type : "tmx",   src : "data/maps/water_hole.tmx"   },
		{ name : "maze",       type : "tmx",   src : "data/maps/maze.tmx"         }
	];

	/*
	// TODO: find another way to load JSON file
	var tanks_data = new XMLHttpRequest();
	tanks_data.onreadystatechange=function() {
		if (tanks_data.readyState === 4) {
			if (tanks_data.status === 200) {
				window.game.tanks = JSON.parse(tanks_data.responseText);
			}
		}
	};

	tanks_data.open("GET", "data/sprites/tanks.json", true);
	tanks_data.send(null);
	*/

	/*
	me.Vector2d.prototype.draw = function(ctx) {
		ctx.save();

		ctx.fillStyle = 'red';
		ctx.fillRect(this.x-2, this.y-2, 4, 4);

		ctx.restore();
	};

	me.plugin.patch(debugPanel, 'draw', function(ctx) {
		this.parent(ctx);
		me.input.mouse.pos.draw(ctx);
		
		var playerPos = window.game.player.pos;
		var viewportOffset = me.game.viewport.pos;

		var pos = new me.Vector2d(playerPos.x - viewportOffset.x + 16, playerPos.y - viewportOffset.y + 16);
		pos.draw(ctx);
	});
	*/

	/**
	called when document is loaded
	*/
	window.game.onLoad = function() {
		// init the video
		if (!me.video.init('jsapp', 800, 600, true, 1.0)) {
			window.alert("Sorry but your browser does not support html 5 canvas.");
			return;
		}
		
		// initialize the "audio"
		me.audio.init("mp3,ogg");
		
		// set all resources to be loaded
		me.loader.onload = this.loaded.bind(this);
		me.loader.preload(this.resources);

		// load everything & display a loading screen
		me.state.change(me.state.LOADING);
	};

	/**
	callback when everything is loaded
	*/
	window.game.loaded = function() {
		// set game screens
		me.state.set(me.state.LOADING, new game.LoadingScreen());
		me.state.set(me.state.MENU, new game.MenuScreen());
		me.state.set(me.state.PLAY, new game.PlayScreen());

		// add objects for better Garbage Collection
		me.entityPool.add("Bullet", game.Bullet, true);
		me.entityPool.add("Bonus", game.Bonus, true);
		me.entityPool.add("Friend", game.Friend, true);
		me.entityPool.add("Enemy", game.Enemy, true);
		me.entityPool.add("Player", game.Player);

		// bind key events
		me.input.bindKey(me.input.KEY.UP,    "up"   );
		me.input.bindKey(me.input.KEY.RIGHT, "right");
		me.input.bindKey(me.input.KEY.DOWN,  "down" );
		me.input.bindKey(me.input.KEY.LEFT,  "left" );
		me.input.bindKey(me.input.KEY.SPACE, "shoot");
		me.input.bindMouse(me.input.mouse.LEFT, me.input.KEY.SPACE);

		// bind key events
		/*
		me.input.bindKey(me.input.KEY.W,    "eup"   );
		me.input.bindKey(me.input.KEY.D,    "eright");
		me.input.bindKey(me.input.KEY.S,    "edown" );
		me.input.bindKey(me.input.KEY.A,    "eleft" );
		me.input.bindKey(me.input.KEY.CTRL, "eshoot");
		*/

		// start the game 
		me.state.change(me.state.PLAY);
	};

	window.onReady(function() {
		game.onLoad();
	});

})();