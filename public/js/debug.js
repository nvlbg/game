(function() {

	window.game.debug = function() {
		this.gui = new dat.GUI();

		this.connection = this.gui.addFolder('Connection');
		this.networking = this.gui.addFolder('Networking');
		this.latency_control = this.gui.addFolder('Latency Control');
		this.render = this.gui.addFolder('Rendering');
		// this.player = this.gui.addFolder('Your player');

		// this.connection.add(window.game.network, 'latency_buffer_size', 2, 20);
		this.connection.add(window.game.network, 'last_ping_time').listen();
		this.connection.add(window.game.network, 'net_ping_update_step', 10, 5000);
		this.connection.add(window.game.network, 'net_latency').listen();

		this.networking.add(window.game.network, 'net_offset', 0, 250);
		this.networking.add(window.game.network, 'server_time').listen();
		this.networking.add(window.game.network, 'client_time').listen();

		this.latency_control.add(window.game.network, 'fake_latency', 0, 1000)
							.step(10)
							.onChange(function(val) {
								window.game.network.socket.emit(
												window.game.ENUM.TYPE.FAKE_LATENCY_CHANGE,
												val
											);
							});

		this.render.add(me.debug, 'renderHitBox');

		/*
		setTimeout(function() {
			this.player.add(window.game.network.player.pos, 'x').listen();
			this.player.add(window.game.network.player.pos, 'y').listen();
		}.bind(this), 250);
		*/

		this.networking.open();
		this.connection.open();
		this.latency_control.open();
		this.render.open();
		// this.player.open();
		
		this.gui.close();
	};

	me.Vector2d.prototype.draw = function(ctx) {
		ctx.save();

		ctx.fillStyle = 'red';
		ctx.fillRect(this.x-2, this.y-2, 4, 4);

		ctx.restore();
	};

})();