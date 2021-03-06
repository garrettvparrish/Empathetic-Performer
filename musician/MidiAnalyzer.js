
var math = require('mathjs');
var midi = require('midi');
var ipc = require('ipc');
var events = require('events');
var eventEmitter = new events.EventEmitter();

var DERIVATIVE_HISTORY_SIZE = 4;

var il1_history = [];
var il2_history = [];
var rb1_history = [];
var rb2_history = [];
var mb1_history = [];
var mb2_history = [];

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

exports.update_histories = function (t) {
    var h = [musician1_history, musician2_history];
    for (var history in h) {
        for (var i = 0; i < history.length; i++) {
            var note = history[i];
            if (note.timestamp < t - HISTORY_TIME) {
                var index = array.indexOf(note);
                if (index > -1) {
                    array.splice(index, 1);
                }
            } 
        }        
    }
}

exports.differentiate = function (musician, key) {
    var history;
    if (key == 'il') {
        history = (musician == 1) ? il1_history : il1_history;
    } else if (key == 'rv') {
        history = (musician == 1) ? rb1_history : rb2_history;
    } else if (key == 'mv') {        
        history = (musician == 1) ? mb1_history : mb2_history;
    }

    var sum = 0;
    for (var i = 1; i < DERIVATIVE_HISTORY_SIZE; i++) {
        sum += (history[i] - history[i - 1]); 
    }
    var avg = sum / DERIVATIVE_HISTORY_SIZE * 10.0;
    return avg;
}

exports.articulation = function (musician) {
    var history = (musician == 1) ? musician1_history : musician2_history;

    var WINDOW_SIZE = 4;
    history = history.slice(0,WINDOW_SIZE * 2);
    var sum = 0;
    var max_duration = 0.0;
    var min_duration = 0.0;
    var notes = 0;
    if (history) {
        if (history.length > WINDOW_SIZE) {
            for (var i = history.length - 1; i > WINDOW_SIZE; i--) {
                var found = false;
                var note = history[i];
                if (note.action == 'on') {
                    for (var j = i - 1; j > 0; j--) {
                        var note_to_check = history[j];
                        if (note_to_check.action == 'off') {
                            if (note_to_check.note_letter == note.note_letter && !found) {
                                notes ++;
                                var duration = note_to_check.timestamp - note.timestamp;                            

                                // keep a running max/min for normalizing
                                if (duration > max_duration) {
                                    max_duration = duration;
                                } else if (duration < min_duration) {
                                    min_duration = duration;                                    
                                }
                                sum += duration;
                                found = true;
                            }
                        }
                    }
                }
            }
        }
    }
    var min = 80.0;
    var max = 500.0;
    var avg = math.max(min, math.min(max,sum/notes)) / (max - min);
    return math.max(0, math.min(1.0, avg - .19));
}

exports.harmonicBusiness = function (musician) {
    var history = (musician == 1) ? musician1_history : musician2_history;
    
    // filter out only the 'on' hits
    var on_history = history.filter(function (note) {
        return note.action == 'on';
    });

    var WINDOW_SIZE = 20;
    var sum = 0;
    if (on_history) {
        if (on_history.length > WINDOW_SIZE) {
            for (var i = 1; i < WINDOW_SIZE; i++) {
                var n1 = on_history[i];
                var n2 = on_history[i - 1];
                var diff = math.abs(n1.note_num - n2.note_num);
                sum += diff;                
            }
        }
    }

    // 35.0 is the range of velocities
    var range = 35.0;
    var hb = math.max(0.0, math.min(1.0, sum / (range * WINDOW_SIZE) * 2.0));

    if (hb != history[0] || history[0] == 0) {
        var history = (musician == 1) ? mb1_history : mb2_history;    
        if (history.length >= DERIVATIVE_HISTORY_SIZE) {
            history.pop();
        }
        history.unshift(hb);        
    }
    return hb;
}

exports.pattern = function (musician) {
    var num = math.random();
    if (num > .9) {
        return .3;
    } else if (num > .95) {
        return .6;
    } else {
        return 0;
    }
}

exports.intensityLevel = function (musician) {
    var history = (musician == 1) ? musician1_history : musician2_history;

    var WINDOW_SIZE = 10;
    var sum = 0;
    if (history) {    
        if (history.length > WINDOW_SIZE) {
            for (var i = 0; i < WINDOW_SIZE; i++) {
                var note = history[i];
                if (note.action == 'on') {
                    var vel = note.velocity - 40;
                    sum += math.max(0, vel);
                }
            }
        }
    }

    // 127 is the range of velocities
    var il = math.max(0.0, math.min(1.0, sum / (87.0 * WINDOW_SIZE) * 2.0));
    var history = (musician == 1) ? il1_history : il2_history;
    if (il != history[0] || history[0] == 0) {
        if (history.length >= DERIVATIVE_HISTORY_SIZE) {
            history.pop();
        }
        history.unshift(il);          
    }
    return il;
}

exports.rhythmicBusiness = function (musician) {
    var history = (musician == 1) ? musician1_history : musician2_history;

    // How many notes to compare against
    var WINDOW_SIZE = 10;
    var sum = 0;
    if (history) {
        if (history.length > WINDOW_SIZE) {
            for (var i = 1; i < WINDOW_SIZE; i++) {
                var n1 = history[i];
                var n2 = history[i - 1];
                var difference = n2.timestamp - n1.timestamp;
                sum += difference; 
            }
        }
    }
    // 500 is an empirically determined value
    var rv = sum / (500.0 * WINDOW_SIZE);

    var normalized = 1.0 - math.max(0, math.min(1.0, rv));

    var history = (musician == 1) ? rb1_history : rb2_history;    
    if (normalized != history[0] || history[0] == 0) {

        if (history.length >= DERIVATIVE_HISTORY_SIZE) {
            history.pop();
        }
        history.unshift(normalized);        
    }

    return normalized;
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
            if (beat.timestamp < top_bound && beat.timestamp > bottom_bound) {

                m1 = true;
                m1_hits = m1_hits + 1;

            }
        });

        musician2_history.forEach(function(beat) {
            if (beat.timestamp < top_bound && beat.timestamp > bottom_bound) {
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

    var history;

    if (note >= 60 && note <= 96) {
        history = musician1_history;
        relative_note = note - 60;
        key = "musician-1-midi";
    } else if (note >= 24 && note < 60) {
        history = musician2_history;
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

    if (history) {
        if (history.length >= HISTORY_SIZE) {
            history.pop();
        }
        history.unshift(message);        
    }

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