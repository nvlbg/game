(function() {
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

	var axis = document.createElement('canvas'),
		axisCtx = axis.getContext('2d'),
		axisBackground = document.createElement('canvas'),
		axisBackgroundCtx = axisBackground.getContext('2d'),
		shoot = document.createElement('div'),
		
		axisPosX, axisPosY, axisPos, shootPos,

		fixPosition = function() {
			if(window.orientation % 180 === 0) { // portrait
				axisPosX = (window.innerWidth / 2 - 100);
				shootPos = ~~((window.innerHeight - 400) / 3);
				axisPosY = 200 + 2 * shootPos;

				axisPos = ['translate(', axisPosX, 'px,', axisPosY, 'px)'].join('');

				shoot.style.webkitTransform = ['translate(', axisPosX, 'px,', shootPos, 'px)'].join('');
			} else { // landscape
				axisPosX = ~~((window.innerWidth - 400) / 3);
				axisPosY = window.innerHeight / 2 - 100;
				shootPos = 200 + 2 * axisPosX;

				axisPos = ['translate(', axisPosX, 'px,', axisPosY, 'px)'].join('');

				shoot.style.webkitTransform = ['translate(', shootPos, 'px,', axisPosY, 'px)'].join('');
			}

			axisBackground.style.webkitTransform = axis.style.webkitTransform = axisPos;
		},
		hideAddressBar = function() {
			if(!window.location.hash) {
				if(document.height < window.outerHeight) {
					document.body.style.height = (window.outerHeight + 50) + 'px';
				}

				setTimeout(function() {
					window.scrollTo(0, 1);
				}, 1);
			}
		},

		x = 100, y = 100, sqLength, length, dirX, dirY, direction, DIR_ENUM = window.ENUM.PRESSED,
		preventDefault = function(e) { e.preventDefault(); },
		sqare = function(num) { return num * num; },
		move = function(e) {
			axisCtx.clearRect(x - 34, y - 34, 68, 68);

			x = e.changedTouches[0].pageX - axisPosX;
			y = e.changedTouches[0].pageY - axisPosY;



			sqLength = sqare(100-x) + sqare(100-y);

			if(sqLength >= 4356) {  // 66^2 = 4356, 66 = big circle radius (100) - small circle radius (34)
									// if small circle is outside big circe
				length = Math.sqrt(sqLength);
				x = (((x - 100) * 66) / length) + 100;
				y = (((y - 100) * 66) / length) + 100;
			}

			dirX = x - 100;
			dirY = 100 - y;

			if(Math.abs(dirX) > 50 || Math.abs(dirY) > 50) {
				if(dirX > 0) {
					if(dirY > 0) {
						direction = (Math.abs(dirX) > Math.abs(dirY)) ? DIR_ENUM.RIGHT : DIR_ENUM.UP;
					} else {
						direction = (Math.abs(dirX) > Math.abs(dirY)) ? DIR_ENUM.RIGHT : DIR_ENUM.DOWN;
					}
				} else {
					if(dirY > 0) {
						direction = (Math.abs(dirX) > Math.abs(dirY)) ? DIR_ENUM.LEFT : DIR_ENUM.UP;
					} else {
						direction = (Math.abs(dirX) > Math.abs(dirY)) ? DIR_ENUM.LEFT : DIR_ENUM.DOWN;
					}
				}
			} else {
				direction = 0;
			}

			
			axisCtx.beginPath();
			axisCtx.arc(x, y, 33, 0, Math.PI * 2, true);
			axisCtx.fill();
			axisCtx.stroke();
			axisCtx.closePath();

			e.preventDefault();
		};

	document.body.style.display = 'block';

	axis.width = axis.height =  axisBackground.width = axisBackground.height = shoot.width = shoot.height = 200;
	axis.id = 'axis';
	axisBackground.id = 'axisBackground';
	shoot.id = 'shoot';

	document.body.appendChild(axisBackground);
	document.body.appendChild(axis);
	document.body.appendChild(shoot);

	// draw outer circle
	axisBackgroundCtx.beginPath();
	axisBackgroundCtx.arc(100, 100, 98, 0, Math.PI * 2, true);
	axisBackgroundCtx.fillStyle = '#777';
	axisBackgroundCtx.strokeStyle = '#111';
	axisBackgroundCtx.fill();
	axisBackgroundCtx.stroke();
	axisBackgroundCtx.closePath();

	// draw inner circle in the middle of outer circle
	axisCtx.beginPath();
	axisCtx.arc(100, 100, 30, 0, Math.PI * 2, true);
	axisCtx.fillStyle = '#BBB';
	axisCtx.strokeStyle = '#111';
	axisCtx.fill();
	axisCtx.stroke();
	axisCtx.closePath();

	// iPhone: hide address bar onload and on orientationchange
	if(!window.pageYOffset) { hideAddressBar(); }
	window.addEventListener("orientationchange", hideAddressBar);

	// fix controls positions every 100 milliseconds
	setInterval(fixPosition, 100);

	// fix position on page load
	setTimeout(fixPosition, 1);

	// handle axis movement
	axis.addEventListener("touchstart", move, false);
	axis.addEventListener("touchmove",  move, false);
	axis.addEventListener("touchend", function(e) {
		e.preventDefault();
		axisCtx.clearRect(x - 34, y - 34, 68, 68);
		axisCtx.beginPath();
		axisCtx.arc(100, 100, 30, 0, Math.PI * 2, true);
		axisCtx.fill();
		axisCtx.stroke();
		axisCtx.closePath();

		direction = 0;

		x = y = 100;
	}, false);

	// handle shooting
	shoot.addEventListener("touchstart", function(e) {
		e.preventDefault();
		shoot.style.background = '#A33';
	}, false);
	shoot.addEventListener("touchend", function(e) {
		e.preventDefault();
		shoot.style.background = '#3A3';
	}, false);
	shoot.addEventListener("touchmove", preventDefault, false);

	// prevent scrolling
	document.body.addEventListener("touchmove", preventDefault, false);

	var socket = window.io.connect(), input_seq = 0, input = {s:0,p:0}, playerID;
	playerID = window.prompt("Please, enter your player ID", "");

	socket.emit(window.ENUM.TYPE.SMARTPHONE_CONNECT, playerID);
	socket.on(window.ENUM.TYPE.SMARTPHONE_ACCEPT, function(accepted) {
		if (!accepted) {
			window.alert("Sorry, the user declined to be you.");
		} else {
			setInterval(function() {
				if (direction > 0) {
					input.s = input_seq;
					input.p = direction;

					socket.emit(window.ENUM.TYPE.UPDATE, input);
					input_seq += 1;
				}
			}, 1000 / 60);
		}
	});
})();