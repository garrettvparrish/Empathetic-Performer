var arduino = require("johnny-five");

// Audience control
audienceControl = new arduino.Board();

// Variables
var cold2, hot2, cold1, hot1, vib1, vib2;

exports.cold2 = function () {
	return cold2;
}

exports.hot2 = function () {
	return hot2;
}

exports.cold1 = function () {
	return cold1;
}

exports.hot1 = function () {
	return hot1;
}

exports.vib1 = function () {
	return vib1;
}

exports.vib2 = function () {
	return vib2;
}

// audience control
audienceControl.on("ready", function() {
	
	cold2 = new arduino.Motor({
		pin: 12
	});

	cold1 = new arduino.Motor({
		pin: 13
	});

	hot2 = new arduino.Motor({
		pin: 8
	});

	hot1 = new arduino.Motor({
		pin: 9
	});

	vib1 = new arduino.Motor({
		pin: 3
	});

	vib2 = new arduino.Motor({
		pin: 5
	});

	console.log("Starting hot 1");

	// cold2.start(255);
	hot2.start(255);

});




