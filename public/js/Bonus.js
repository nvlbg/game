(function() {

	window.game.Bonus = me.ObjectEntity.extend({
		init : function(x, y, type) {
			var settings = {
				image : "tanks",
				spritewidth : 32,
				spriteheight : 32,
				collidable : false
			};
			
			this.parent(x, y, settings);

			this.renderable.addAnimation("default", [0]);

			switch (type) {
				case window.game.ENUM.BONUS_TYPE.SPEED:
					this.renderable.setCurrentAnimation("default");
					break;
				case window.game.ENUM.BONUS_TYPE.ARMOR:
					this.renderable.setCurrentAnimation("default");
					break;
				case window.game.ENUM.BONUS_TYPE.FASTER_BULLETS:
					this.renderable.setCurrentAnimation("default");
					break;
				case window.game.ENUM.BONUS_TYPE.ENERGY_SHIELD:
					this.renderable.setCurrentAnimation("default");
					break;
			} 
			
		}
	});
})();
