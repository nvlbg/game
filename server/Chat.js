var fs = require('fs');
var constants = require('../shared/constants.json');
var log = fs.createWriteStream('chat.log', {'flags': 'a'});

// debug
var Bonus = require('./Bonus.js');
var Vector2d = require('./Vector2d.js');

var Chat = {
	// methods
	bindEventListeners: function(player) {
		player.socket.on(constants.TYPE.CHAT_MESSAGE, Chat.onNewMessage.bind(player));
	},

	// static methods
	broadcastMessage: function(message) {
		var i, data_packet = [message], players = global.Game.playersm;
		for (i in players) {
			players[i].socket.emit(constants.TYPE.CHAT_MESSAGE, data_packet);
		}
	},

	sendMessage: function(message, player) {
		var data_packet = [message];

		if (player && player.id) {
			data_packet[1] = player.id;
		}

		player.socket.emit(constants.TYPE.CHAT_MESSAGE, data_packet);
	},

	// events
	onNewMessage: function(message) {
		if (typeof message !== "string" || message.length === 0 || message.length > 100) {
			return;
		}

		// debug chat messages
		//TODO: remove this when in production
		if (message === '/bonus') {
			Game.bonuses[ Game.bonusIdCounter++ ] = new Bonus( new Vector2d(300, 300), Number.prototype.random(0, 3), 2500 );
			return;
		}

		log.write('[' + new Date().toLocaleString() + '] ' + this.nickname + ': ' + message + '\n');

		var i, data_packet = [message, this.id], players = global.Game.players;
		for (i in players) {
			if (players[i] === this) {
				continue;
			}

			players[i].socket.emit(constants.TYPE.CHAT_MESSAGE, data_packet);
		}
	}
};

module.exports = Chat;
