var Tank = me.ObjectEntity.extend({
	/**
	constructor
	*/
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
			if(me.gamestat.getItemValue("team") === "green") {
				this.addAnimation("idleForward", [17]);
				this.addAnimation("moveForward", [17,16,15,14,13,12,11,10]);
				this.addAnimation("shootForward", [17,18,19,18,17]);
				this.addAnimation("idleSideward", [37]);
				this.addAnimation("moveSideward", [37,36,35,34,33,32,31,30]);
				this.addAnimation("shootSideward", [37,38,39,38,37]);
			} else if(me.gamestat.getItemValue("team") === "blue") {
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
			if(me.gamestat.getItemValue("team") === "green") {
				this.addAnimation("idleForward", [7]);
				this.addAnimation("moveForward", [7,6,5,4,3,2,1,0]);
				this.addAnimation("shootForward", [7,8,9,8,7]);
				this.addAnimation("idleSideward", [27]);
				this.addAnimation("moveSideward", [27,26,25,24,23,22,21,20]);
				this.addAnimation("shootSideward", [27,28,29,28,27]);
			} else if(me.gamestat.getItemValue("team") === "blue") {
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

		if(direction === DIRECTION.UP || direction === DIRECTION.DOWN) {
			this.updateColRect(4, 24, 1, 29);
			currentAnimation += "Forward";
		} else if(direction === DIRECTION.LEFT || direction === DIRECTION.RIGHT) {
			this.updateColRect(2, 29, 4, 24);
			currentAnimation += "Sideward";
		} else {
			throw "unknown direction \"" + DIRECTION + "\"";
		}
		
		this.setCurrentAnimation(currentAnimation);

		if(direction === DIRECTION.LEFT) {
			this.flipX(true);
		} else if(direction === DIRECTION.DOWN) {
			this.flipY(true);
		}
	},

	explode : function() {
		this.isExploding = true;
		this.collidable = false;

		var that = this;
		this.setCurrentAnimation("explode", function() {
			that.isExploding = false;
			me.game.remove(that);
		});
	},

	fixDirection : function() {
		var currentAnimation = "move";
		if(this.direction === DIRECTION.UP || this.direction === DIRECTION.DOWN) {
			this.updateColRect(4, 24, 1, 29);
			currentAnimation += "Forward";
		} else if(this.direction === DIRECTION.LEFT || this.direction === DIRECTION.RIGHT) {
			this.updateColRect(2, 29, 4, 24);
			currentAnimation += "Sideward";
		} else {
			throw "unknown direction \"" + DIRECTION + "\"";
		}

		this.setCurrentAnimation(currentAnimation);

		if(this.direction === DIRECTION.LEFT) {
			this.flipX(true);
		} else if(this.direction === DIRECTION.RIGHT) {
			this.flipX(false);
		} else if(this.direction === DIRECTION.UP) {
			this.flipY(false);
		} else if(this.direction === DIRECTION.DOWN) {
			this.flipY(true);
		}
	}
});