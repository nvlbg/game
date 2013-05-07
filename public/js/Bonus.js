(function() {

	window.game.Bonus = me.ObjectEntity.extend({
		init : function(x, y, type) {
			var settings = {
				image : "bonuses",
				spritewidth : 32,
				spriteheight : 32,
				collidable : false
			};
			
			this.parent(x, y, settings);

			this.renderable.addAnimation("speed", [0]);
			this.renderable.addAnimation("armor", [1]);
			this.renderable.addAnimation("faster_bullets", [2]);

			switch (type) {
				case window.game.ENUM.BONUS_TYPE.SPEED:
					this.renderable.setCurrentAnimation("speed");
					break;
				case window.game.ENUM.BONUS_TYPE.ARMOR:
					this.renderable.setCurrentAnimation("armor");
					break;
				case window.game.ENUM.BONUS_TYPE.FASTER_BULLETS:
					this.renderable.setCurrentAnimation("faster_bullets");
					break;
			}
		}
	});
})();
