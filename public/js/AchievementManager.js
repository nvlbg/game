(function() {
	
	window.game.AchievementManager = {
		init: function(socket) {
			toastr.options = {
				fadeIn: 500,
				fadeOut: 500,
				timeOut: 10000,
				extendedTimeOut: 5000,
				tapToDismiss: false
			};

			socket.on(game.ENUM.TYPE.ACHIEVEMENT_UNLOCKED, this.onNewAchievement.bind(socket));
		},

		// events
		onNewAchievement: function(achievement) {
			toastr.success(achievement.message, '<h3>' + achievement.title + '</h3>');
		}
	};

})();
