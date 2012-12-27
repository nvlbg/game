var fps = require('./constants.js').fps;
var timer = (function() {
	// hold public stuff in our api
	var api = {};

	/*---------------------------------------------
		
		PRIVATE STUFF
			
		---------------------------------------------*/

	//hold element to display fps
	var framecount = 0;
	var framedelta = 0;

	/* fps count stuff */
	var last = 0;
	var now = 0;
	var delta = 0;
	var step = Math.ceil(1000 / fps); // ROUND IT ?
	// define some step with some margin
	var minstep = (1000 / fps) * 1.25; // IS IT NECESSARY?

	/*---------------------------------------------
		
		PUBLIC STUFF
			
		---------------------------------------------*/

	/**
	 * last game tick value
	 * @public
	 * @type {Int}
	 * @name me.timer#tick
	 */
	api.tick = 1.0;

	/* ---
	
		init our time stuff
		
		---							*/
	api.init = function() {
		// set to "now"
		now = last = Date.now();
		// reset delta counting variables
		framedelta = 0;
		framecount = 0;

		return true;
	};

	/**
	 * return the current time
	 * @name me.timer#getTime
	 * @return {Date}
	 * @function
	 */
	api.getTime = function() {
		return now;
	};

	/* ---
	
		update game tick
		should be called once a frame
		
		---                           */
	api.update = function() {
		last = now;
		now = Date.now();

		delta = (now - last);

		// get the game tick
		api.tick = (delta > minstep) ? delta / step	: 1;
	};

	// return our apiect
	return api;

})();

module.exports = timer;