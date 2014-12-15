// Imports
var socket = require('ws')
var sys = require("sys"),  
my_http = require("http"),  
path = require("path"),  
url = require("url"),  
filesys = require("fs");  
// keyboard = require("./MUSICIANS/KEYBOARD.js")

utils = require("./utils.js");
musician_feedback = require("./MUSICIANS/MUSICIAN-FEEDBACK.js");

var WebSocketServer = socket.Server
var wss = new WebSocketServer({port: 3000});

var sync_uuid = "";
var m1_uuid = "";
var m2_uuid = "";
var audience_members = [];

///////////////////////////////
////// WEB SOCKET SERVER //////
///////////////////////////////

var CLIENTS = {};

var send_to_id = function (mes, i, d) {
    d = d ? d : "";
    // utils.log("Sending '" + mes + "' to " + i + " with data: " + d);
    var to_send = JSON.stringify({message: mes, id: i, data: d});
    var specificSocket = CLIENTS[i];
    specificSocket.send(to_send);   
} 

var send_to_all = function (message, data) {
    for(var c in CLIENTS) {
        send_to_id(message, c, data);
    }
}

var send_to_audience = function (mes, d) {
    for (i in audience_members) {
        send_to_id(mes, audience_members[i], d);
    }
}

// Server connection
wss.on('connection', function(client_socket) {

	// add a handler
    client_socket.on('message', function(message) {

        // Not an object
        if (message.indexOf("{") < 0) {
            utils.log("Invalid message: " + message);
            if (message == "ALL") {
                send_to_all("HELLO");
            }

        // Valid json object
        } else {
            var obj = JSON.parse(message);
            var mes = obj['message'];
            var identifier = obj['id'];
            var data = obj['data'];

            utils.log("Received: '" + message + "'");

            // handshake of the sync device
            if (mes == "sync-handshake") {
                sync_uuid = identifier;
                utils.log("Synchronization system connected at " + sync_uuid);

            } else if (mes == "trigger-sync") {
                utils.log("Starting synchronization.");
                send_to_all("start-sync", "");
            } else if (mes == "sync-amp") {
                utils.log("Audio Data: " + data);                
                send_to_all("audio-amp", data);

                // Vibrate the feedback to musicians in correspondence
                // with the amplitude of the incoming signal                
                // Musician feeback 
                var v1 = musician_feedback.vib1();
                var v2 = musician_feedback.vib2();
                var h1 = musician_feedback.hot1();
                var h2 = musician_feedback.hot2();
                var c1 = musician_feedback.cold1();
                var c2 = musician_feedback.cold2();

                if (v1 && v2 & h1 & h2 & c1 & c2) {
                    v1.start(data * 255);
                    v2.start(data * 255);
                    h1.start(data * 255);
                    h2.start(data * 255);
                    c1.start(data * 255);
                    c2.start(data * 255);                    
                }

            } else if (mes == "identify") {

                utils.log("Identifying " + identifier + " as " + data);

                if (data == 'musician-1') {
                    m1_uuid = identifier;

                } else if (data == 'musician-1') {
                    m2_uuid = identifier;

                } else if (data == 'audience') {
                    audience_members.push(identifier);
                    utils.log("Current Audience Members: " + audience_members);
                }

            // de-identifying a participant in some way
            } else if (mes == "de-identify") {
                utils.log("De-identifying " + identifier + " from " + data);
                if (data == 'audience') {
                    var index = array.indexOf(identifier);
                    if (index > -1) {
                        audience_members.splice(index, 1);
                    }
                }
                utils.log("Current Audience Members: " + audience_members);
            }            
        }
    });

    // Initial stuff
    client_socket.uuid = utils.uuid();
    var to_send = JSON.stringify({message: "connection", id: client_socket.uuid});
    client_socket.send(to_send);
    CLIENTS[client_socket.uuid] = client_socket;

});

///////////////////////////////
//// AUDIENCE FILES SERVER ////
///////////////////////////////

var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 8888;
 
http.createServer(function(request, response) {
 
  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);
  
  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }
 
    if (fs.statSync(filename).isDirectory()) filename += 'AUDIENCE/audience.html';//AUDIENCE-CLIENT.html';
 
    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }
 
      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10));
 
utils.log("Static file server running at http://localhost:" + port);




/////////////////////////////////
// MIDI LISTENER & INTERPRETER //
/////////////////////////////////

var midi = require('midi');

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

    var m1_hits = 0;
    var m2_hits = 0;

    while (tracker < WINDOW_SIZE) {
        // Top and lower bound through out the past x milliseconds
        var top_bound = timestamp - tracker;
        var bottom_bound = top_bound - BEAT_SIZE; 

        console.log("Checking " + top_bound + " to " + bottom_bound);

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

        console.log("Musician 1 hit " + m1_hits + " times in the last 5 seconds.");
        console.log("Musician 2 hit " + m2_hits + " times in the last 5 seconds.");
        console.log("Both musicians hit at the same time " + collective_hits + " times");

        // Calculates the rythmic syncrony 
        var ratio = collective_hits/(m1_hits/2 + m2_hits/2) + .2;
        if (isNaN(ratio)) {
            ratio = 0.0;
        }

        console.log("Ratio: " + ratio);

        // turn on vibrators according to sychrony
        musician_feedback.setVibes(ratio);
            
        // trigger the audience
        send_to_all('audio-amp', ratio);

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


