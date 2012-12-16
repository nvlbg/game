require('./Util.js');
var constants = require('./constants.js');

var Vector2d = require('./Vector2d.js');
var Rect = require('./Rect.js');

var game = Object.extend({
	checkCollision : function (obj, pv) {
		var x = (pv.x < 0) ? ~~(obj.left + pv.x) : Math.ceil(obj.right  - 1 + pv.x);
		var y = (pv.y < 0) ? ~~(obj.top  + pv.y) : Math.ceil(obj.bottom - 1 + pv.y);
		//to return tile collision detection
		var res = {
			x : 0, // !=0 if collision on x axis
			xtile : undefined,
			xprop : {},
			y : 0, // !=0 if collision on y axis
			ytile : undefined,
			yprop : {}
		};
		
		//var tile;
		if (x <= 0 || x >= constants.realwidth) {
			res.x = pv.x;
		} else if (pv.x != 0 ) {
			// x, bottom corner
			res.xtile = this.getTile(x, Math.ceil(obj.bottom - 1));
			if (res.xtile && this.tileset.isTileCollidable(res.xtile.tileId)) {
				res.x = pv.x; // reuse pv.x to get a 
				res.xprop = this.tileset.getTileProperties(res.xtile.tileId);
			} else {
				// x, top corner
				res.xtile = this.getTile(x, ~~obj.top);
				if (res.xtile && this.tileset.isTileCollidable(res.xtile.tileId)) {
					res.x = pv.x;
					res.xprop = this.tileset.getTileProperties(res.xtile.tileId);
				}
			}
		}
		
		// check for y movement
		// left, y corner
		if ( pv.y != 0 ) {
			res.ytile = this.getTile((pv.x < 0) ? ~~obj.left : Math.ceil(obj.right - 1), y);
			if (res.ytile && this.tileset.isTileCollidable(res.ytile.tileId)) {
				res.y = pv.y || 1;
				res.yprop = this.tileset.getTileProperties(res.ytile.tileId);
			} else { // right, y corner
				res.ytile = this.getTile((pv.x < 0) ? Math.ceil(obj.right - 1) : ~~obj.left, y);
				if (res.ytile && this.tileset.isTileCollidable(res.ytile.tileId)) {
					res.y = pv.y || 1;
					res.yprop = this.tileset.getTileProperties(res.ytile.tileId);
				}
			}
		}
		// return the collide object
		return res;
	},

	collide : function (obj) {
		var result = null;
		
		for (var i in players) {
			var player = players[i];
			if (player !== obj) {
				// if return value != null, we have a collision
				if (result = player.checkCollision(obj)) {
					// stop the loop return the value
					break;
				}
			}
		}

		return result;
	},

	applyFriction : function(v, f) {
		return (v+f<0)?v+(f*timer.tick):(v-f>0)?v-(f*timer.tick):0;
	}
});

module.exports = new game();