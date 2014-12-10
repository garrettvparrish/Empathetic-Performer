var midi = require('midi');
var utils = require('../utils.js');

// Set up a new input.
var input = new midi.input();

// Count the available input ports.
input.getPortCount();

// Get the name of a specified input port.
input.getPortName(0);

var musician1_history = [];
var musician2_history = [];
var HISTORY_SIZE = 20;

// Configure a callback.
input.on('message', function(deltaTime, message) {
	var mode = message[0];
	var note = parseInt(message[1]);
	var vel = message[2];

	var d = new Date();

	// in milliseconds
	var timestamp = d.getTime();

	if (note >= 60) {
		utils.log("Musician 1 input: " + note + " at " + timestamp);
		
		if (musician1_history.length >= HISTORY_SIZE) {
			musician1_history.pop();
		}
		musician1_history.unshift({'note': note, 'time': timestamp});
		utils.log("Musician 1 history: " + JSON.stringify(musician1_history));

	} else {
		utils.log("Musician 2 input: " + note + " at " + timestamp);

		if (musician2_history.length >= HISTORY_SIZE) {
			musician2_history.pop();
		}
		musician2_history.unshift({'note': note, 'time': timestamp});

		utils.log("Musician 2 history: " + JSON.stringify(musician2_history));
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

