$(function () {
	// Future-proofing...
	var context;
	if (typeof AudioContext !== "undefined") {
	    context = new AudioContext();
	} else if (typeof webkitAudioContext !== "undefined") {
	    context = new webkitAudioContext();
	} else {
	    $(".hideIfNoApi").hide();
	    $(".showIfNoApi").show();
	}

	////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////

	// Web socket connections
	var uuid = "";
	var synchronizationSocket;

	var send_message = function (key, d) {
		synchronizationSocket.send(JSON.stringify({message: key, id: uuid, data: d}));
	}

	setTimeout(function () {
		synchronizationSocket = new WebSocket("ws://localhost:3000", "protocolOne");
		
		synchronizationSocket.onopen = function (event) {
			console.log("Socket connection opened.");
		};

		synchronizationSocket.onmessage = function (event) {
			console.log(event);
			var obj = JSON.parse(event.data);
			uuid = obj['id'];
			var message = obj['message'];
			console.log("Received: " + message);
			// Establishing a new connection
			if (message == 'connection') {
				var res = {message: "sync-handshake", id: uuid};
			  	synchronizationSocket.send(JSON.stringify(res)); 
			} else if (message == 'start-sync') {
				console.log("Starting sync");
			}

		}
	}, 2000);

	////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////

	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
	    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
	                                || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
	    window.requestAnimationFrame = function (callback, element) {
	        var currTime = new Date().getTime();
	        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	        var id = window.setTimeout(function () { callback(currTime + timeToCall); },
	            timeToCall);
	        lastTime = currTime + timeToCall;
	        return id;
	    };

	if (!window.cancelAnimationFrame)
	    window.cancelAnimationFrame = function (id) {
	        clearTimeout(id);
	    };

	// Create the analyser
	var analyser = context.createAnalyser();
	analyser.fftSize = 64;
	var frequencyData = new Uint8Array(analyser.frequencyBinCount);

	var min = 65;
	var max = 140;

	// Get the frequency data and update the visualisation
	function update() {
	    requestAnimationFrame(update);

	    analyser.getByteFrequencyData(frequencyData);
	    var sum = 0
	    for (i in frequencyData) {
	    	sum += frequencyData[i];
	    }
	    var avg = sum / frequencyData.length;
	    var normalized = ((avg-min)/(max-min)).toFixed(2);
	    normalized = normalized < 0.0 ? 0.0 : normalized;
	    normalized = normalized > 1.0 ? 1.0 : normalized;

	    // triggered audio data
	    if (normalized != 0) {
	        console.log(normalized);	
	        send_message("sync-amp", normalized)	        	
	    }
	};

	// Hook up the audio routing...
	// player -> analyser -> speakers
	$("#water").bind('canplay', function() {
		var source = context.createMediaElementSource(this);
		source.connect(analyser);
		analyser.connect(context.destination);
	});

	update();

	////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////

    var syncButton = document.getElementById("sync");
    syncButton.addEventListener('mousedown', function () {
    	var water = document.getElementById('water');
		water.play();
    }, false);

	var v = 0;
	var t = 0;

	var drawresetButton = function () {
		// Background
		var ctx = document.getElementById("sync").getContext("2d");
		ctx.beginPath();
		ctx.fillStyle = "#FF0000";
		var width = 300;
		var padding = 50;
		ctx.rect(padding, 30, 200, 100);
		ctx.fill();

		// Text
		ctx.fillStyle = "#000000";
		ctx.font="30px Verdana";
		ctx.fillText("SYNC", 100, 90);}
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
	    ctx.stroke(); }
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
	    ctx.stroke(); }

	////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////

	// draw ui when page is ready
	drawresetButton();
	drawvibrationControl(0);
	drawtemperatureControl(0,0);
});