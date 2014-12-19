var arduino = require("johnny-five");

var events = require('events');
var eventEmitter = new events.EventEmitter();

exports.biometricFeedbackEmitter = function () {
    return eventEmitter;
};

// Musician Feedback Control
biometricFeedback = new arduino.Board();

// Variables
var heat, vib1, vib2, color, brightness;

exports.setVibes = function (i) {
	if (vib1) {
		vib1.start(i * 255);
	} 

	if (vib2) {
		vib2.start(i * 255);
	}

	if (heat) {
		heat.start(i * 255);		
	}
}

exports.brightness = function () {
	return brightness;
}

exports.color = function () {
	return color;
}

exports.heat = function () {
	return heat;
}

exports.vib1 = function () {
	return vib1;
}

exports.vib2 = function () {
	return vib2;
}

// audience control
biometricFeedback.on("ready", function() {
	setTimeout(function () {
		eventEmitter.emit('status', {'status':true});
	}, 1000);

	heat = new arduino.Motor({
		pin: 13
	});

	vib1 = new arduino.Motor({
		pin: 3
	});

	vib2 = new arduino.Motor({
		pin: 5
	});

	color = new arduino.Motor({
		pin: 8
	})

	brightness = new arduino.Motor({
		pin: 7
	})

});
