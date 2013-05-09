(function() {

	if(!Array.isArray) {
		Array.isArray = function (vArg) {
			return Object.prototype.toString.call(vArg) === "[object Array]";
		};
	}

	/**
	assets to be loaded
	*/
	window.game.resources = [
		{ name : "bonuses",      type : "image", src : "data/sprites/bonuses.png"     },
		{ name : "tanks",        type : "image", src : "data/sprites/tanks.png"       },
		{ name : "metatiles",    type : "image", src : "data/sprites/metatiles.png"   },

		{ name : "tile_pack_1",  type : "image", src : "data/sprites/tile_pack_1.png" },
		{ name : "tile_pack_2",  type : "image", src : "data/sprites/tile_pack_2.png" },

		{ name : "map",          type : "tmx",   src : "data/maps/map.json"           },

		// audio and SFX
		//{ name: "background",    type : "audio", src : "data/audio/",     channel : 1, stream : true },
		//{ name: "powerup",       type : "audio", src : "data/audio/",     channel : 2 }
	];

	/*
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
		if (!me.video.init('jsapp', 800, 600, window.game.config.doubleBuffering, 1.0)) {
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

		// load fonts
		window.game.font = new me.Font('LCD_Solid', 12, 'white');
		window.game.font.textAlign = 'center';

		// start the game 
		me.state.change(me.state.PLAY);
	};

	$.getJSON('shared/constants.json', function(enumeration) {
		window.game.ENUM = enumeration;
		window.game.network = new game.Network();

		window.onReady(function() {
			// contains all login/register forms
			var panel = $('#login');
			
			// guest login button
			var guest_btn = $('#guest');

			// login elems
			var login_form = $('#registered_login');
			var username = $('#username');
			var password = $('#password');

			// register elems
			var register_form = $('#register');
			var register_username = $('#register_username');
			var register_password = $('#register_password');
			var register_re_password = $('#register_re_password');

			// tabs
			var login_tab = $('#logintab');
			var register_tab = $('#registertab');

			window.game.network.socket.on(window.game.ENUM.TYPE.GUEST_LOGIN_ANSWER, function(success) {
				if (success === window.game.ENUM.LOGIN.SUCCESS) {

					panel.remove();
					window.game.onLoad();

				} else {
					apprise('Error occured', {animate:true});
					$('input').blur();
				}
			});

			window.game.network.socket.on(window.game.ENUM.TYPE.LOGIN_ANSWER, function(success) {
				if (success === window.game.ENUM.LOGIN.SUCCESS) {

					panel.remove();
					window.game.onLoad();
					return;

				} else if (success === window.game.ENUM.LOGIN.FAIL) {
					apprise('Wrong username or password', {animate:true});
				} else if (success === window.game.ENUM.LOGIN.USER_NOT_FOUND) {
					apprise('User does not exist', {animate:true});
				} else if (success === window.game.ENUM.LOGIN.USER_PLAYING) {
					apprise('User is logged in and playing', {animate:true});
				} else if (success === window.game.ENUM.LOGIN.UNDEFINED) {
					apprise('Error occured', {animate:true});
				}

				$('input').blur();
			});

			window.game.network.socket.on(window.game.ENUM.TYPE.REGISTER_ANSWER, function(success) {
				if (success === window.game.ENUM.LOGIN.SUCCESS) {

					apprise('You are registered successfully');
					$('#register input').val('');
					login_tab.click();

					return;
				} else if (success === window.game.ENUM.LOGIN.USER_EXISTS) {
					apprise('Username is already taken', {animate:true});
				} else if (success === window.game.ENUM.LOGIN.UNDEFINED) {
					apprise('Error occured', {animate:true});
				}

				$('input').blur();
			});

			login_form.submit(function(e) {
				e.preventDefault();

				var nickname = $.trim( username.val() );
				var pass     = $.trim( password.val() );

				if (nickname.length < 4 || nickname.length > 16 || pass.length < 6) {
					return;
				}

				if (!/[a-zA-Z0-9_]{4,16}/.test(nickname)) {
					apprise('Username has unallowed characters. Allowed characters are a-z, A-Z, 0-9 and _', {animate:true});
					return;
				}

				var packet_data = {
					username: nickname,
					password: pass
				};
				window.game.network.socket.emit(window.game.ENUM.TYPE.LOGIN, packet_data);
			});

			register_form.submit(function(e) {
				e.preventDefault();

				var nickname = $.trim( register_username.val() );
				var pass     = $.trim( register_password.val() );
				var re_pass  = $.trim( register_re_password.val() );

				if (nickname.length < 4 || nickname.length > 16 || pass < 6 || re_pass < 6) {
					return;
				}

				if (!/[a-zA-Z0-9_]{4,16}/.test(nickname)) {
					apprise('Username has unallowed characters. Allowed characters are a-z, A-Z, 0-9 and _', {animate:true});
					return;
				}

				if (pass !== re_pass) {
					apprise('Passwords do not match', {animate:true});
					return;
				}

				var packet_data = {
					username: nickname,
					password: pass
				};
				window.game.network.socket.emit(window.game.ENUM.TYPE.REGISTER, packet_data);
			});

			guest_btn.click(function(e) {
				e.preventDefault();

				window.game.network.socket.emit(window.game.ENUM.TYPE.GUEST_LOGIN);
			});

			// tabs functionality
			$('#logintab, #registertab').click(function(e) {
				e.preventDefault();
				
				if ( this.id === 'registertab' ) {
					login_tab.removeClass('login_selected');
					register_tab.addClass('register_selected');

					login_form.hide();
					register_form.fadeIn();
				} else if (this.id === 'logintab') {
					login_tab.addClass('login_selected');
					register_tab.removeClass('register_selected');

					register_form.hide();
					login_form.fadeIn();
				}
			});

			guest_btn.click();
		});
	});

})();
