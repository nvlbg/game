var initializing = false,
	fnTest = /\bparent\b/;

Object.extend = function(prop) {
	// _super rename to parent to ease code reading
	var parent = this.prototype;

	// Instantiate a base class (but only create the instance,
	// don't run the init constructor)
	initializing = true;
	var proto = new this();
	initializing = false;

	// Copy the properties over onto the new prototype
	for ( var name in prop) {
		// Check if we're overwriting an existing function
		proto[name] =   typeof prop[name] === "function" &&
						typeof parent[name] === "function" &&
						fnTest.test(prop[name]) ? (function(name, fn) {
			return function() {
				var tmp = this.parent;

				// Add a new ._super() method that is the same method
				// but on the super-class
				this.parent = parent[name];

				// The method only need to be bound temporarily, so we
				// remove it when we're done executing
				var ret = fn.apply(this, arguments);
				this.parent = tmp;

				return ret;
			};
		})(name, prop[name]) : prop[name];
	}

	// The dummy class constructor
	function Class() {
		if (!initializing && this.init) {
			this.init.apply(this, arguments);
		}
		//return this;
	}
	// Populate our constructed prototype object
	Class.prototype = proto;
	// Enforce the constructor to be what we expect
	Class.constructor = Class;
	// And make this class extendable
	Class.extend = Object.extend;//arguments.callee;

	return Class;
};


if (!Object.defineProperty) {
	/**
	 * simple defineProperty function definition (if not supported by the browser)<br>
	 * if defineProperty is redefined, internally use __defineGetter__/__defineSetter__ as fallback
	 * @param {Object} obj The object on which to define the property.
	 * @param {String} prop The name of the property to be defined or modified.
	 * @param {Object} desc The descriptor for the property being defined or modified.
	 */
	Object.defineProperty = function(obj, prop, desc) {
		// check if Object support __defineGetter function
		if (obj.__defineGetter__) {
			if (desc.get) {
				obj.__defineGetter__(prop, desc.get);
			}
			if (desc.set) {
				obj.__defineSetter__(prop, desc.set);
			}
		} else {
			// we should never reach this point....
			throw "Object.defineProperty not supported";
		}
	};
}

/**
 * add a clamp fn to the Number object
 * @extends Number
 * @return {Number} clamped value
 */
Number.prototype.clamp = function(low, high) {
	return this < low ? low : this > high ? high : +this;
};

/**
 * return a random between min, max
 * @param {Number} min minimum value.
 * @param {Number} max maximum value.
 * @extends Number
 * @return {Number} random value
 */
Number.prototype.random = function(min, max) {
	return (~~(Math.random() * (max - min + 1)) + min);
};

/**
 * add a contains fn to the string object
 * @extends String
 * @return {Boolean}
 */
String.prototype.contains = function(word) {
	return this.indexOf(word) > -1;
};
