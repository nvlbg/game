require('./Util.js');

var Vector2d = Object.extend(
/** @scope me.Vector2d.prototype */
{
	/**
	 * x value of the vector
	 * @public
	 * @type Number
	 * @name me.Vector2d#x
	 */
	x : 0,
	/**
	 * y value of the vector
	 * @public
	 * @type Number
	 * @name me.Vector2d#y
	 */
	y : 0,

	/** @private */
	init : function(/**Int*/ x, /**Int*/ y) {
		this.x = x || 0;
		this.y = y || 0;
	},

	set : function(/**Int*/ x, /**Int*/ y) {
		this.x = x;
		this.y = y;
	},

	setZero : function() {
		this.set(0, 0);

	},

	setV : function(/**me.Vector2d*/ v) {
		this.x = v.x;
		this.y = v.y;
	},

	add : function(/**me.Vector2d*/ v) {
		this.x += v.x;
		this.y += v.y;
	},

	sub : function(/**me.Vector2d*/ v) {
		this.x -= v.x;
		this.y -= v.y;
	},

	scale : function(/**me.Vector2d*/ v) {
		this.x *= v.x;
		this.y *= v.y;
	},

	div : function(/**Int*/	n) {
		this.x /= n;
		this.y /= n;
	},

	abs : function() {
		if (this.x < 0) {
			this.x = -this.x;
		}
		if (this.y < 0) {
			this.y = -this.y;
		}
	},

	/** @return {me.Vector2D} */
	clamp : function(low, high) {
		return new Vector2d(this.x.clamp(low, high), this.y.clamp(low, high));
	},
	
	clampSelf : function(low, high) {
		this.x = this.x.clamp(low, high);
		this.y = this.y.clamp(low, high);
		return this;
	},

	minV : function(/**me.Vector2d*/ v) {
		this.x = this.x < v.x ? this.x : v.x;
		this.y = this.y < v.y ? this.y : v.y;
	},

	maxV : function(/**me.Vector2d*/ v) {
		this.x = this.x > v.x ? this.x : v.x;
		this.y = this.y > v.y ? this.y : v.y;
	},
	
	/** @return {me.Vector2D} New Vector2d */
	floor : function() {
		return new Vector2d(~~this.x, ~~this.y);
	},
	
	/** @return {me.Vector2D} New Vector2d */
	floorSelf : function() {
		this.x = ~~this.x;
		this.y = ~~this.y;
		return this;
	},
	
	/** @return {me.Vector2D} New Vector2d */
	ceil : function() {
		return new Vector2d(Math.ceil(this.x), Math.ceil(this.y));
	},
	
	/** @return {me.Vector2D} New Vector2d */
	ceilSelf : function() {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		return this;
	},

	/** @return {me.Vector2D} New Vector2d */
	negate : function() {
		return new Vector2d(-this.x, -this.y);
	},

	negateSelf : function() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	},

	//copy() copies the x,y values of another instance to this
	copy : function(/**me.Vector2d*/ v) {
		this.x = v.x;
		this.y = v.y;
	},
	
	// return true if two vectors are the same
	equals : function(/**me.Vector2d*/ v) {
		return ((this.x === v.x) && (this.y === v.y));
	},

	/** @return {int} */
	length : function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},

	normalize : function() {
		var len = this.length();
		// some limit test
		if (len < Number.MIN_VALUE) {
			return 0.0;
		}
		var invL = 1.0 / len;
		this.x *= invL;
		this.y *= invL;
		return len;
	},

	/** @return {int} */
	dotProduct : function(/**me.Vector2d*/ v) {
		return this.x * v.x + this.y * v.y;
	},

	/** @return {int} */
	distance : function(/**me.Vector2d*/ v) {
		return Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y));
	},

	/** @return {me.Vector2d} */
	clone : function() {
		return new Vector2d(this.x, this.y);
	},

	/** @return {String} */
	toString : function() {
		return 'x:' + this.x + 'y:' + this.y;
	}

});

module.exports = Vector2d;