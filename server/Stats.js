var db = global.DB;

var Stats = {
	onError: function(err, updated) {
		if (err || !updated) {
			console.log('ERROR: I couldn\'t update a record');
		}
	},

	// setters/updators
	addKill: function(player) {
		if (player.mongoId === -1) {
			return;
		}

		player.metaStats.killStreak += 1;
		db.users.update({_id:player.mongoId}, { $inc: { kills: 1 } }, this.onError);
	},

	addDeath: function(player) {
		if (player.mongoId === -1) {
			return;
		}

		db.update.find({_id:player.mongoId}, function(err, user) {
			if (err) {
				console.log('ERROR: I couldn\'t read a record');
				return;
			}

			if (player.metaStats.killStreak > user.highest_killstreak) {
				db.users.update({_id:player.mongoId},
								{ $set: {highest_killstreak:player.metaStats.killStreak} },
								function(err, updated) {
					if (err || !updated) {
						console.log('ERROR: I couldn\'t update a record');
						return;
					}

					player.metaStats.killStreak = 0;
				});
			} else {
				player.metaStats.killStreak = 0;
			}
		});

		db.users.update({_id:player.mongoId}, { $inc: { deaths: 1 } }, this.onError);
	},

	updateTime: function(player) {
		if (player.mongoId === -1) {
			return;
		}

		var timePlayed = new Date().getTime() - player.metaStats.startTime;

		db.users.find({_id:player.mongoId}, function(err, user) {
			if (err) {
				console.log('ERROR: I couldn\'t read a record');
				return;
			}

			if (timePlayed > user.longest_time_played) {
				db.users.update({_id:player.mongoId},
								{ $set: {longest_time_played: timePlayed} },
								this.onError);
			}
		});

		db.users.update({_id:player.mongoId}, { $inc: timePlayed }, this.onError);
	},

	setSmartphoneControllerUsed: function(player) {
		if (player.mongoId === -1) {
			return;
		}

		db.users.update({_id:player.mongoId}, { $set : {smartphone_used: true} });
	},

	// getters
	getKills: function(player) {
		if (player.mongoId === -1) {
			return;
		}

		db.users.find({_id:player.mongoId}, function(err, user) {
			if (user && user.kills) {
				return user.kills;
			}
			return -1;
		});
	},

	getDeaths: function(player) {
		if (player.mongoId === -1) {
			return;
		}

		db.users.find({_id:player.mongoId}, function(err, user) {
			if (user && user.deaths) {
				return user.deaths;
			}
			return -1;
		});
	},

	getHighestKillstreak: function(player) {
		if (player.mongoId === -1) {
			return;
		}

		db.users.find({_id:player.mongoId}, function(err, user) {
			if (user && user.highest_killstreak) {
				return Math.max(user.highest_killstreak, player.metaStats.killStreak);
			}
			return -1;
		});
	},

	getTimePlayed: function(player) {
		if (player.mongoId === -1) {
			return;
		}

		var sessionDuration = new Date().getTime() - player.metaStats.startTime;

		db.users.find({_id:player.mongoId}, function(err, user) {
			if (user && user.time_played) {
				return user.time_played + sessionDuration;
			}
			return -1;
		});
	},

	getLongestTimePlayed: function(player) {
		if (player.mongoId === -1) {
			return;
		}

		var sessionDuration = new Date().getTime() - player.metaStats.startTime;

		db.users.find({_id:player.mongoId}, function(err, user) {
			if (user && user.longest_time_played) {
				return Math.max(user.longest_time_played, sessionDuration);
			}
			return -1;
		});
	},

	getSmartphoneControllerUsed: function(player) {
		if (player.mongoId === -1) {
			return;
		}

		db.users.find({_id:player.mongoId}, function(err, user) {
			if (user && user.smartphone_used) {
				return user.smartphone_used;
			}
			return -1;
		});
	}
};

module.exports = Stats;
