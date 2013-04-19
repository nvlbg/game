(function() {
	var ENUM = {
		TYPE : {
			GUEST_LOGIN         : 0,
			LOGIN               : 1,
			REGISTER            : 2,
			SPAWN_REQUEST       : 3,
			SPAWN               : 4,
			NEW_PLAYER          : 5,
			INPUT               : 6,
			CORRECTION          : 7,
			PLAYER_DISCONNECTED : 8,
			PRESSED             : 9,
			SEQUENCE_NUMBER     : 10,
			LOCAL_TIME          : 11,
			SMARTPHONE_CONNECT  : 12,
			SMARTPHONE_REQUEST  : 13,
			SMARTPHONE_AUTH     : 14,
			UPDATE              : 15,
			PING                : 16,
			PING_REQUEST        : 17,
			FAKE_LATENCY_CHANGE : 18,
			CHAT_MESSAGE        : 19,

			GUEST_LOGIN_ANSWER  : 20,
			LOGIN_ANSWER        : 21,
			REGISTER_ANSWER     : 22
		},

		LOGIN : {
			SUCCESS: 0,
			FAIL: 1,
			USER_EXISTS: 2,
			USER_NOT_FOUND: 3,
			UNDEFINED: 4
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
		},

		SMARTPHONE : {
			ACCEPTED: 0,
			DECLINED: 1,
			NO_SUCH_USER: 2
		}
	};

	if (typeof module !== 'undefined') { // server side
		module.exports = ENUM;
	} else {                             // clients and smarthphones
		window.ENUM = ENUM;
	}
})();
