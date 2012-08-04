var Player = Tank.extend({
	/**
	constructor
	*/
	init : function(x, y, settings) {
		this.parent(x, y, settings);

		this.addAnimation("idleForward", [7]);
		this.addAnimation("moveForward", [7,6,5,4,3,2,1,0]);
		this.addAnimation("shootForward", [7,8,9,8,7]);
		this.addAnimation("idleSideward", [27]);
		this.addAnimation("moveSideward", [27,26,25,24,23,22,21,20]);
		this.addAnimation("shootSideward", [27,28,29,28,27]);

		
		this.setCurrentAnimation("moveForward");
		this.direction = "up";
		this.updateColRect(4, 24, 1, 29);

		me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
	},

	/**
	called on each frame
	*/
	update : function() {
		if (this.isCurrentAnimation("shootForward") || this.isCurrentAnimation("shootSideward")) {
			this.parent(this);
			return true;
		}

		if(me.input.isKeyPressed("left")) {
			this.moveLeft();
		} else if(me.input.isKeyPressed("right")) {
			this.moveRight();
		}

		if(me.input.isKeyPressed("up")) {
			this.moveUp();
		} else if(me.input.isKeyPressed("down")) {
			this.moveDown();
		}
		

		var updated = this.updateMovement();

		if(me.input.isKeyPressed("shoot")) {
			updated = updated || this.shoot();
		}

		if(updated) {
			this.parent(this);
			return true;
		}
		return false;
	},

	shoot : function() {
		if(this.isCurrentAnimation("shootForward") || this.isCurrentAnimation("shootSideward")) {
			return false;
		}

		if(this.direction === "up") {
			this.setCurrentAnimation("shootForward", "idleForward");
		} else if (this.direction === "down") {
			this.setCurrentAnimation("shootForward", "idleForward");
			this.flipY(true);
		} else if (this.direction === "left") {
			this.setCurrentAnimation("shootSideward", "idleSideward");
			this.flipX(true);
		} else if (this.direction === "right") {
			this.setCurrentAnimation("shootSideward", "idleSideward");
		} else {
			return false;
		}

		this.animationspeed = me.sys.fps / 35;
		return true;
	},


	// TODO: optimize move methods with some checks
	moveLeft : function() {
		this.vel.x = -this.accel.x * me.timer.tick;
		this.vel.y = 0;

		if(this.direction !== "left") {
			this.setCurrentAnimation("moveSideward");
			this.flipX(true);
			this.updateColRect(2, 29, 4, 24);

			this.direction = "left";
		}
	},

	moveRight : function() {
		this.vel.x = this.accel.x * me.timer.tick;
		this.vel.y = 0;

		if(this.direction !== "right") {
			this.setCurrentAnimation("moveSideward");
			this.flipX(false);
			this.updateColRect(2, 29, 4, 24);

			this.direction = "right";
		}
	},

	moveUp : function() {
		this.vel.x = 0;
		this.vel.y = -this.accel.y * me.timer.tick;

		if(this.direction !== "up") {
			this.setCurrentAnimation("moveForward");
			this.flipY(false);
			this.updateColRect(4, 24, 1, 29);

			this.direction = "up";
		}
	},

	moveDown : function() {
		this.vel.x = 0;
		this.vel.y = this.accel.y * me.timer.tick;

		if(this.direction !== "down") {
			this.setCurrentAnimation("moveForward");
			this.flipY(true);
			this.updateColRect(4, 24, 1, 29);

			this.direction = "down";
		}
	}
});