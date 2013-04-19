(function() {

	window.game.Chat = {
		// members
		chat: null,
		msg_box: null,
		msg_form: null,
		msg_input: null,
		username: '',

		// initialization
		init: function() {
			this.chat = $('#chat');
			this.msg_box = $('#messages');
			this.msg_form = this.chat.find('form');
			this.msg_input = this.msg_form.find('input[type=text]');
			this.username = window.game.network.player.nickname;

			this.msg_input.focusin(function() {
				me.input.unbindKey(me.input.KEY.UP   );
				me.input.unbindKey(me.input.KEY.RIGHT);
				me.input.unbindKey(me.input.KEY.DOWN );
				me.input.unbindKey(me.input.KEY.LEFT );
				me.input.unbindKey(me.input.KEY.SPACE);
			});

			this.msg_input.focusout(function() {
				me.input.bindKey(me.input.KEY.UP,    "up"   );
				me.input.bindKey(me.input.KEY.RIGHT, "right");
				me.input.bindKey(me.input.KEY.DOWN,  "down" );
				me.input.bindKey(me.input.KEY.LEFT,  "left" );
				me.input.bindKey(me.input.KEY.SPACE, "shoot");
			});

			this.msg_form.submit(this.onNewMessage.bind(this));
			window.game.network.socket.on(window.game.ENUM.TYPE.CHAT_MESSAGE, this.onNewMessageRecieved.bind(this));

			this.chat.show();
		},

		// methods
		formatMessage: function(timestamp, username, msg, cls) {
			this.msg_box.append( 
								  $(
									'<p class="' + cls + '">' +
									'	<span class="msg_time">[' + timestamp + ']</span>' +
									'	<span class="msg_sender">' + username + '</span>:' +
									'	<span class="msg_message">' + msg + '</span>' +
									'</p>'
								  ) 
								);
		},

		escapeHtml: function(text) {
			return text
					.replace(/&/g, "&amp;")
					.replace(/</g, "&lt;")
					.replace(/>/g, "&gt;")
					.replace(/"/g, "&quot;")
					.replace(/'/g, "&#039;");
		},

		// events
		onNewMessage: function(e) {
			e.preventDefault();

			var msg = $.trim( this.msg_input.val() );

			if (msg.length === 0 || msg.length > 100) {
				return;
			}

			this.msg_input.val('');

			msg = this.escapeHtml(msg);
			window.game.network.socket.emit(window.game.ENUM.TYPE.CHAT_MESSAGE, msg);

			this.formatMessage(new Date().toLocaleTimeString(), this.username, msg, 'message_user');
		},

		onNewMessageRecieved: function(msg) {
			var timestamp = new Date().toLocaleTimeString();
			var username = msg.length === 2 ? msg[1] : 'System';
			var message = msg[0];
			var cls = username === 'System' ? 'message_system' : 'message_user';

			this.formatMessage(timestamp, username, message, cls);
		}
	};

})();
