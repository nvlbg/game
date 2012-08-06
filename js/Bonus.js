var Bonus = me.CollectableEntity.extend({
	TYPE : {
		SPEED : 0,
		FASTER_BULLETS : 1,
		POWER : 2,
		ARMOR : 3,
		MONEY : 4,
		XP : 5,
		LIVE : 6
	},

	init : function(x, y, settings) {
		settings.image = "";
		settings.spritewidth = 0;
		settings.spriteheight = 0;
		this.parent(x, y, settings);

		this.bonus = settings.bonusType || Number.random(0, 6);

		this.addAnimation("default", [this.bonus * settings.spritewidth]);
		this.setCurrentAnimation("default");

		var that = this;
		setTimeout(function() {
			me.game.remove(that);
		}, settings.time);
	},

	onCollision : function(res, obj) {
		console.log(obj);
	}
});