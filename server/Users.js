var constants = require('../shared/constants.json');
var db = null;
var bcrypt = require('bcrypt');

var Users = {
	// members
	guest_counter: 0,

	// methods
	bindEventListeners: function(socket) {
		if (db === null) {
			db = global.DB;
		}

		socket.on(constants.TYPE.GUEST_LOGIN, Users.onGuestLogin.bind(socket));
		socket.on(constants.TYPE.LOGIN, Users.onLoginAttempt.bind(socket));
		socket.on(constants.TYPE.REGISTER, Users.onRegisterAttempt.bind(socket));
	},

	onError: function(socket, answer_type) {
		socket.emit(answer_type, constants.LOGIN.UNDEFINED);
	},

	// events
	onGuestLogin: function() {
		Users.guest_counter += 1;
		this.set('nickname', 'Guest' + ('0000' + Users.guest_counter).slice(-4), function() {
			this.emit(constants.TYPE.GUEST_LOGIN_ANSWER, constants.LOGIN.SUCCESS);
		}.bind(this));
	},

	onLoginAttempt: function(data) {
		var username = data.username;
		var password = data.password;

		if (username.length < 4 || username.length > 16 || password.length < 6) {
			return;
		}

		if (!/[a-zA-Z0-9_]{4,16}/.test(username)) {
			return;
		}

		db.users.find({username:username}, function(err, user) {
			if (err || user.length > 1) { Users.onError(this, constants.TYPE.LOGIN_ANSWER); return; }
			if (user.length === 0) {
				this.emit(constants.TYPE.LOGIN_ANSWER, constants.LOGIN.USER_NOT_FOUND);
				return;
			}

			// check if user is currently playing
			if ( global.Game.isUsernamePlaying(username) ) {
				this.emit(constants.TYPE.LOGIN_ANSWER, constants.LOGIN.USER_PLAYING);
				return;
			}

			bcrypt.compare(password, user[0].password, function(err, res) {
				if (err) { Users.onError(this, constants.TYPE.LOGIN_ANSWER); return; }
				if (res === false) {
					this.emit(constants.TYPE.LOGIN_ANSWER, constants.LOGIN.FAIL);
					return;
				}

				this.set('nickname', username, function() {
					this.set('mongo_id', user[0]._id, function() {
						this.emit(constants.TYPE.LOGIN_ANSWER, constants.LOGIN.SUCCESS);
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	},

	onRegisterAttempt: function(data) {
		var username = data.username;
		var password = data.password;

		if (username.length < 4 || username.length > 16 || password.length < 6) {
			return;
		}

		if (!/[a-zA-Z0-9_]{4,16}/.test(username)) {
			return;
		}

		db.users.find({username:username}, function(err, users) {
			if (err) { Users.onError(this, constants.TYPE.REGISTER_ANSWER); return; }

			if (users.length > 0) {
				this.emit(constants.TYPE.REGISTER_ANSWER, constants.LOGIN.USER_EXISTS);
				return;
			}

			// register
			bcrypt.genSalt(10, function(err, salt) {
				if (err) { Users.onError(this, constants.TYPE.REGISTER_ANSWER); return; }

				bcrypt.hash(password, salt, function(err, hash) {
					if (err) { Users.onError(this, constants.TYPE.REGISTER_ANSWER); return; }

					db.users.save({username:username,
								   password:hash,
								   ip_address: this.handshake.address.address,
								   kills:0,
								   deaths:0,
								   friendlyKills:0,
								   friendlyDeaths:0,
								   highest_killstreak:0,
								   time_played:0,
								   longest_time_played:0,
								   smartphone_used:false}, function(err, saved) {
						if (err || !saved) { Users.onError(this, constants.TYPE.REGISTER_ANSWER); return; }

						this.emit(constants.TYPE.REGISTER_ANSWER, constants.LOGIN.SUCCESS);
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	}

};

module.exports = Users;
