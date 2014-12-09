var v = 0;
var t = 0;
var lock = 0;

// HANDLERS
$(document).ready(function() {

	var runSynchronization = function () {
		// Webkit audio context
		var context = new webkitAudioContext();

		var water = document.getElementById('water');
		water.play();
		setTimeout(end, 20000);
		
		water.addEventListener("canplay", function() {
		    var source = context.createMediaElementSource(water);
		    source.connect(context.destination);
		});

		function end() {
		    water.pause();
		}

		setTimeout(function () {sendSync(0.5, 0.5);}, 500);
		setTimeout(function () {sendSync(0.8, 0.9);}, 5000);
		setTimeout(function () {sendSync(0.4, 0.2);}, 8000);
		setTimeout(function () {sendSync(0.1, 0.0);}, 12000);
		setTimeout(function () {sendSync(0.4, 0.5);}, 15000);
		setTimeout(function () {sendSync(0.7, 1.0);}, 18000);
		setTimeout(function () {sendSync(1.0, 1.0);}, 20000);

	};

	var sendSync = function (v, t) {
			$.get('/v?val=' + v, function(data) {});
			$.get('/t?val=' + t, function(data) {});
	}

	var sendV = function (v) {
		if ( lock === 0 ) {
			lock = 1;
			$.get('/v?val=' + v, function(data) {
				  lock = 0;
			      }
			     );
	    }
	}

	var sendT = function (t) {
		if ( lock === 0 ) {
			lock = 1;	
			$.get('/t?val=' + t, function(data) {
				  lock = 0;
			      }
			     );
		}
	}

    // stop button
  	var resetHandler = function (e) { 
		console.log("RESET");
		v = 0;
		t = 0;
		drawvibrationControl();
		drawtemperatureControl();

		runSynchronization();

		if ( lock === 0 ) {
			lock = 1;
			$.get('/r', function(data) {
				lock = 0;
			});
	    }
  	};

    var resetButton = document.getElementById("reset");
	resetButton.addEventListener('touchstart', resetHandler, false);

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
		sendV(v);
		drawvibrationControl();
	}

	addEventListener("keypress", function(event){
		console.log(event.keyCode);
		var num = event.keyCode;

		// increase
		if (num == 101) {
			t = t + 0.03;
		// decrease
		} else {
			t = t - 0.03;
		}
		console.log(t);
		drawtemperatureControl();
	});

	vibrationControl.addEventListener('touchstart', vibrationControlHandler, false);
	vibrationControl.addEventListener('touchmove', vibrationControlHandler, false);
	vibrationControl.addEventListener('touchend', function (e)  {
		TOUCHINGROTATION = false;
	}, false);

	// translational contron	
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
		sendT(t);

		drawtemperatureControl();
	}

	temperatureControl.addEventListener('touchstart', temperatureControlHandler, false);
	temperatureControl.addEventListener('touchmove', temperatureControlHandler, false);
	temperatureControl.addEventListener('touchend', function (e)  {
		TOUCHINGTRANSLATION = false;
	}, false);

});


var drawresetButton = function () {
	// Background
	var ctx = document.getElementById("reset").getContext("2d");
	ctx.beginPath();
	ctx.fillStyle = "#FF0000";
	var width = 300;
	var padding = 50;
	ctx.rect(padding, 30, 200, 100);
	ctx.fill();

	// Text
	ctx.fillStyle = "#000000";
	ctx.font="30px Verdana";
	ctx.fillText("SYNC", 100, 90);
}

var deadZoneColor = "blue";
var activeZoneColor = "gray";
var positionIndicatorColor = "white";

var drawvibrationControl = function (_r) {	
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

var drawtemperatureControl = function (_x,_y) {
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
	var pos = (1.0-t) * height;
	ctx.lineWidth = 5;
	ctx.moveTo(0, pos);
	ctx.lineTo(width, pos);
    ctx.stroke();
}

// draw ui when page is ready
$(function () {
	drawresetButton();
	drawvibrationControl(0);
	drawtemperatureControl(0,0);
});