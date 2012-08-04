var Player = Tank.extend({
	/**
	constructor
	*/
	init : function(x, y, settings) {
		this.parent(x, y, settings);

		/*
		this.addAnimation("idle", [7]);
		this.addAnimation("moveForward", [0,1,2,3,4,5,6]);
		this.addAnimation("shoot", [7,8,9,8,7]);
	
		this.updateColRect(4, 23, 1, 29);
		*/

		this.addAnimation("idleForward", [7]);
		this.addAnimation("moveForward", [0,1,2,3,4,5,6,7]);
		this.addAnimation("shootForward", [7,8,9,8,7]);
		this.addAnimation("idleSideward", [27]);
		this.addAnimation("moveSideward", [20,21,22,23,24,25,26,27]);
		this.addAnimation("shootSideward", [27,28,29,28,27]);

		
		this.setCurrentAnimation("idleForward");
		this.direction = "up";
		this.updateColRect(4, 24, 1, 29);

		me.debug.renderHitBox = true;

		me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
	},

	/**
	called on each frame
	*/
	update : function() {
		var hadSpeed = this.vel.x !== 0 || this.vel.y !== 0;

		if(me.input.isKeyPressed("left")) {
			this.vel.x = -this.accel.x * me.timer.tick;
			this.vel.y = 0;

			if(!this.direction === "left") {
				if(this.direction === "right") {
					this.flipX(true);
				} else {
					this.setCurrentAnimation("moveSideward");
					this.flipX(true);
				}

				this.direction = "left";
			}
		} else if(me.input.isKeyPressed("right")) {
			this.vel.x = this.accel.x * me.timer.tick;
			this.vel.y = 0;

			if(!this.direction === "right") {
				if(this.direction === "left") {
					this.flipX(true);
				} else {
					this.setCurrentAnimation("moveSideward");
				}

				this.direction = "right";
			}
		} else if(me.input.isKeyPressed("up")) {
			this.vel.x = 0;
			this.vel.y = -this.accel.y * me.timer.tick;

			if(!this.direction === "up") {
				if(this.direction === "down") {
					this.flipY(true);
				} else {
					this.setCurrentAnimation("moveForward");
				}

				this.direction = "up";
			}
		} else if(me.input.isKeyPressed("down")) {
			this.vel.x = 0;
			this.vel.y = this.accel.y * me.timer.tick;

			if(!this.direction === "down") {
				if(this.direction === "up") {
					this.flipY(true);
				} else {
					this.setCurrentAnimation("moveForward");
					this.flipY(true);
				}

				this.direction = "down";
			}
		}

		// this.updateMovement();

		if(hadSpeed || this.vel.x !== 0 || this.vel.y !== 0) {
			this.parent(this);
			return true;
		}
		return false;
	}
});