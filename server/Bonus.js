require('./Util.js');
var Rect = require('./Rect.js');

var Bonus = Rect.extend({
	init: function(pos, type, lifeTime) {
		this.parent(pos, 32, 32);
		this.type = type;
		this.valid = true;
		this.updated = true;
		this.needsRemove = false;

		this.timeout = setTimeout(function() {
			this.updated = true;
			this.valid = false;
		}.bind(this), lifeTime);
	},

	onPlayerCollision: function(player) {
		if (!this.valid) {
			return;
		}

		switch(this.type) {
			case Game.BONUS_TYPE.SPEED:
				var newSpeed = 5;

				player.accel.set(newSpeed, newSpeed);
				player.gainedBonus = [Game.BONUS_TYPE.SPEED, newSpeed];

				setTimeout(function() {
					this.needsRemove = true;

					var newSpeed = 3;

					player.accel.set(newSpeed, newSpeed);
					player.gainedBonus = [Game.BONUS_TYPE.SPEED, newSpeed];
				}.bind(this), 10000);
				break;
			case Game.BONUS_TYPE.ARMOR:
				player.armor += 1;
				this.needsRemove = true;
				break;
			case Game.BONUS_TYPE.FASTER_BULLETS:
				var newShootSpeed = 250;

				player.shootSpeed = newShootSpeed - 25;
				player.gainedBonus = [Game.BONUS_TYPE.FASTER_BULLETS, newShootSpeed];

				setTimeout(function() {
					this.needsRemove = true;

					var newShootSpeed = 500;

					player.shootSpeed = newShootSpeed - 25;
					player.gainedBonus = [Game.BONUS_TYPE.FASTER_BULLETS, newShootSpeed];
				}.bind(this), 10000);
				break;
		}

		this.updated = true;
		this.valid = false;
		clearTimeout(this.timeout);
	}
});

module.exports = Bonus;
