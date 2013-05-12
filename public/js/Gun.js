(function() {
	
	window.game.Gun = me.AnimationSheet.extend({
		init : function(owner) {
			this.parent(owner.pos.x, owner.pos.y, me.loader.getImage('tanks'), 32, 32);
			this.owner = owner;
			this.collidable = false;

			this.addAnimation('green', [8]);
			this.addAnimation('blue', [17]);

			this.anchorPoint.x = 0.5;
			this.anchorPoint.y = 0.65625; // 21/32

			this.setCurrentAnimation(owner.team === game.ENUM.TEAM.GREEN ? 'green' : 'blue');
			this.isLocalGun = false;

			this.alwaysUpdate = true;
		},

		draw: function(ctx) {
			this.parent(ctx);
		},

		update: function() {
			if (!this.visible) {
				return false;
			}
			
			this.parent();

			switch( this.owner.direction ) {
				case game.ENUM.DIRECTION.UP:
					this.pos.set( this.owner.pos.x, this.owner.pos.y - 4 );
					break;
				case game.ENUM.DIRECTION.DOWN:
					this.pos.set( this.owner.pos.x, this.owner.pos.y - 6 );
					break;
				case game.ENUM.DIRECTION.LEFT:
					this.pos.set( this.owner.pos.x, this.owner.pos.y - 5 );
					break;
				case game.ENUM.DIRECTION.RIGHT:
					this.pos.set( this.owner.pos.x, this.owner.pos.y - 5 );
					break;
			}

			if (this.isLocalGun && !this.owner.smartphoneConnected) {
				var dir = new me.Vector2d(
								me.input.mouse.pos.x - this.owner.pos.x + me.game.viewport.pos.x - 16,
								me.input.mouse.pos.y - this.owner.pos.y + me.game.viewport.pos.y - 16
							);

				this.angle = Math.atan2(dir.y, dir.x) + 1.57079633;	
			}

			return true;
		}
	});

})();
