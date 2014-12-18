var math = require('mathjs');
var midi = require('midi');
var ipc = require('ipc');
var events = require('events');
var eventEmitter = new events.EventEmitter();

exports.midiEmitter = function () {
    return eventEmitter;
};

// Set up a new input.
var input = new midi.input();

// Count the available input ports.
var numPorts = input.getPortCount();

// Get the name of a specified input port.
input.getPortName(0);

var musician1_history = [];
exports.musician1_history = function () {
    return musician1_history;
}

var musician2_history = [];
exports.musician2_history = function () {
    return musician2_history;
}

var HISTORY_SIZE = 200;

// length of time (ms) size for a beat to be considered at the same time
var BEAT_SIZE = 100;

// how far to look back through history to analyze the similarity
var HISTORY_TIME = 5000;

exports.business = function (musician) {
    var history = (musician == 1) ? musician1_history : musician2_history;

    // How many notes to compare against
    var WINDOW_SIZE = 10;
    var sum = 0;
    if (history.length > WINDOW_SIZE) {
        for (var i = 1; i < WINDOW_SIZE; i++) {
            var n1 = history[i];
            var n2 = history[i - 1];
            var difference = n2['time'] - n1['time'];
            sum += difference; 
        }
    }
    // 500 is an empirically determined value
    var rv = sum / (500.0 * WINDOW_SIZE);

    var normalized = 1.0 - math.max(0, math.min(1.0, rv));
    return rv;
}

exports.rythmicSynchronicity = function (timestamp) {

    var tracker = 0;
    var collective_hits = 0;

    var m1_hits = 0;
    var m2_hits = 0;

    while (tracker < HISTORY_TIME) {
        // Top and lower bound through out the past x milliseconds
        var top_bound = timestamp - tracker;
        var bottom_bound = top_bound - BEAT_SIZE; 

        // check if any elements in both histories that have timestamps lying within this window
        var m1 = false;
        var m2 = false;

        musician1_history.forEach(function(beat) {
            if (beat.time < top_bound && beat.time > bottom_bound) {

                m1 = true;
                m1_hits = m1_hits + 1;

            }
        });

        musician2_history.forEach(function(beat) {
            if (beat.time < top_bound && beat.time > bottom_bound) {
                m2 = true;
                m2_hits = m2_hits + 1;
            }
        });

        if (m1 && m2) {
            collective_hits += 1;
        }

        tracker += BEAT_SIZE;
    }

    m1_hits = m1_hits/2;
    m2_hits = m2_hits/2;

    // utils.log("Musician 1 hit " + m1_hits + " times in the last 5 seconds.");
    // utils.log("Musician 2 hit " + m2_hits + " times in the last 5 seconds.");

    // Calculates the rythmic syncrony 
    var ratio = collective_hits/(m1_hits + m2_hits);
    ratio = (isNaN(ratio)) ? 0 : ratio;
    return ratio
}

// Update histories with current 
input.on('message', function(deltaTime, message) {
    var mode = message[0];
    var note = parseInt(message[1]);
    var vel = message[2];

    var notes = ["C", "Db", "D", "Eb", "E", "F", "F#", "G","Ab", "A", "Bb", "B"];
    var note_num = note % 12
    var note_name = notes[note_num];
    var octave = math.floor(note/12);
    octave = octave > 4 ? octave - 4 : octave - 1;
    var desc = note_name + octave;
    var action = vel == 0 ? "off" : "on";
    var relative_note = 0;
    var key = "";

    // in milliseconds
    var d = new Date();
    var timestamp = d.getTime();

    if (note >= 60 && note <= 96) {
        // utils.log("Musician 1 input: " + note + " at " + timestamp);
        
        if (musician1_history.length >= HISTORY_SIZE) {
            musician1_history.pop();
        }
        musician1_history.unshift({'note': note, 'time': timestamp, 'velocity': vel});
        relative_note = note - 60;
        key = "musician-1-midi";

    } else if (note >= 24 && note < 60) {
        // utils.log("Musician 2 input: " + note + " at " + timestamp);

        if (musician2_history.length >= HISTORY_SIZE) {
            musician2_history.pop();
        }
        musician2_history.unshift({'note': note, 'time': timestamp, 'velocity': vel});

        relative_note = note - 24;
        key = "musician-2-midi";
    }

    var message = {
      "mode": mode,
      "note_num": relative_note,
      "note_letter" : note_name,
      "octave" : octave,
      "desc" : desc,
      "velocity": vel,
      "action" : action,
      "timestamp": timestamp
    };

    eventEmitter.emit(key, message);

});

input.openPort(0);

setTimeout(function () {
    eventEmitter.emit('midi-status',{'status':numPorts > 0});
}, 5000);


// Sysex, timing, and active sensing messages are ignored
// by default. To enable these message types, pass false for
// the appropriate type in the function below.
// Order: (Sysex, Timing, Active Sensing)
// For example if you want to receive only MIDI Clock beats
// you should use 
// input.ignoreTypes(true, false, true)
input.ignoreTypes(false, false, false);