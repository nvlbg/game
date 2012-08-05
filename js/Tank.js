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
	}
});