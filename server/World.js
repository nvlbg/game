require('./Util.js');

var Vector2d = require('./Vector2d.js');
var Rect = require('./Rect.js');
var CollisionLayer = require('./CollisionLayer.js');

var World = Object.extend({
	collisionLayer : null,

	init : function (map_json) {
		this.collisionLayer = new CollisionLayer(map_json);
	},

	checkCollision : function (obj, pv) {
		var x = (pv.x < 0) ? ~~(obj.left + pv.x) : Math.ceil(obj.right  - 1 + pv.x);
		var y = (pv.y < 0) ? ~~(obj.top  + pv.y) : Math.ceil(obj.bottom - 1 + pv.y);

		//to return tile collision detection
		var res = {
			x : 0, // !=0 if collision on x axis
			xtile : undefined,
			y : 0, // !=0 if collision on y axis
			ytile : undefined
		};
		
		if (x <= 0 || x >= this.collisionLayer.realWidth) {
			res.x = pv.x;
		} else if (pv.x !== 0 ) {
			res.xtile = this.collisionLayer.getGid(x, Math.ceil(obj.bottom - 1));
			if (res.xtile && res.xtile > 0) {
				res.x = pv.x;
			} else {
				res.xtile = this.collisionLayer.getGid(x, ~~obj.top);
				if (res.xtile && res.xtile > 0) {
					res.x = pv.x;
				}
			}
		}
		
		if (y <= 0 || y >= this.collisionLayer.realHeight) {
			res.y = pv.y;
		} else if ( pv.y !== 0 ) {
			res.ytile = this.collisionLayer.getGid((pv.x < 0) ? ~~obj.left : Math.ceil(obj.right - 1), y);
			if (res.ytile && res.ytile > 0) {
				res.y = pv.y;
			} else {
				res.ytile = this.collisionLayer.getGid((pv.x < 0) ? Math.ceil(obj.right - 1) : ~~obj.left, y);
				if (res.ytile && res.ytile > 0) {
					res.y = pv.y;
				}
			}
		}

		// return the collide object
		return res;
	},

	applyFriction : function(v, f) {
		return (v+f<0)?v+(f*Game.timer.tick):(v-f>0)?v-(f*Game.timer.tick):0;
	}
});

module.exports = World;
