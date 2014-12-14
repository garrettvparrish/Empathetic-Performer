var arduino = require("johnny-five");

// Audience control
audienceControl = new arduino.Board();

// Variables
var cold2, hot2, cold1, hot1, vib1, vib2;

exports.setVibes = function (i) {
	vib1.start(i * 255);
	vib2.start(i * 255);
	cold1.start(i * 255);
	cold2.start(i * 255);
	hot1.start(i * 255);
	hot2.start(i * 255);
}

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
	
	cold1 = new arduino.Motor({
		pin: 13
	});

	hot1 = new arduino.Motor({
		pin: 12
	});


	cold2 = new arduino.Motor({
		pin: 9
	});

	hot2 = new arduino.Motor({
		pin: 8
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




