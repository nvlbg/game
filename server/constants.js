exports.TYPE = {
	SPAWN_REQUEST       : 0,
	SPAWN               : 1,
	NEW_PLAYER          : 2,
	MOVE                : 3,
	PLAYER_UPDATED      : 4,
	CORRECTION          : 5,
	PLAYER_CORRECTION   : 6,
	PLAYER_DISCONNECTED : 7
};

exports.DIRECTION = {
	UP    : 0,
	DOWN  : 1,
	LEFT  : 2,
	RIGHT : 3
};

exports.TEAM = {
	BLUE  : 0,
	GREEN : 1
};

exports.PRESSED = {
	UP    : 1 << 0,
	DOWN  : 1 << 1,
	LEFT  : 1 << 2,
	RIGHT : 1 << 3
};

exports.MAP = 'water_hole';
exports.FPS = 60;
exports.PORT = 8080;
exports.CORRECTION_TIME_STEP = 3000;
exports.FRIENDLY_FIRE = false;