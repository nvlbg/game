(function() {
	// check and notify user if a dependency is missing
	var a = navigator.userAgent||navigator.vendor||window.opera;
	if(!(/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|meego.+mobile|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))) {
		window.alert('This is a app that should be viewed by a smartphone.');
		return;
	}

	if(!!!document.createElement('canvas').getContext('2d')) {
		window.alert('Sorry, your browser/phone does not support canvas.');
		return;
	}

	if(window.orientation === "undefined" || !("onorientationchange" in window)) {
		window.alert('Sorry, I cannot detect your phone orientation.');
		return;
	}

	if(!("ontouchstart" in window && "ontouchmove" in window && "ontouchend" in window)) {
		window.alert('Sorry, your browser/phone is not touchscreen.');
		return;
	}

	var preventDefault = function(e) { e.preventDefault(); };
	var sqare = function(num) { return num * num; };

	function Axis(axisId, backgroundId, colors) {
		this.axis = document.createElement('canvas');
		this.axisCtx = this.axis.getContext('2d');

		this.background = document.createElement('canvas');
		this.backgroundCtx = this.background.getContext('2d');

		this.pos = {x:100,y:100};
		this.pagePos = {x:0,y:0};
		this.width = 200;
		this.height = 200;
		this.axis.width = 200;
		this.axis.height = 200;
		this.background.width = 200;
		this.background.height = 200;

		this.axis.id = axisId;
		this.background.id = backgroundId;

		this.dir = {x:undefined,y:undefined};

		// draw outer circle
		this.backgroundCtx.beginPath();
		this.backgroundCtx.arc(100, 100, 98, 0, Math.PI * 2, true);
		this.backgroundCtx.fillStyle = colors.backgroundFillColor;
		this.backgroundCtx.strokeStyle = colors.backgroundStrokeColor;
		this.backgroundCtx.fill();
		this.backgroundCtx.stroke();
		this.backgroundCtx.closePath();

		// draw inner circle in the middle of outer circle
		this.axisCtx.beginPath();
		this.axisCtx.arc(100, 100, 30, 0, Math.PI * 2, true);
		this.axisCtx.fillStyle = colors.axisFillColor;
		this.axisCtx.strokeStyle = colors.axisStrokeColor;
		this.axisCtx.fill();
		this.axisCtx.stroke();
		this.axisCtx.closePath();

		var self = this;

		var length, sqLength;
		this.move = function(e) {
			e.preventDefault();

			self.axisCtx.clearRect(self.pos.x - 34, self.pos.y - 34, 68, 68);

			self.pos.x = e.changedTouches[0].pageX - self.pagePos.x;
			self.pos.y = e.changedTouches[0].pageY - self.pagePos.y;

			sqLength = sqare(100-self.pos.x) + sqare(100-self.pos.y);

			if(sqLength >= 4356) {  // 66^2 = 4356, 66 = big circle radius (100) - small circle radius (34)
									// if small circle is outside big circe
				length = Math.sqrt(sqLength);
				self.pos.x = (((self.pos.x - 100) * 66) / length) + 100;
				self.pos.y = (((self.pos.y - 100) * 66) / length) + 100;
			}

			self.dir.x = self.pos.x - 100;
			self.dir.y = self.pos.y - 100;
			
			self.axisCtx.beginPath();
			self.axisCtx.arc(self.pos.x, self.pos.y, 33, 0, Math.PI * 2, true);
			self.axisCtx.fill();
			self.axisCtx.stroke();
			self.axisCtx.closePath();
		};

		this.axis.addEventListener("touchstart", this.move, false);
		this.axis.addEventListener("touchmove",  this.move, false);
		this.axis.addEventListener("touchend", function(e) {
			e.preventDefault();

			self.axisCtx.clearRect(self.pos.x - 34, self.pos.y - 34, 68, 68);
			self.axisCtx.beginPath();
			self.axisCtx.arc(100, 100, 30, 0, Math.PI * 2, true);
			self.axisCtx.fill();
			self.axisCtx.stroke();
			self.axisCtx.closePath();

			self.pos.x = 100;
			self.pos.y = 100;

			self.dir.x = undefined;
			self.dir.y = undefined;
		}, false);

		document.body.appendChild(this.background);
		document.body.appendChild(this.axis);

		this.setTranslate = function(x, y) {
			this.pagePos.x = x;
			this.pagePos.y = y;
			this.background.style.webkitTransform = this.axis.style.webkitTransform = 
											['translate(', x, 'px,', y, 'px)'].join('');
		};
	}

	var moveAxis  = new Axis('moveAxis',  'moveAxisBackground' , {
		backgroundFillColor: '#CCC',
		backgroundStrokeColor: '#00F',
		axisFillColor: '#00F',
		axisStrokeColor: '#FFF'
	});

	var shootAxis = new Axis('shootAxis', 'shootAxisBackground', {
		backgroundFillColor: '#CCC',
		backgroundStrokeColor: '#F00',
		axisFillColor: '#F00',
		axisStrokeColor: '#FFF'
	});

	var fixPosition = function() {
		var axisPosX, axisPosY, shootPos;
		if(window.orientation % 180 === 0) {
			shootPos = ~~((window.innerHeight - 400) / 3);
			axisPosX = (window.innerWidth / 2 - 100);
			axisPosY = 200 + 2 * shootPos;

			moveAxis.setTranslate(axisPosX, axisPosY);
			shootAxis.setTranslate(axisPosX, shootPos);
		} else {
			axisPosX = ~~((window.innerWidth - 400) / 3);
			axisPosY = window.innerHeight / 2 - 100;
			shootPos = 200 + 2 * axisPosX;

			moveAxis.setTranslate(axisPosX, axisPosY);
			shootAxis.setTranslate(shootPos, axisPosY);
		}
	};

	var hideAddressBar = function() {
		if(!window.location.hash) {
			if(document.height < window.outerHeight) {
				document.body.style.height = (window.outerHeight + 50) + 'px';
			}

			setTimeout(function() {
				window.scrollTo(0, 1);
			}, 1);
		}
	};

	document.body.style.display = 'block';

	// iPhone: hide address bar onload and on orientationchange
	if(!window.pageYOffset) { hideAddressBar(); }
	window.addEventListener("orientationchange", hideAddressBar);

	// fix controls positions every 100 milliseconds
	setInterval(fixPosition, 100);

	// fix position on page load
	fixPosition();

	// prevent scrolling
	document.body.addEventListener("touchmove", preventDefault, false);

	var socket = window.io.connect();
	var input_seq = 0;
	var interval;

	var jsonRequest = new XMLHttpRequest(), ENUM, DIR_ENUM;
	jsonRequest.onreadystatechange = function() {
		if (this.readyState === 4 && this.status === 200) {
			ENUM = JSON.parse(this.responseText);
			DIR_ENUM = ENUM.PRESSED;

			socket.on(ENUM.TYPE.SMARTPHONE_AUTH, function(result) {
				if (result === ENUM.SMARTPHONE.ACCEPTED) {
					interval = setInterval(update, 1000 / 10);
				} else {
					if (result === ENUM.SMARTPHONE.DECLINED) {
						window.alert("Sorry, the user declined your access.");
					} else if (result === ENUM.SMARTPHONE.NO_SUCH_USER) {
						window.alert("There isn't a player with that nickname playing.");
					}

					connect();
				}
			});

			socket.on(ENUM.TYPE.SET_INPUT, function(input_method) {
				if (input_method === ENUM.INPUT_TYPE.KEYBOARD_AND_MOUSE) {
					clearInterval(interval);
				} else if (input_method === ENUM.INPUT_TYPE.SMARTPHONE_CONTROLLER) {
					interval = setInterval(update, 1000 / 10);
				}
			});

			connect();
		}
	};
	jsonRequest.open('GET', 'shared/constants.json', true);
	jsonRequest.send();

	var connect = function() {
		var player = window.prompt("Please, enter your player's username", "");

		if (player) {
			socket.emit(ENUM.TYPE.SMARTPHONE_CONNECT, player);
		}
	};

	var update = function() {
		var direction, angle;
		if (moveAxis.dir.x !== undefined && moveAxis.dir.y !== undefined) {
			var x = moveAxis.dir.x;
			var y = moveAxis.dir.y;
			if(Math.abs(x) > 50 || Math.abs(y) > 50) {
				if(x > 0) {
					if(y > 0) {
						direction = (Math.abs(x) > Math.abs(y)) ? DIR_ENUM.RIGHT : DIR_ENUM.DOWN;
					} else {
						direction = (Math.abs(x) > Math.abs(y)) ? DIR_ENUM.RIGHT : DIR_ENUM.UP;
					}
				} else {
					if(y > 0) {
						direction = (Math.abs(x) > Math.abs(y)) ? DIR_ENUM.LEFT : DIR_ENUM.DOWN;
					} else {
						direction = (Math.abs(x) > Math.abs(y)) ? DIR_ENUM.LEFT : DIR_ENUM.UP;
					}
				}
			}
		}

		if (shootAxis.dir.x !== undefined && shootAxis.dir.y !== undefined) {
			if (Math.abs(shootAxis.dir.x) > 50 || Math.abs(shootAxis.dir.y) > 50) {
				angle = Math.atan2(shootAxis.dir.y, shootAxis.dir.x);
			}
		}

		if (direction || angle) {
			var input = {
				s: input_seq
			};
			
			if ( direction ) {
				input.p = direction;
			}

			if ( angle ) {
				input.a = angle;
			}

			socket.emit(ENUM.TYPE.UPDATE, input);
			input_seq += 1;
		}
	};

})();