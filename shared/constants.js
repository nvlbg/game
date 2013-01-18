(function() {
	var ENUM = {
		TYPE : {
			SPAWN_REQUEST       : 0,
			SPAWN               : 1,
			NEW_PLAYER          : 2,
			INPUT               : 3,
			PLAYER_UPDATED      : 4,
			CORRECTION          : 5,
			PLAYER_CORRECTION   : 6,
			PLAYER_DISCONNECTED : 7,
			PRESSED             : 8,
			SEQUENCE_NUMBER     : 9,
			LOCAL_TIME          : 10,
			SMARTPHONE_CONNECT  : 11,
			SMARTPHONE_REQUEST  : 12,
			SMARTPHONE_ACCEPT   : 13
		},

		DIRECTION : {
			UP    : 0,
			DOWN  : 1,
			LEFT  : 2,
			RIGHT : 3
		},
		TEAM : {
			BLUE  : 0,
			GREEN : 1
		},
		PRESSED : {
			UP    : 1 << 0,
			DOWN  : 1 << 1,
			LEFT  : 1 << 2,
			RIGHT : 1 << 3
		}
	};

	if (typeof module !== 'undefined') { // server side
		module.exports = ENUM;
	} else {                             // clients and smarthphones
		window.ENUM = ENUM;
	}
})();
