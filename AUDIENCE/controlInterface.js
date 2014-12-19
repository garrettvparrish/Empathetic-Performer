var v = 0;
var t = 0;
var b = 0;
var c = 0;

var lock = 0;

// HANDLERS
$(document).ready(function() {

	// Web socket connections
	var uuid = "";
	var audienceSocket;
	
	audienceSocket = new WebSocket("ws://localhost:3000", "protocolOne");

	var send_message = function (key, d) {
		audienceSocket.send(JSON.stringify({message: key, id: uuid, data: 1.0 - d}));
	}
	
	audienceSocket.onopen = function (event) {
		console.log("Socket connection opened.");
		// audienceSocket.send(JSON.stringify({message: }))
	};

	audienceSocket.onmessage = function (event) {

		var obj = JSON.parse(event.data);
		var message = obj['message'];
		var data = obj['data'];
		console.log(event.data);

		// Establishing a new connection -- send a handshake
		if (message == 'connection') {
			uuid = obj['id'];

			var res = {message: "identify", id: uuid, data: 'audience-control'};
		  	audienceSocket.send(JSON.stringify(res)); 
		}
	}

	// rotational control
	var vibrationControl = document.getElementById("vibrationControl");

	var vibrationControlHandler = function (e) {
		// No bounce
		e.preventDefault();

		// Get touch
		var touch = e.touches[0];
		var rect = vibrationControl.getBoundingClientRect();
		var y = touch.pageY - rect.top;
		var height = 400;
		var percentage = y/height;

		// Update global
		v = percentage;

		send_message('vibration-control', v);
		drawVibrationControl();
	}

	vibrationControl.addEventListener('touchstart', vibrationControlHandler, false);
	vibrationControl.addEventListener('touchmove', vibrationControlHandler, false);

	////////

	var temperatureControl = document.getElementById("temperatureControl");

	var temperatureControlHandler = function (e) {

		// No bounce
		e.preventDefault();

		// Get touches
		var touch = e.touches[0];
		var rect = vibrationControl.getBoundingClientRect();
		var y = touch.pageY - rect.top;
		var height = 400;
		var percentage = y/height;

		// Update global
		t = percentage;
		send_message('temperature-control', t);
		drawTemperatureControl();
	}

	temperatureControl.addEventListener('touchstart', temperatureControlHandler, false);
	temperatureControl.addEventListener('touchmove', temperatureControlHandler, false);


	/////// 
	var brightnessControl = document.getElementById("brightnessControl");

	var brightnessControlHandler = function (e) {

		// No bounce
		e.preventDefault();

		// Get touches
		var touch = e.touches[0];
		var rect = vibrationControl.getBoundingClientRect();
		var y = touch.pageY - rect.top;
		var height = 400;
		var percentage = y/height;

		// Update global
		b = percentage;
		send_message('brightness-control', b);

		drawBrightnessControl();
	}

	brightnessControl.addEventListener('touchstart', brightnessControlHandler, false);
	brightnessControl.addEventListener('touchmove', brightnessControlHandler, false);


	//////// 

	var colorControl = document.getElementById("colorControl");

	var colorControlHandler = function (e) {

		// No bounce
		e.preventDefault();

		// Get touches
		var touch = e.touches[0];
		var rect = vibrationControl.getBoundingClientRect();
		var y = touch.pageY - rect.top;
		var height = 400;
		var percentage = y/height;

		// Update global
		c = percentage;
		send_message('color-control', c);
		drawColorControl();
	}

	colorControl.addEventListener('touchstart', colorControlHandler, false);
	colorControl.addEventListener('touchmove', colorControlHandler, false);

});

var deadZoneColor = "blue";
var activeZoneColor = "gray";
var positionIndicatorColor = "white";

var drawVibrationControl = function (_r) {	
	var rotational = document.getElementById("vibrationControl")
	var ctx = rotational.getContext("2d");

	var height = rotational.height;
	var width = rotational.width;
	ctx.clearRect (0, 0, width, height);
	
	ctx.beginPath();
	ctx.fillStyle = activeZoneColor;
	ctx.rect(0, 0, width, height * .8);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = deadZoneColor;
	ctx.rect(0,height * .8, width, height);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = positionIndicatorColor;
	var pos = (v * height);
	ctx.lineWidth = 5;
	ctx.moveTo(0, pos);
	ctx.lineTo(width, pos);
    ctx.stroke();
}

var drawTemperatureControl = function (_r) {	
	var rotational = document.getElementById("temperatureControl")
	var ctx = rotational.getContext("2d");

	var height = rotational.height;
	var width = rotational.width;
	ctx.clearRect (0, 0, width, height);
	
	ctx.beginPath();
	ctx.fillStyle = activeZoneColor;
	ctx.rect(0, 0, width, height * .8);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = deadZoneColor;
	ctx.rect(0,height * .8, width, height);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = positionIndicatorColor;
	var pos = (t * height);
	ctx.lineWidth = 5;
	ctx.moveTo(0, pos);
	ctx.lineTo(width, pos);
    ctx.stroke();
}

var drawColorControl = function (_r) {	
	var rotational = document.getElementById("colorControl")
	var ctx = rotational.getContext("2d");

	var height = rotational.height;
	var width = rotational.width;
	ctx.clearRect (0, 0, width, height);
	
	ctx.beginPath();
	ctx.fillStyle = activeZoneColor;
	ctx.rect(0, 0, width, height * .8);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = deadZoneColor;
	ctx.rect(0,height * .8, width, height);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = positionIndicatorColor;
	var pos = (c * height);
	ctx.lineWidth = 5;
	ctx.moveTo(0, pos);
	ctx.lineTo(width, pos);
    ctx.stroke();
}

var drawBrightnessControl = function (_r) {	
	var rotational = document.getElementById("brightnessControl")
	var ctx = rotational.getContext("2d");

	var height = rotational.height;
	var width = rotational.width;
	ctx.clearRect (0, 0, width, height);
	
	ctx.beginPath();
	ctx.fillStyle = activeZoneColor;
	ctx.rect(0, 0, width, height * .8);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = deadZoneColor;
	ctx.rect(0,height * .8, width, height);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = positionIndicatorColor;
	var pos = (b * height);
	ctx.lineWidth = 5;
	ctx.moveTo(0, pos);
	ctx.lineTo(width, pos);
    ctx.stroke();
}
// draw ui when page is ready
$(function () {
	drawVibrationControl(0);
	drawTemperatureControl(0);
	drawColorControl(0);
	drawBrightnessControl(0);
});