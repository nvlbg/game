require('./Util.js');
var constants = require('./constants.js');

var Vector2d = require('./Vector2d.js');
var Rect = require('./Rect.js');

var World = Object.extend({
	
	collision_data : null,
	width : 0,
	height : 0,
	tilewidth : 0,
	tileheight : 0,
	realwidth : 0,
	realheight : 0,

	init : function (map_json) {
		this.width = parseInt(map_json['width']);
		this.height = parseInt(map_json['height']);
		this.tilewidth = parseInt(map_json['tilewidth']);
		this.tileheight = parseInt(map_json['tileheight']);
		this.realwidth = this.width * this.tilewidth;
		this.realheight = this.height * this.tileheight;

		this.collision_data = new Array (this.width);

		var x, y, i, len, firstgid = 0, layer = null;
		for (i = 0, len = map_json['tilesets'].length; i < len; i++) {
			if (map_json['tilesets'][i]['name'].toLowerCase().contains('metatiles')) {
				firstgid = map_json['tilesets'][i]['firstgid'];
				break;
			}
		}
		if (firstgid === 0) {
			throw "No metatiles found";
		}

		for (i = 0, len = map_json['layers'].length; i < len; i++) {
			if (map_json['layers'][i]['name'].toLowerCase().contains('collision')) {
				layer = map_json['layers'][i]['data'];
				break;
			}
		}
		if (layer === null) {
			throw "No collision layer found";
		}

		for (i = 0, x = 0; x < this.width; x++) {
			this.collision_data[x] = new Array(this.height);
			for (y = 0; y < this.height; y++) {
				var n = layer[i++];
				this.collision_data[x][y] = n === 0 ? 0 : (n + 1) - firstgid;
			}
		}

		/* print collision_data (for debugging)
		var s = '';
		for(x = 0; x < this.collision_data.length; x++) {
			s = '[';
			for(y = 0; y < this.collision_data[x].length; y++) {
				s += this.collision_data[x][y] + ',';
			}
			s += ']';
			console.log(s);
		}
		*/
	},

	checkCollision : function (obj, pv) {
		var x = (pv.x < 0) ? ~~(obj.left + pv.x) : Math.ceil(obj.right  - 1 + pv.x);
		var y = (pv.y < 0) ? ~~(obj.top  + pv.y) : Math.ceil(obj.bottom - 1 + pv.y);
		//to return tile collision detection
		var res = {
			x : 0, // !=0 if collision on x axis
			xtile : undefined,
			y : 0, // !=0 if collision on y axis
			ytile : undefined,
		};
		
		if (x <= 0 || x >= this.realwidth) {
			res.x = pv.x;
		} else if (pv.x != 0 ) {
			res.xtile = this.collision_data[~~(x / this.tilewidth)][~~(Math.ceil(obj.bottom - 1) / this.tileheight)];
			if (res.xtile !== 0) {
				res.x = pv.x;
			} else {
				res.xtile = this.collision_data[~~(x / this.tilewidth)][~~((~~obj.top) / this.tileheight)];
				if (res.xtile !== 0) {
					res.x = pv.x;
				}
			}
		}
		
		if (y <= 0 || y >= this.realheight) {
			res.y = pv.y;
		} else if ( pv.y != 0 ) {
			res.ytile = this.collision_data[~~(((pv.x < 0) ? ~~obj.left : Math.ceil(obj.right - 1)) / this.tilewidth)][~~(y / this.tileheight)];
			if (res.ytile !== 0) {
				res.y = pv.y;
			} else {
				res.ytile = this.collision_data[~~(((pv.x < 0) ? Math.ceil(obj.right - 1) : ~~obj.left) / this.tilewidth)][~~(y / this.tileheight)];
				if (res.ytile !== 0) {
					res.y = pv.y;
				}
			}
		}
		// return the collide object
		return res;
	},

	applyFriction : function(v, f) {
		return (v+f<0)?v+(f*timer.tick):(v-f>0)?v-(f*timer.tick):0;
	}
});

module.exports = World;