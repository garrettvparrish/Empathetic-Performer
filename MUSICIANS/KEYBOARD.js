var midi = require('midi');
var utils = require('../utils.js');

// Set up a new input.
var input = new midi.input();

// Count the available input ports.
input.getPortCount();

// Get the name of a specified input port.
input.getPortName(0);

// Configure a callback.
input.on('message', function(deltaTime, message) {
	utils.log(message);
	var mode = message[0];
	var note = parseInt(message[1]);
	var vel = message[2];

	if (note >= 60) {
		utils.log("Musician 1 input: " + note);
	} else {
		utils.log("Musician 2 input: " + note);
	}

});

// Open the first available input port.
input.openPort(0);

// Sysex, timing, and active sensing messages are ignored
// by default. To enable these message types, pass false for
// the appropriate type in the function below.
// Order: (Sysex, Timing, Active Sensing)
// For example if you want to receive only MIDI Clock beats
// you should use 
// input.ignoreTypes(true, false, true)
input.ignoreTypes(false, false, false);

