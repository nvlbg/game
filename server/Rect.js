require('./Util.js');
var Vector2d = require('./Vector2d.js');

var Rect = Object.extend(
/** @scope me.Rect.prototype */
{
	/**
	 * position of the Rectange
	 * @public
	 * @type me.Vector2d
	 * @name me.Rect#pos
	 */
	pos : null,

	/**
	 * allow to reduce the collision box size<p>
	 * while keeping the original position vector (pos)<p>
	 * corresponding to the entity<p>
	 * colPos is a relative offset to pos
	 * @private
	 * @type me.Vector2d
	 * @name me.Rect#colPos
	 * @see me.Rect#adjustSize
	 */
	colPos : null,

	/**
	 * width of the Rectange
	 * @public
	 * @type Int
	 * @name me.Rect#width
	 */
	width : 0,
	/**
	 * height of the Rectange
	 * @public
	 * @type Int
	 * @name me.Rect#height
	 */
	height : 0,

	// half width/height
	hWidth : 0,
	hHeight : 0,
	
	
	/** @private */
	init : function(v, w, h) {
		// reference to the initial position
		// we don't copy it, so we can use it later
		this.pos = v;

		// allow to reduce the hitbox size
		// while on keeping the original pos vector
		// corresponding to the entity
		this.colPos = new Vector2d();

		this.width = w;
		this.height = h;

		// half width/height
		this.hWidth = ~~(w / 2);
		this.hHeight = ~~(h / 2);

		
		// some properties to ease my life when getting the rectangle coordinates /**
		/**
		 * left coordinate of the Rectange<br>
		 * takes in account the adjusted size of the rectangle (if set)
		 * @public
		 * @type Int
		 * @name me.Rect#left
		 */
		Object.defineProperty(this, "left", {
			get : function() {
				return this.pos.x;
			},
			configurable : true
		});
		/**
		 * right coordinate of the Rectange<br>
		 * takes in account the adjusted size of the rectangle (if set)
		 * @public
		 * @type Int
		 * @name me.Rect#right
		 */
		Object.defineProperty(this, "right", {
			get : function() {
				return this.pos.x + this.width;
			},
			configurable : true
		});
		/**
		 * top coordinate of the Rectange<br>
		 * takes in account the adjusted size of the rectangle (if set)
		 * @public
		 * @type Int
		 * @name me.Rect#top
		 */
		Object.defineProperty(this, "top", {
			get : function() {
				return this.pos.y;
			},
			configurable : true
		});
		/**
		 * bottom coordinate of the Rectange<br>
		 * takes in account the adjusted size of the rectangle (if set)
		 * @public
		 * @type Int
		 * @name me.Rect#bottom
		 */
		Object.defineProperty(this, "bottom", {
			get : function() {
				return this.pos.y + this.height;
			},
			configurable : true
		});

	},

	/**
	 * set new value to the rectangle
	 * @param {me.Vector2d} v x,y position for the rectangle
	 * @param {int} w width of the rectangle
	 * @param {int} h height of the rectangle	 
	 */
	set : function(v, w, h) {
		this.pos = v; // Vector2d - top left corner

		this.width = w;
		this.height = h;
		
		this.hWidth = ~~(w / 2);
		this.hHeight = ~~(h / 2);
	},

	/**
	 * return a new Rect with this rectangle coordinates
	 * @return {me.Rect} new rectangle	
	 */
	getRect : function() {
		return new Rect(this.pos.clone(), this.width,
				this.height);
	},

	/**
	 * merge this rectangle with another one
	 * @param {me.Rect} rect other rectangle to union with
	 * @return {me.Rect} the union(ed) rectangle	 
	 */
	union : function(/** {me.Rect} */ r) {
		var x1 = Math.min(this.pos.x, r.pos.x);
		var y1 = Math.min(this.pos.y, r.pos.y);

		this.width = Math.ceil(Math.max(this.pos.x + this.width,
				r.pos.x + r.width)
				- x1);
		this.height = Math.ceil(Math.max(this.pos.y + this.height,
				r.pos.y + r.height)
				- y1);
		this.pos.x = ~~x1;
		this.pos.y = ~~y1;

		return this;
	},

	/**
	 * update the size of the collision rectangle<br>
	 * the colPos Vector is then set as a relative offset to the initial position (pos)<br>
	 * <img src="me.Rect.colpos.png"/>
	 * @private
	 * @param {int} x x offset (specify -1 to not change the width)
	 * @param {int} w width of the hit box
	 * @param {int} y y offset (specify -1 to not change the height)
	 * @param {int} h height of the hit box
	 */
	adjustSize : function(x, w, y, h) {
		if (x != -1) {
			this.colPos.x = x;
			this.width = w;
			this.hWidth = ~~(this.width / 2);
			
			// avoid Property definition if not necessary
			if (this.left !== this.pos.x + this.colPos.x) {
				// redefine our properties taking colPos into account
				Object.defineProperty(this, "left", {
					get : function() {
						return this.pos.x + this.colPos.x;
					},
					configurable : true
				});
			}
			if (this.right !== this.pos.x + this.colPos.x + this.width) {
				Object.defineProperty(this, "right", {
					get : function() {
						return this.pos.x + this.colPos.x + this.width;
					},
					configurable : true
				});
			}
		}
		if (y != -1) {
			this.colPos.y = y;
			this.height = h;
			this.hHeight = ~~(this.height / 2);
			
			// avoid Property definition if not necessary
			if (this.top !== this.pos.y + this.colPos.y) {
				// redefine our properties taking colPos into account
				Object.defineProperty(this, "top", {
					get : function() {
						return this.pos.y + this.colPos.y;
					},
					configurable : true
				});
			}
			if (this.bottom !== this.pos.y + this.colPos.y + this.height) {
				Object.defineProperty(this, "bottom", {
					get : function() {
						return this.pos.y + this.colPos.y + this.height;
					},
					configurable : true
				});
			}
		}
	},

	/**
	 *	
	 * flip on X axis
	 * usefull when used as collision box, in a non symetric way
	 * @private
	 * @param sw the sprite width
	 */
	flipX : function(sw) {
		this.colPos.x = sw - this.width - this.colPos.x;
		this.hWidth = ~~(this.width / 2);
	},

	/**
	 *	
	 * flip on Y axis
	 * usefull when used as collision box, in a non symetric way
	 * @private
	 * @param sh the height width
	 */
	flipY : function(sh) {
		this.colPos.y = sh - this.height - this.colPos.y;
		this.hHeight = ~~(this.height / 2);
	},

	/**
	 * check if this rectangle is intersecting with the specified one
	 * @param  {me.Rect} rect
	 * @return {boolean} true if overlaps
	 */
	overlaps : function(r)	{
		return (this.left < r.right && 
				r.left < this.right && 
				this.top < r.bottom &&
				r.top < this.bottom);
	},
	
	/**
	 * check if this rectangle is within the specified one
	 * @param  {me.Rect} rect
	 * @return {boolean} true if within
	 */
	within: function(r) {
		return (r.left <= this.left && 
			    r.right >= this.right &&
			    r.top <= this.top && 
				r.bottom >= this.bottom);
    },
	
	/**
	 * check if this rectangle contains the specified one
	 * @param  {me.Rect} rect
	 * @return {boolean} true if contains
	 */
	contains: function(r) {
		return (r.left >= this.left && 
				r.right <= this.right &&
				r.top >= this.top && 
				r.bottom <= this.bottom);
    },
	
	/**
	 * check if this rectangle contains the specified point
	 * @param  {me.Vector2d} point
	 * @return {boolean} true if contains
	 */
	containsPoint: function(v) {
		return  (v.x >= this.left && v.x <= this.right && 
				(v.y >= this.top) && v.y <= this.bottom)
	},


	/**
	 * AABB vs AABB collission dectection<p>
	 * If there was a collision, the return vector will contains the following values: 
	 * @example
	 * if (v.x != 0 || v.y != 0)
	 * { 	
	 *   if (v.x != 0)
	 *   {
	 *      // x axis
	 *      if (v.x<0)
	 *         console.log("x axis : left side !");
	 *      else
	 *         console.log("x axis : right side !");
	 *   }
	 *   else
	 *   {
	 *      // y axis
	 *      if (v.y<0)
	 *         console.log("y axis : top side !");
	 *      else
	 *         console.log("y axis : bottom side !");			
	 *   }
	 *		
	 * }
	 * @private
	 * @param {me.Rect} rect
	 * @return {me.Vector2d} 
	 */
	collideVsAABB : function(/** {me.Rect} */ rect) {
		// response vector
		var p = new Vector2d(0, 0);

		// check if both box are overlaping
		if (this.overlaps(rect)) {
			// compute delta between this & rect
			var dx = this.left + this.hWidth  - rect.left - rect.hWidth;
			var dy = this.top  + this.hHeight - rect.top  - rect.hHeight;

			// compute penetration depth for both axis
			p.x = (rect.hWidth + this.hWidth) - (dx < 0 ? -dx : dx); // - Math.abs(dx);
			p.y = (rect.hHeight + this.hHeight)
					- (dy < 0 ? -dy : dy); // - Math.abs(dy);

			// check and "normalize" axis
			if (p.x < p.y) {
				p.y = 0;
				p.x = dx < 0 ? -p.x : p.x;
			} else {
				p.x = 0;
				p.y = dy < 0 ? -p.y : p.y;
			}
		}
		return p;
	}
});

module.exports = Rect;