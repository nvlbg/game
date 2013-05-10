(function() {

	window.game.Chat = {
		// members
		win: null,
		chat: null,
		msg_box: null,
		msg_form: null,
		msg_input: null,
		username: '',

		// initialization
		init: function() {
			this.win = $( window );
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

			this.setSize();
			this.win.resize( this.setSize.bind(this) );
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

			(function() {
				this.msg_box[0].scrollTop = this.msg_box[0].scrollHeight;
			}.bind(this)).defer();
		},

		escapeHtml: function(text) {
			return text
					.replace(/&/g, "&amp;")
					.replace(/</g, "&lt;")
					.replace(/>/g, "&gt;")
					.replace(/"/g, "&quot;")
					.replace(/'/g, "&#039;");
		},

		setSize: function() {
			(function () {
				
				var width = this.win.width();
				var height = this.win.height();

				if (height > 770 || (width > 1100 && height > 130)) {
					this.chat.show();
				} else {
					this.chat.hide();
				}

				if (height > 770) {
					this.chat.css('height', (height - 640) + 'px');
					this.msg_input.css('width', (width - 138) + 'px' );
					this.msg_box.css('height', (height - 670) + 'px');
				} else if(height > 130 && width > 1100) {
					var chat_width = width - 860;

					this.chat.css('width', chat_width + 'px');
					this.msg_input.css('width', (chat_width - 138) + 'px');
					this.msg_box.css('width', chat_width + 'px');
				}

			}.bind(this)).defer();
			
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
			var username = msg.length === 2 ? window.game.network.players[ msg[1] ].nickname : 'System';
			var message = msg[0];
			var cls = username === 'System' ? 'message_system' : 'message_user';

			this.formatMessage(timestamp, username, message, cls);
		}
	};

})();
