
(function() {
	window.game = {};

	window.game.ENUM = ENUM;

	// configuring system variables
	me.sys.pauseOnBlur = false;
	me.sys.useNativeAnimFrame = true;
	me.sys.interpolation = true;
	me.sys.fps = 60;

	// add custom types
	me.game.BULLET_OBJECT = 4;
	me.game.FRIEND_OBJECT = 5;
})();
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
			this.socket.emit(game.ENUM.TYPE.SMARTPHONE_ACCEPT,
							 confirm("Are you trying to connect with your smarthphone?"));
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
(function() {

	window.game.LoadingScreen = me.ScreenObject.extend({
		init: function() {
			// pass true to the parent constructor
			// as we draw our progress bar in the draw function
			this.parent(true);

			// a font logo
			this.font = new me.Font('visitor1', 32, 'white');

			// flag to know if we need to refresh the display
			this.invalidate = false;

			// load progress in percent
			this.loadPercent = 0;

			// setup a callback
			me.loader.onProgress = this.onProgressUpdate.bind(this);
		},

		// will be fired by the loader each time a resource is loaded
		onProgressUpdate: function(progress) {
			this.loadPercent = progress;
			this.invalidate = true;
		},

		// make sure the screen is only refreshed on load progress
		update: function() {
			if (this.invalidate === true) {
				this.invalidate = false;
				return true;
			}
			return false;
		},

		// on destroy event
		onDestroyEvent : function () {
			// "nullify" all fonts
			this.font = null;
		},

		//	draw function
		draw : function(context) {
			// clear the screen
			me.video.clearSurface(context, "black");

			// measure the logo size
			var logo_width = this.font.measureText(context, "LOADING...").width;

			// draw our text somewhere in the middle
			this.font.draw( context,
							"LOADING...",
							(context.canvas.width - logo_width) / 2,
							context.canvas.height / 2 - 30);

			// display a progressive loading bar
			var width = Math.floor(this.loadPercent * context.canvas.width);

			// draw the progress bar
			context.strokeStyle = "#FFF";
			context.strokeRect(0, (context.canvas.height / 2) + 40, context.canvas.width, 16);
			context.fillStyle = "#0F0";
			context.fillRect(2, (context.canvas.height / 2) + 42, width-4, 12);
		}
	});

})();
(function() {
	
	window.game.MenuScreen = me.ScreenObject.extend({
		init: function() {
			this.parent(true);
			this.font = null;
			this.arrow = null;
			this.menuItems = null;
			this.selectedItem = 0;
			this.tween =  null;

			this.initialized = false;
		},

		onResetEvent: function() {
			if(!this.initialized) {
				this.font = new me.Font('visitor1', 32, 'white');
				this.arrow = new me.SpriteObject(80, 80, me.loader.getImage("bullet"));
				this.menuItems = [
					new me.Vector2d(200, 350),
					new me.Vector2d(200, 415)
				];
				this.selectedItem = 0;

				//this.tween = new me.Tween(this.arrow.pos).to({
				//	x: 200
				//},400).onComplete(this.tweenbw.bind(this)).start();

				this.initialized = true;
			}

			this.arrow.pos.y = this.menuItems[this.selectedItem].y;
			me.game.add(this.arrow, 100);
		},

		onDestroyEvent: function() {
			this.font = null;
			this.arrow = null;
			this.selectedItem = 0;
			this.tween = null;
			this.initialized = false;
		},

		update: function() {
			if (me.input.isKeyPressed("up")) {
				if (this.selectedItem > 0) {
					this.selectedItem--;
				}
				this.arrow.pos.y = this.menuItems[this.selectedItem].y;
				return true;
			}
			if (me.input.isKeyPressed("down")) {
				if (this.selectedItem < this.menuItems.length - 1) {
					this.selectedItem++;
				}
				this.arrow.pos.y = this.menuItems[this.selectedItem].y;
				return true;
			}
			if (me.input.isKeyPressed("enter")) {
				if (this.selectedItem == 0) {
					//me.state.change(me.state.PLAY)
				}
				if (this.selectedItem == 1) {
					//me.state.change(me.state.CREDITS)
				}
				return true;
			}

			return true;
		},

		draw: function(context) {
			me.video.clearSurface(context, "black");
		}
	});

})();
(function() {

	window.game.PlayScreen = me.ScreenObject.extend({
		onResetEvent : function() {
			me.levelDirector.loadLevel("water_hole");
			me.game.collisionMap.tileset.type['WATER'] = 'water';
			var network = new game.Network();
		},

		onDestroyEvent : function() {
			
		}
	});

})();
(function() {
	
	window.game.Bullet = me.ObjectEntity.extend({
		init : function(x, y, direction, speed, ownerID) {
			if (!this.initialized) { // on first pass
				var settings = {
					image : "tanks",
					spritewidth : 32,
					spriteheight : 32
				};

				this.parent(x, y, settings);

				this.collidable = true;
				this.gravity = 0;

				this.addAnimation("forward", [43]);
				this.addAnimation("sideward", [44]);
				this.addAnimation("explode", [45,46]);

				this.type = me.game.BULLET_OBJECT;
			} else {
				this.pos.x = x;
				this.pos.y = y;
			}

			this.visible = true;
			this.initialized = true;
			this.ownerID = ownerID;
			this.isExploding = false;

			this.speed = speed || 5;
			this.speedAccel = this.speed / 100;
			this.direction = direction;

			if(direction === game.ENUM.DIRECTION.UP) {
				this.setCurrentAnimation("forward");
				this.updateColRect(14, 5, 12, 8);
				this.vel.y = -this.speed;
			} else if(direction === game.ENUM.DIRECTION.DOWN) {
				this.setCurrentAnimation("forward");
				this.flipY(true);
				this.updateColRect(14, 5, 12, 8);
				this.vel.y = this.speed;
			} else if(direction === game.ENUM.DIRECTION.LEFT) {
				this.setCurrentAnimation("sideward");
				this.flipX(true);
				this.updateColRect(12, 8, 14, 5);
				this.vel.x = -this.speed;
			} else if(direction === game.ENUM.DIRECTION.RIGHT) {
				this.setCurrentAnimation("sideward");
				this.updateColRect(12, 8, 14, 5);
				this.vel.x = this.speed;
			}
		},

		update : function() {
			if(!this.visible) {
				me.entityPool.freeInstance(this);
				return false;
			}

			if(!this.isExploding) {
				if(this.direction === game.ENUM.DIRECTION.UP) {
					this.vel.y -= this.speedAccel;
				} else if(this.direction === game.ENUM.DIRECTION.DOWN) {
					this.vel.y += this.speedAccel;
				} else if(this.direction === game.ENUM.DIRECTION.LEFT) {
					this.vel.x -= this.speedAccel;
				} else if(this.direction === game.ENUM.DIRECTION.RIGHT) {
					this.vel.x += this.speedAccel;
				}
			}

			this.updateMovement();
			this.parent(this);
			return true;
		},

		explode : function() {
			this.isExploding = true;

			this.setCurrentAnimation("explode", function() {
				me.entityPool.freeInstance(this);
			}.bind(this));
		},

		updateMovement : function() {
			this.computeVelocity(this.vel);

			var collision = this.collisionMap.checkCollision(this.collisionBox, this.vel);

			if(collision.y && collision.yprop.isSolid && collision.yprop.type !== 'water') {
				this.vel.y = 0;
				this.explode();
				return;
			}

			if(collision.x && collision.xprop.isSolid && collision.xprop.type !== 'water') {
				this.vel.x = 0;
				this.explode();
				return;
			}

			collision = me.game.collide(this);
			if(collision && collision.obj instanceof game.Tank &&
			   collision.obj.GUID !== this.ownerID) { // a Tank is hit

				if(collision.obj.type === me.game.ENEMY_OBJECT ||   // Enemy Tank or
				   (collision.obj.type === me.game.FRIEND_OBJECT && // Friend Tank
				   me.gamestat.getItemValue("friendly_fire"))) {    // with friendly_fire
				
					collision.obj.explode();
					me.entityPool.freeInstance(this);
					return;
				}
			}

			this.pos.add(this.vel);
		}
	});

})();
(function() {

	window.game.Bonus = me.CollectableEntity.extend({
		TYPE : {
			SPEED : 0,
			FASTER_BULLETS : 1,
			POWER : 2,
			ARMOR : 3,
			MONEY : 4,
			XP : 5,
			LIVE : 6
		},

		init : function(x, y, type, time) {
			var settings = {
				image : "star",
				spritewidth : 32,
				spriteheight : 32
			};
			this.parent(x, y, settings);

			this.bonus = typeof type === "number" ? Number.prototype.clamp(type) : Number.prototype.random(0, 6);
			this.isValid = true;

			// this.addAnimation("default", [this.bonus * settings.spritewidth]);
			this.addAnimation("default", [this.bonus * settings.spritewidth]);
			
			this.setCurrentAnimation("default");

			setTimeout(function() {
				this.isValid = false;
			}.bind(this), time || 5000);
		},

		update : function() {
			if(!this.isValid) {
				me.game.remove(this);
				return true;
			}
			return false;
		},

		onCollision : function(res, obj) {
			if(this.isValid) {
				// TODO finish bonuses
				switch(this.bonus) {
					case this.TYPE.SPEED:
						obj.setVelocity(5, 5);
						break;
				}

				this.isValid = false;
			}
		}
	});

})();
(function() {
	
	window.game.Tank = me.ObjectEntity.extend({
		// members
		pressed : 0,

		// constructor
		init : function(x, y, direction, recoil, speed, friction, enemy) {
			var settings = {
				image : "tanks",
				spritewidth : 32,
				spriteheight : 32
			};

			this.parent(x, y, settings);

			enemy = enemy || false;

			this.isExploding = false;
			this.collidable = true;
			this.direction = direction;
			this.recoil = recoil;
			this.gravity = 0;
			
			this.setVelocity(speed, speed);
			this.setFriction(friction, friction);

			if(enemy) {
				if(me.gamestat.getItemValue("team") === game.ENUM.TEAM.GREEN) {
					this.addAnimation("idleForward", [17]);
					this.addAnimation("moveForward", [17,16,15,14,13,12,11,10]);
					this.addAnimation("shootForward", [17,18,19,18,17]);
					this.addAnimation("idleSideward", [37]);
					this.addAnimation("moveSideward", [37,36,35,34,33,32,31,30]);
					this.addAnimation("shootSideward", [37,38,39,38,37]);
				} else if(me.gamestat.getItemValue("team") === game.ENUM.TEAM.BLUE) {
					this.addAnimation("idleForward", [7]);
					this.addAnimation("moveForward", [7,6,5,4,3,2,1,0]);
					this.addAnimation("shootForward", [7,8,9,8,7]);
					this.addAnimation("idleSideward", [27]);
					this.addAnimation("moveSideward", [27,26,25,24,23,22,21,20]);
					this.addAnimation("shootSideward", [27,28,29,28,27]);
				} else {
					throw "unknown team \"" + me.gamestat.getItemValue("team") + "\"";
				}
			} else {
				if(me.gamestat.getItemValue("team") === game.ENUM.TEAM.GREEN) {
					this.addAnimation("idleForward", [7]);
					this.addAnimation("moveForward", [7,6,5,4,3,2,1,0]);
					this.addAnimation("shootForward", [7,8,9,8,7]);
					this.addAnimation("idleSideward", [27]);
					this.addAnimation("moveSideward", [27,26,25,24,23,22,21,20]);
					this.addAnimation("shootSideward", [27,28,29,28,27]);
				} else if(me.gamestat.getItemValue("team") === game.ENUM.TEAM.BLUE) {
					this.addAnimation("idleForward", [17]);
					this.addAnimation("moveForward", [17,16,15,14,13,12,11,10]);
					this.addAnimation("shootForward", [17,18,19,18,17]);
					this.addAnimation("idleSideward", [37]);
					this.addAnimation("moveSideward", [37,36,35,34,33,32,31,30]);
					this.addAnimation("shootSideward", [37,38,39,38,37]);
				} else {
					throw "unknown team \"" + me.gamestat.getItemValue("team") + "\"";
				}
			}
			this.addAnimation("explode", [40,41,42]);

			var currentAnimation = "move";

			if(direction === game.ENUM.DIRECTION.UP || direction === game.ENUM.DIRECTION.DOWN) {
				this.updateColRect(4, 24, 1, 29);
				currentAnimation += "Forward";
			} else if(direction === game.ENUM.DIRECTION.LEFT || direction === game.ENUM.DIRECTION.RIGHT) {
				this.updateColRect(2, 29, 4, 24);
				currentAnimation += "Sideward";
			} else {
				throw "unknown direction \"" + direction + "\"";
			}
			
			this.setCurrentAnimation(currentAnimation);

			if(direction === game.ENUM.DIRECTION.LEFT) {
				this.flipX(true);
			} else if(direction === game.ENUM.DIRECTION.DOWN) {
				this.flipY(true);
			}
		},

		explode : function() {
			this.isExploding = true;
			this.collidable = false;

			this.setCurrentAnimation("explode", function() {
				this.isExploding = false;
				me.entityPool.freeInstance(this);
			});
		},

		fixDirection : function() {
			var currentAnimation = "move";
			if(this.direction === game.ENUM.DIRECTION.UP || this.direction === game.ENUM.DIRECTION.DOWN) {
				this.updateColRect(4, 24, 1, 29);
				currentAnimation += "Forward";
			} else if(this.direction === game.ENUM.DIRECTION.LEFT || this.direction === game.ENUM.DIRECTION.RIGHT) {
				this.updateColRect(2, 29, 4, 24);
				currentAnimation += "Sideward";
			} else {
				throw "unknown direction \"" + direction + "\"";
			}

			this.setCurrentAnimation(currentAnimation);

			if(this.direction === game.ENUM.DIRECTION.LEFT) {
				this.flipX(true);
			} else if(this.direction === game.ENUM.DIRECTION.RIGHT) {
				this.flipX(false);
			} else if(this.direction === game.ENUM.DIRECTION.UP) {
				this.flipY(false);
			} else if(this.direction === game.ENUM.DIRECTION.DOWN) {
				this.flipY(true);
			}
		},

		updateMovement : function() {
			this.computeVelocity(this.vel);

			var collision = this.collisionMap.checkCollision(this.collisionBox, this.vel);

			if (collision.y !== 0 || collision.yprop.type === 'water') {
				this.vel.y = 0;
			}

			if (collision.x !== 0 || collision.yprop.type === 'water') {
				this.vel.x = 0;
			}

			var x = this.pos.x, y = this.pos.y;
			this.pos.add(this.vel);
			collision = me.game.collide(this);

			if(collision && collision.obj instanceof game.Tank) {
				if(collision.y !== 0) {
					this.vel.y = 0;
				}

				if(collision.x !== 0) {
					this.vel.x = 0;
				}

				this.pos.x = x;
				this.pos.y = y;
			}
		},

		moveLeft : function() {
			this.vel.x -= this.accel.x * me.timer.tick;
			this.vel.y = 0;

			if(this.direction !== game.ENUM.DIRECTION.LEFT) {
				if(this.direction !== game.ENUM.DIRECTION.RIGHT) {
					this.updateColRect(2, 29, 4, 24);
					this.setCurrentAnimation("moveSideward");
				}

				this.flipX(true);
				this.direction = game.ENUM.DIRECTION.LEFT;
			}
		},

		moveRight : function() {
			this.vel.x += this.accel.x * me.timer.tick;
			this.vel.y = 0;

			if(this.direction !== game.ENUM.DIRECTION.RIGHT) {
				if(this.direction !== game.ENUM.DIRECTION.LEFT) {
					this.updateColRect(2, 29, 4, 24);
					this.setCurrentAnimation("moveSideward");
				}

				this.flipX(false);
				this.direction = game.ENUM.DIRECTION.RIGHT;
			}
		},

		moveUp : function() {
			this.vel.x = 0;
			this.vel.y -= this.accel.y * me.timer.tick;

			if(this.direction !== game.ENUM.DIRECTION.UP) {
				if(this.direction !== game.ENUM.DIRECTION.DOWN) {
					this.updateColRect(4, 24, 1, 29);
					this.setCurrentAnimation("moveForward");
				}

				this.flipY(false);
				this.direction = game.ENUM.DIRECTION.UP;
			}
		},

		moveDown : function() {
			this.vel.x = 0;
			this.vel.y += this.accel.y * me.timer.tick;

			if(this.direction !== game.ENUM.DIRECTION.DOWN) {
				if(this.direction !== game.ENUM.DIRECTION.UP) {
					this.updateColRect(4, 24, 1, 29);
					this.setCurrentAnimation("moveForward");
				}

				this.flipY(true);
				this.direction = game.ENUM.DIRECTION.DOWN;
			}
		}
	});
	
})();
(function() {

	window.game.Friend = game.Tank.extend({
		init : function(x, y, direction, recoil, speed, friction) {
			this.parent(x, y, direction, recoil, speed, friction);

			this.pressed = 0;
			this.lastDirection = direction;
			this.lastPos = new me.Vector2d(0, 0);
			this.type = me.game.FRIEND_OBJECT;
		},

		update : function() {
			if(this.isExploding) {
				this.parent(this);
				return true;
			}

			if(this.pressed & game.ENUM.PRESSED.LEFT) {
				this.moveLeft();
			} else if(this.pressed & game.ENUM.PRESSED.RIGHT) {
				this.moveRight();
			}

			if(this.pressed & game.ENUM.PRESSED.UP) {
				this.moveUp();
			} else if(this.pressed & game.ENUM.PRESSED.DOWN) {
				this.moveDown();
			}

			var updated = this.pos.x !== this.lastPos.x || this.pos.y !== this.lastPos.y;

			this.updateMovement();

			updated = updated || this.vel.x !== 0 || this.vel.y !== 0;

			this.vel.x = this.vel.y = 0;
			this.lastPos.x = this.pos.x;
			this.lastPos.y = this.pos.y;
			
			if(updated) {
				this.parent(this);
				return true;
			}
			return false;
		}
	});

})();
(function() {

	window.game.Enemy = game.Tank.extend({
		init : function(x, y, direction, recoil, speed, friction) {
			this.parent(x, y, direction, recoil, speed, friction, true);
			
			this.pressed = 0;
			this.lastDirection = direction;
			this.lastPos = new me.Vector2d(0, 0);
			this.type = me.game.ENEMY_OBJECT;
		},

		update : function() {
			if(this.isExploding) {
				this.parent(this);
				return true;
			}

			if(this.pressed & game.ENUM.PRESSED.LEFT) {
				this.moveLeft();
			} else if(this.pressed & game.ENUM.PRESSED.RIGHT) {
				this.moveRight();
			}

			if(this.pressed & game.ENUM.PRESSED.UP) {
				this.moveUp();
			} else if(this.pressed & game.ENUM.PRESSED.DOWN) {
				this.moveDown();
			}

			var updated = this.pos.x !== this.lastPos.x || this.pos.y !== this.lastPos.y;

			this.updateMovement();

			updated = updated || this.vel.x !== 0 || this.vel.y !== 0;

			this.vel.x = this.vel.y = 0;
			this.lastPos.x = this.pos.x;
			this.lastPos.y = this.pos.y;
			
			if(updated) {
				this.parent(this);
				return true;
			}
			return false;
		}
	});

})();
(function() {

	window.game.Player = game.Tank.extend({
		/**
		constructor
		*/
		init : function(x, y, direction, recoil, speed, friction, shootSpeed, socket) {
			this.parent(x, y, direction, recoil, speed, friction);
			//this.lastVel = new me.Vector2d(0, 0);
			this.shootSpeed = shootSpeed;
			this.socket = socket;
			this.lastPressed = 0;
			this.canShoot = true;
			this.input_seq = 0;
			this.inputs = [];
			
			me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
		},

		/**
		called on each frame
		*/
		update : function() {
			if(this.isExploding) {
				this.parent(this);
				return true;
			}

			var updated = this.vel.x !== 0 || this.vel.y !== 0;
			this.pressed = 0;

			if(me.input.isKeyPressed("left")) {
				this.moveLeft();
			} else if (me.input.isKeyPressed("right")) {
				this.moveRight();
			}

			if(me.input.isKeyPressed("up")) {
				this.moveUp();
			} else if (me.input.isKeyPressed("down")) {
				this.moveDown();
			}


			if(me.input.isKeyPressed("shoot")) {
				this.shoot();
			}

			
			if(this.isCurrentAnimation("shootForward") || this.isCurrentAnimation("shootSideward")) {
				if(this.recoil > 0) {
					if(this.direction === game.ENUM.DIRECTION.UP) {
						this.vel.y += this.recoil;
					} else if(this.direction === game.ENUM.DIRECTION.DOWN) {
						this.vel.y -= this.recoil;
					} else if(this.direction === game.ENUM.DIRECTION.LEFT) {
						this.vel.x += this.recoil;
					} else if(this.direction === game.ENUM.DIRECTION.RIGHT) {
						this.vel.x -= this.recoil;
					}
				}

				updated = true;
			}

			this.updateMovement();

			if(this.pressed !== this.lastPressed) {
				this.lastPressed = this.pressed;
				
				this.input_seq += 1;

				var input = {};
				input[game.ENUM.TYPE.PRESSED]         = this.pressed;
				input[game.ENUM.TYPE.SEQUENCE_NUMBER] = this.input_seq;
				input[game.ENUM.TYPE.LOCAL_TIME]      = window.game.local_time;

				this.inputs.push(input);
				this.socket.emit(game.ENUM.TYPE.INPUT, input);
			}

			/*if(this.vel.x !== this.lastVel.x || this.vel.y !== this.lastVel.y) {
				var data = {};
				data.x = this.vel.x;
				data.y = this.vel.y;
				data.d = this.direction;
				socket.emit(TYPE.MOVE, data);
				console.log(data);
			}*/

			//this.lastVel.x = this.vel.x;
			//this.lastVel.y = this.vel.y;

			updated = updated || this.vel.x !== 0 || this.vel.y !== 0;

			this.vel.x = 0;
			this.vel.y = 0;

			if(updated) {
				this.parent(this);
				return true;
			}
			return false;
		},

		shoot : function() {
			// if(this.isCurrentAnimation("shootForward") || this.isCurrentAnimation("shootSideward")) {
				// return false;
			// }
			if(this.canShoot) {
				this.canShoot = false;
				setTimeout(function() {
					this.canShoot = true;
				}.bind(this), this.shootSpeed);
			} else {
				return false;
			}

			var x = this.pos.x,
				y = this.pos.y;

			if(this.direction === game.ENUM.DIRECTION.UP) {
				this.setCurrentAnimation("shootForward", function() {
					this.setCurrentAnimation("moveForward");
					this.setAnimationFrame(0);
					this.animationspeed = me.sys.fps / 10;
				}.bind(this));
				this.vel.y += this.recoil;
				
				y -= 18;
			} else if (this.direction === game.ENUM.DIRECTION.DOWN) {
				this.setCurrentAnimation("shootForward", function() {
					this.setCurrentAnimation("moveForward");
					this.setAnimationFrame(0);
					this.animationspeed = me.sys.fps / 10;
				}.bind(this));
				this.flipY(true);
				this.vel.y -= this.recoil;

				y += 18;
			} else if (this.direction === game.ENUM.DIRECTION.LEFT) {
				this.setCurrentAnimation("shootSideward", function() {
					this.setCurrentAnimation("moveSideward");
					this.setAnimationFrame(0);
					this.animationspeed = me.sys.fps / 10;
				}.bind(this));
				this.flipX(true);
				this.vel.x += this.recoil;

				x -= 18;
			} else if (this.direction === game.ENUM.DIRECTION.RIGHT) {
				this.setCurrentAnimation("shootSideward", function() {
					this.setCurrentAnimation("moveSideward");
					this.setAnimationFrame(0);
					this.animationspeed = me.sys.fps / 10;
				}.bind(this));
				this.vel.x -= this.recoil;

				x += 18;
			} else { // this should never happen
				throw "unknown direction \"" + this.direction + "\"";
			}

			this.animationspeed = me.sys.fps / 50;

			var bullet = me.entityPool.newInstanceOf('Bullet', x, y, this.direction, 5, this.GUID);
			me.game.add(bullet, 5);
			me.game.sort();

			return true;
		},

		moveLeft : function() {
			this.parent();
			this.pressed |= game.ENUM.PRESSED.LEFT;
		},

		moveRight : function() {
			this.parent();
			this.pressed |= game.ENUM.PRESSED.RIGHT;
		},

		moveUp : function() {
			this.parent();
			this.pressed |= game.ENUM.PRESSED.UP;
		},

		moveDown : function() {
			this.parent();
			this.pressed |= game.ENUM.PRESSED.DOWN;
		}
	});
	
})();
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

	window.game._dt = null;
	window.game._dte = null;
	window.game.local_time = null;
	window.game.createTimer = function() {
		setInterval(function() {
			this._dt = new Date().getTime() - this._dte;
			this._dte = new Date().getTime();
			this.local_time += this._dt/1000.0;
		}.bind(this), 4);
	};

	/**
	called when document is loaded
	*/
	window.game.onLoad = function() {
		// init the video
		if (!me.video.init('jsapp', 800, 600, true, 1.0)) {
			alert("Sorry but your browser does not support html 5 canvas.");
			return;
		}

		this.local_time = 0.016;
		this._dt = this._dte = new Date().getTime();
		this.createTimer();
		
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

		// start the game 
		me.state.change(me.state.PLAY);
	};

	window.onReady(function() {
		game.onLoad();
	});

})();