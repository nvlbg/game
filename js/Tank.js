var Tank = me.ObjectEntity.extend({
	/**
	constructor
	*/
	init : function(x, y, settings) {
		settings.image = "tanks";
		settings.spritewidth = 32;
		settings.spriteheight = 32;
		
		this.parent(x, y, settings);

		this.gravity = 0;
		
		this.setVelocity(1.5, 1.5);
		this.setFriction(0.25, 0.25);
	},

	/**
	called on each frame
	*/
	update : function() {
		var hadSpeed = this.vel.x !== 0 || this.vel.y !== 0;

		if(me.input.isKeyPressed("left")) {
			this.vel.x = -this.accel.x * me.timer.tick;
		} else if(me.input.isKeyPressed("right")) {
			this.vel.x = this.accel.x * me.timer.tick;
		}

		if(me.input.isKeyPressed("up")) {
			this.vel.y = -this.accel.y * me.timer.tick;
		} else if(me.input.isKeyPressed("down")) {
			this.vel.y = this.accel.y * me.timer.tick;
		}

		this.updateMovement();

		if(hadSpeed || this.vel.x !== 0 || this.vel.y !== 0) {
			this.parent(this);
			return true;
		}

		return false;
	}
});