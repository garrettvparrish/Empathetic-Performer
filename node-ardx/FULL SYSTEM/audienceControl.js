var j5 = require("johnny-five");
console.log("SLKDJF::");
// Audience control
audienceControl = new j5.Board();

// Variables
var breathEmulator1, breathEmulator2, temperatureEmulator;

exports.breath1 = function () {
	return breathEmulator1;
} 

exports.breath2 = function () {
	return breathEmulator2;
}

exports.temp = function () {
	return temperatureEmulator;
}

// audience control
audienceControl.on("ready", function() {
  	breathEmulator1 = new j5.Motor({
    	pin: 11
	});

	breathEmulator2 = new j5.Motor({
   		pin: 3
	});

	temperatureEmulator = new j5.Motor({
		pin: 9
	})
});
