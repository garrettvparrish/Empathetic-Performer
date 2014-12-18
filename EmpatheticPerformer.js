// Imports

var socket = require('ws'),
sys = require("sys"),  
my_http = require("http"),  
path = require("path"),  
url = require("url"),  
filesys = require("fs"),
audience = require("./audience/AudienceFileServer.js"),
utils = require("./lib/utils.js"),
musician_feedback = require("./musician/BiometricFeedback.js"),
midi_analyzer = require("./musician/MidiAnalyzer.js");

var WebSocketServer = socket.Server
var wss = new WebSocketServer({port: 3000});

var CLIENTS = {};

var production_control = "";
var production_socket;
var m1_uuid = "";
var m2_uuid = "";
var audience_uuid = "";

///////////////////////////////
////// WEB SOCKET SERVER //////
///////////////////////////////

var update_production = function (section, key, val) {
    if (production_socket) {
        production_socket.send(JSON.stringify({message:section+'-'+key, data:val}))        
    }
}

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
    send_to_id(mes, audience, d);
}

/////////////////////////////////////
///////// Update Functions //////////
/////////////////////////////////////

var trigger_vib1 = function (val) {
    var v1 = musician_feedback.vib1();
    if (v1) {
        v1.start(val * 255);        
    }
    update_production('musician-1', 'vib', val);
}

var trigger_vib2 = function (val) {
    var v2 = musician_feedback.vib2();
    if (v2) {
        v2.start(val * 255);        
    }
    update_production('musician-2', 'vib', val);
}

var trigger_hot1 = function (val) {
    var h1 = musician_feedback.hot1();
    if (h1) {
        h1.start(val * 255);        
    }
    update_production('musician-1', 'hot', val);
}

var trigger_hot2 = function (val) {
    var h2 = musician_feedback.hot2();
    if (h2) {
        h2.start(val * 255);        
    }
    update_production('musician-2', 'hot', val);
}

var trigger_cold1 = function (val) {
    var c1 = musician_feedback.cold1();
    if (c1) {
        c1.start(val * 255);        
    }
    update_production('musician-1', 'cld', val);
}

var trigger_cold2 = function (val) {
    var c2 = musician_feedback.cold2();
    if (c2) {
        c2.start(val * 255);        
    }
    update_production('musician-2', 'cld', val);
}

/////////////////////////////////////
/////// WEB SOCKET HANDLERS /////////
/////////////////////////////////////

// Server connection
wss.on('connection', function(client_socket) {

	// add a handler
    client_socket.on('message', function(message) {

        // Not an object
        if (message.indexOf("{") < 0) {
            utils.log("Invalid message: " + message);

        // Valid json object
        } else {
            var obj = JSON.parse(message);
            var mes = obj['message'];
            var identifier = obj['id'];
            var data = obj['data'];

            utils.log("Received: '" + message + "'");

            // handshake of the sync device
            if (mes == "production-handshake") {
                production_control = identifier;
                production_socket = CLIENTS[identifier];
                utils.log("Production system connected at " + production_control);

            } else if (mes == "trigger-sync") {

                utils.log("Starting synchronization.");
                send_to_all("start-sync", ""); 

            } else if (mes == "sync-amp") {

                send_to_all("audio-amp", data);

                trigger_vib1(data);
                trigger_vib2(data);

            } else if (mes == "identify") {

                utils.log("Identifying " + identifier + " as " + data);

                if (data == 'musician-1') {
                    m1_uuid = identifier;

                } else if (data == 'musician-1') {
                    m2_uuid = identifier;

                } else if (data == 'audience') {
                    setTimeout(function () {
                        update_production('status', 'audience', {data: true});
                    }, 3000);
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

// Compute statistics 10x a second
setInterval(function () {
    var d = new Date();
    var t = d.getTime();

    // collective attributes
    var rs = midi_analyzer.rythmicSynchronicity(t);
    update_production('collective', 'rs', rs);


    // INDIVIDUAL ATTRIBUTES

    // Intensity Level
    var il1 = midi_analyzer.intensityLevel(1);
    update_production('musician-1', 'il', il1);
    var il2 = midi_analyzer.intensityLevel(2);
    update_production('musician-2', 'il', il2);

    // Intensity Business

    // Rhythmic Business
    var b1 = midi_analyzer.rhythmicBusiness(1);
    update_production('musician-1', 'rb', b1);
    var b2 = midi_analyzer.rhythmicBusiness(2);
    update_production('musician-2', 'rb', b2);

    // Rythmic Variation

    // Harmonic Business

    // Harmonic Variation

    // Patterns

    // Articulation

    
    // update_production('collective', 'ms', 0);
    // update_production('collective', 'trust', 0);
    // update_production('collective', 'empathy', 0);
    // update_production('collective', 'rc', 0);
    // update_production('collective', 'hc', 0);

}, 100)

// Event emitters from other systems

var midi = midi_analyzer.midiEmitter();
midi.on('musician-1-midi', function (data) {
    update_production('musician-1', 'midi', data);
});

midi.on('musician-2-midi', function (data) {
    update_production('musician-2', 'midi', data);
})

midi.on('midi-status', function (data) {
    update_production('status', 'midi', data);
});

var biometric = musician_feedback.biometricFeedbackEmitter();
biometric.on('status', function (data) {
    update_production('status', 'biometric', '');
})
