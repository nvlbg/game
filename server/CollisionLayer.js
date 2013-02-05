require('./Util.js');

var CollisionLayer = Object.extend({
	width: 0,
	height: 0,
	tileWidth: 0,
	tileHeight: 0,
	realWidth: 0,
	realHeight: 0,

	collisionData: null,

	solidgid: 0,
	watergid: 0,
	
	init : function(map) {
		this.width = parseInt(map.width, 10);
		this.height = parseInt(map.height, 10);
		this.tileWidth = parseInt(map.tilewidth, 10);
		this.tileHeight = parseInt(map.tileheight, 10);

		this.realWidth = this.width * this.tileWidth;
		this.realHeight = this.height * this.tileHeight;

		this.collisionData = new Array(this.width);

		var tilesets = map.tilesets,
			layers = map.layers;

		var i, len, tileset, layer;
		for (i = 0, len = tilesets.length; i < len; i++) {
			tileset = tilesets[i];

			this.iterateTileset(tileset.firstgid, tileset.tileproperties);
		}

		for (i = 0, len = layers.length; i < len; i++) {
			layer = layers[i];

			this.iterateLayer(layer.name, layer.data);
		}
	},

	iterateTileset: function(firstgid, properties) {
		if (properties === undefined) {
			return;
		}

		var i, prop;
		for (i in properties) {
			prop = properties[i];

			if(prop && prop.type) {
				if (prop.type === 'solid') {
					this.solidgid = firstgid + parseInt(i, 10);
				} else if (prop.type === 'water') {
					this.watergid = firstgid + parseInt(i, 10);
				}
			}
		}
	},

	iterateLayer: function(name, data) {
		if(!name.toLowerCase().contains('collision')) {
			return;
		}

		var i = 0, x = 0, y = 0;
		for (; x < this.width; x++) {
			this.collisionData[x] = new Array(this.height);
			for (y = 0; y < this.height; y++) {
				this.collisionData[x][y] = data[i++];
			}
		}
	},

	getGid: function(x, y) {
		return this.collisionData[~~(x / this.tileWidth)][~~(y / this.tileHeight)];
	},

	// for debugging purposes
	print : function() {
		var s = '';
		for(var x = 0; x < this.collisionData.length; x++) {
			s = '[ ';
			for(var y = 0; y < this.collisionData[x].length; y++) {
				if (this.collisionData[x][y] === this.solidgid) {
					s += 'S ';
				} else if (this.collisionData[x][y] === this.watergid) {
					s += 'W ';
				} else {
					s += '  ';
				}
			}
			s += ']';
			console.log(s);
		}
	}
});

module.exports = CollisionLayer;