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

// length of time (ms) size for a beat to be considered at the same time
var BEAT_SIZE = 100;

// how far to look back through history to analyze the similarity
var WINDOW_SIZE = 5000;


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

	// Have the two histories --> do analysis
	var tracker = 0;
	var collective_hits = 0;

	while (tracker < WINDOW_SIZE) {
		// Top and lower bound through out the past x milliseconds
		var top_bound = timestamp - tracker;
		var bottom_bound = top_bound - BEAT_SIZE; 

		console.log("Checking " + top_bound + " to " + bottom_bound);

		// check if any elements in both histories that have timestamps lying within this window
		var m1 = false;
		var m1_hits = 0;
		var m2 = false;
		var m2_hits = 0;

		musician1_history.forEach(function(beat) {
			if (beat.time < top_bound && beat.time > bottom_bound) {
				m1 = true;
				m1_hits += 1;
			}
		});

		musician2_history.forEach(function(beat) {
			if (beat.time < top_bound && beat.time > bottom_bound) {
				m2 = true;
				m2_hits += 1;
			}
		});

		if (m1 && m2) {
			collective_hits += 1;
		}

		var ratio = collective_hits/((m1_hits + m2_hits)/2.0);
		console.log("Ratio: " + ratio);
		tracker += BEAT_SIZE;
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

