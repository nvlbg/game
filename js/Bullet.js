var Bullet = me.ObjectEntity.extend({
	init : function(x, y, settings) {
		settings.image = "tanks";
		settings.spritewidth = 32;
		settings.spriteheight = 32;

		this.parent(x, y, settings);

		this.gravity = 0;
		this.isExploding = false;

		this.addAnimation("forward", [43]);
		this.addAnimation("sideward", [44]);
		this.addAnimation("explode", [45,46]);

		this.speed = settings.speed || 5;
		this.speedAccel = this.speed / 100;
		this.direction = settings.direction;

		if(this.direction === "up") {
			this.setCurrentAnimation("forward");
			this.updateColRect(14, 5, 12, 8);
			this.vel.y -= this.speed;
		} else if(this.direction === "down") {
			this.setCurrentAnimation("forward");
			this.flipY(true);
			this.updateColRect(14, 5, 12, 8);
			this.vel.y += this.speed;
		} else if(this.direction === "left") {
			this.setCurrentAnimation("sideward");
			this.flipX(true);
			this.updateColRect(12, 8, 14, 5);
			this.vel.x -= this.speed;
		} else if(this.direction === "right") {
			this.setCurrentAnimation("sideward");
			this.updateColRect(12, 8, 14, 5);
			this.vel.x += this.speed;
		}
	},

	update : function() {
		if(!this.isExploding) {
			if(this.direction === "up") {
				this.vel.y -= this.speedAccel;
			} else if(this.direction === "down") {
				this.vel.y += this.speedAccel;
			} else if(this.direction === "left") {
				this.vel.x -= this.speedAccel;
			} else if(this.direction === "right") {
				this.vel.x += this.speedAccel;
			}
		}

		var res = this.updateMovement();

		if(res.x !== 0 || res.y !== 0) {
			this.isExploding = true;

			var that = this;
			this.setCurrentAnimation("explode", function() {
				me.game.remove(that);
			});
		}

		this.parent(this);
		return true;
	}
});