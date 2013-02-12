(function() {

	window.game.debug = function() {
		this.gui = new dat.GUI();

		this.connection = this.gui.addFolder('Connection');
		this.networking = this.gui.addFolder('Networking');
		this.player = this.gui.addFolder('Your player');

		this.connection.add(window.game.network, 'latency_buffer_size', 2, 20);
		this.connection.add(window.game.network, 'last_ping_time').listen();
		this.connection.add(window.game.network, 'net_ping_update_step', 10, 5000);
		this.connection.add(window.game.network, 'net_latency').listen();

		this.networking.add(window.game.network, 'net_offset', 0, 250);
		this.networking.add(window.game.network, 'server_time').listen();
		this.networking.add(window.game.network, 'client_time').listen();

		setTimeout(function() {
			this.player.add(window.game.network.player.pos, 'x').listen();
			this.player.add(window.game.network.player.pos, 'y').listen();
		}.bind(this), 250);

		// this.network.add(window.game.network, 'buffer_size', 1, 5);
		// this.network.add(window.game.network, 'client_smooth', 0, 50);
		
		this.networking.open();
		this.connection.open();
		this.player.open();
	};

})();