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

			// this.addAnimation("default", [this.bonus * settings.spritewidth]);
			this.renderable.addAnimation("default", [0]);
			
			this.renderable.setCurrentAnimation("default");
		}
	});
})();