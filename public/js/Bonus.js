(function() {

	window.game.Bonus = me.CollectableEntity.extend({
		TYPE : {
			SPEED : 0,
			FASTER_BULLETS : 1,
			POWER : 2,
			ARMOR : 3,
			MONEY : 4,
			XP : 5,
			LIVE : 6
		},

		init : function(x, y, type, time) {
			var settings = {
				image : "star",
				spritewidth : 32,
				spriteheight : 32
			};
			this.parent(x, y, settings);

			this.bonus = typeof type === "number" ? Number.prototype.clamp(type) : Number.prototype.random(0, 6);
			this.isValid = true;

			// this.addAnimation("default", [this.bonus * settings.spritewidth]);
			this.addAnimation("default", [this.bonus * settings.spritewidth]);
			
			this.setCurrentAnimation("default");

			var that = this;
			setTimeout(function() {
				that.isValid = false;
			}, time || 5000);
		},

		update : function() {
			if(!this.isValid) {
				me.game.remove(this);
				return true;
			}
			return false;
		},

		onCollision : function(res, obj) {
			if(this.isValid) {
				// TODO finish bonuses
				switch(this.bonus) {
					case this.TYPE.SPEED:
						obj.setVelocity(5, 5);
						break;
				}

				this.isValid = false;
			}
		}
	});

})();