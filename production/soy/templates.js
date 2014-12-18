// This file was automatically generated from templates.soy.
// Please don't edit this file by hand.

if (typeof templates == 'undefined') { var templates = {}; }


templates.musician = function(opt_data, opt_ignored) {
  var output = '\t<table style="width:100%">';
  var noteList4 = opt_data.history;
  var noteListLen4 = noteList4.length;
  for (var noteIndex4 = 0; noteIndex4 < noteListLen4; noteIndex4++) {
    var noteData4 = noteList4[noteIndex4];
    output += '<tr><td class="label">Mode</td><td class="value">' + soy.$$escapeHtml(noteData4.mode) + '</td><td class="label">Note Number</td><td class="value">' + soy.$$escapeHtml(noteData4.note_num) + '</td><td class="label">Octave Number</td><td class="value">' + soy.$$escapeHtml(noteData4.octave) + '</td><td class="label">Velocity</td><td class="value">' + soy.$$escapeHtml(noteData4.velocity) + '</td><td class="label">Action</td><td class="value">' + soy.$$escapeHtml(noteData4.action) + '</td><td class="label">Time Stamp</td><td class="value">' + soy.$$escapeHtml(noteData4.timestamp) + '</td></tr>';
  }
  output += '</table>';
  return output;
};


templates.systemStatus = function(opt_data, opt_ignored) {
  return '\t<table style="width:100%"><tr><td class="status-label">Biometric Feedback</td><td class="status-label">Midi Keyboard</td><td class="status-label">Production Control</td><td class="status-label">Audience Visuals</td></tr><tr><td class="status"><center><div class="status-indicator" id="biometric"> </div></center></td><td class="status"><center><div class="status-indicator" id="midi"> </div></center><td class="status"><center><div class="status-indicator" id="production" style="background-color: \'green\';"> </div></center></td><td class="status"><center><div class="status-indicator" id="audience"> </div></center></td></tr></table>';
};