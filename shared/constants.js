(function() {
	var ENUM = {
		TYPE : {
			SPAWN_REQUEST       : 0,
			SPAWN               : 1,
			NEW_PLAYER          : 2,
			INPUT               : 3,
			CORRECTION          : 4,
			PLAYER_DISCONNECTED : 5,
			PRESSED             : 6,
			SEQUENCE_NUMBER     : 7,
			LOCAL_TIME          : 8,
			SMARTPHONE_CONNECT  : 9,
			SMARTPHONE_REQUEST  : 10,
			SMARTPHONE_ACCEPT   : 11,
			UPDATE              : 12,
			PING                : 13,
			PING_REQUEST        : 14,
			FAKE_LATENCY_CHANGE : 15
		},

		POSITION : {
			X : 0,
			Y : 1
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
