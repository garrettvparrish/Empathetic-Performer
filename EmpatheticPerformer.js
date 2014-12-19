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
math = require('mathjs'),
midi_analyzer = require("./musician/MidiAnalyzer.js");

var WebSocketServer = socket.Server
var wss = new WebSocketServer({port: 3000});

var CLIENTS = {};

var production_control = "";
var production_socket;
var m1_uuid = "";
var m2_uuid = "";
var audience_uuid = "";
var audience_control_uuid;

///////////////////////////////
////// WEB SOCKET SERVER //////
///////////////////////////////

var update_production = function (section, key, val) {
    if (production_socket) {
        production_socket.send(JSON.stringify({message:section+'-'+key, data:val}))        
    }
}

var trigger_audience = function (mes, val) {
    var to_send = JSON.stringify({message: mes, id: audience_uuid, data: val});
    var specificSocket = CLIENTS[audience_uuid];
    if (specificSocket) {
        specificSocket.send(to_send);
    }
}

var send_to_id = function (mes, i, d) {
    d = d ? d : "";
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

var trigger_heat = function (val) {
    var heat = musician_feedback.heat();
    if (heat) {
        heat.start(val * 255);        
    }
    update_production('musician-1', 'hot', val);
    update_production('musician-2', 'hot', val);
    update_production('musician-1', 'cld', 1.0-val);
    update_production('musician-2', 'cld', 1.0-val);
}

var trigger_color = function (val) {
    var color = musician_feedback.color();
    if (color) {
        color.start(val * 255);        
    }
    update_production('musician', 'color', val);
}

var trigger_brightness = function (val) {
    var brightness = musician_feedback.brightness();
    if (brightness) {
        brightness.start(val * 255);        
    }
    update_production('musician', 'brightness', val);
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
                trigger_heat(data);

            } else if (mes == "identify") {

                // utils.log("Identifying " + identifier + " as " + data);

                if (data == 'musician-1') {
                    m1_uuid = identifier;

                } else if (data == 'musician-1') {
                    m2_uuid = identifier;

                } else if (data == 'audience') {
                    audience_uuid = identifier;
                    setTimeout(function () {
                        update_production('status', 'audience', {data: true});
                    }, 3000);
                } else if (data == 'audience-control') {
                    audience_control_uuid = identifier; 
                    setTimeout(function () {
                        update_production('status', 'audience-control', {data: true});
                    }, 2500);
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
            } else if (mes == 'temperature-control') {
                trigger_heat(data);
            } else if (mes == 'vibration-control') {
                trigger_vib1(data);
                trigger_vib2(data);
            } else if (mes == 'color-control') {
                trigger_color(data);
            } else if (mes == 'brightness-control') {
                trigger_brightness(data);
            }
        }
    });

    // Initial stuff
    client_socket.uuid = utils.uuid();
    var to_send = JSON.stringify({message: "connection", id: client_socket.uuid});
    client_socket.send(to_send);
    CLIENTS[client_socket.uuid] = client_socket;

});

var HISTORY_SIZE = 20;

// Compute statistics 10x a second
setInterval(function () {
    var d = new Date();
    var t = d.getTime();

    midi_analyzer.update_histories();

    /////////////////////////////////////
    /////// COLLECTIVE ATTRIBUTES ///////
    /////////////////////////////////////

    // // collective attributes
    // var rs = midi_analyzer.rythmicSynchronicity(t);
    // update_production('collective', 'rs', rs);

    /////////////////////////////////////
    /////// INDIVIDUAL ATTRIBUTES ///////
    /////////////////////////////////////

    // Intensity Level
    var il1 = midi_analyzer.intensityLevel(1);
    if (il1 != 0) {
        update_production('musician-1', 'il', il1);
    }

    var il2 = midi_analyzer.intensityLevel(2);
    if (il2 != 0) {
        update_production('musician-2', 'il', il2);
    }

    // Collective
    var collective = math.abs(il1 - il2);
    trigger_audience('il', 1.0-collective);
    update_production('collective','il', 1.0-collective);

    // Intensity Business
    var ib1 = midi_analyzer.differentiate(1,'il');
    update_production('musician-1', 'iv', ib1);

    var ib2 = midi_analyzer.differentiate(2,'il');
    update_production('musician-2', 'iv', ib2);

    // Collective
    var collective = math.abs(ib1 - ib2);
    trigger_audience('ib', 1.0-collective);
    update_production('collective','ib', 1.0-collective);

    // Rhythmic Business
    var rb1 = midi_analyzer.rhythmicBusiness(1);
    if (rb1 != 0) {
        update_production('musician-1', 'rb', rb1);
    }
    var rb2 = midi_analyzer.rhythmicBusiness(2);
    if (rb2 != 0) {
        update_production('musician-2', 'rb', rb2);
    }

    // Collective
    var collective = math.abs(rb1 - rb2);
    trigger_audience('rb', 1.0-collective);
    update_production('collective','rb', 1.0-collective);

    // Rythmic Variation
    var rv1 = midi_analyzer.differentiate(1,'rv');
    update_production('musician-1', 'rv', rv1);

    var rv2 = midi_analyzer.differentiate(2,'rv');
    update_production('musician-2', 'rv', rv2);

    // Collective
    var collective = math.abs(rv1 - rv2);
    trigger_audience('rv', 1.0-collective);
    update_production('collective','rv', 1.0-collective);

    // Harmonic Business
    var mb1 = midi_analyzer.harmonicBusiness(1);
    if (mb1 != 0) {
        update_production('musician-1', 'hb', mb1);
    }

    var mb2 = midi_analyzer.harmonicBusiness(2);
    if (mb2 != 0) {
        update_production('musician-2', 'hb', mb2);
    }

    // Collective
    var collective = math.abs(mb1 - mb2);
    trigger_audience('mb', 1.0-collective);
    update_production('collective','mb', 1.0-collective);

    // Harmonic Variation
    var mv1 = midi_analyzer.differentiate(1,'mv');
    update_production('musician-1', 'mv', mv1);

    var mv2 = midi_analyzer.differentiate(2,'mv');
    update_production('musician-2', 'mv', mv2);

    // Collective
    var collective = math.abs(mv1 - mv2);
    trigger_audience('mv', 1.0-collective);
    update_production('collective','mv', 1.0-collective);

    // Patterns
    var p1 = midi_analyzer.pattern();
    update_production('musician-1', 'p', p1);

    var p2 = midi_analyzer.pattern();
    update_production('musician-2', 'p', p2);

    // Collective
    var collective = math.abs(p1 - p2);
    trigger_audience('p', 1.0-collective);
    update_production('collective','p', 1.0-collective);

    // Articulation
    var a1 = midi_analyzer.articulation(1);
    if (a1 != 0) {
        update_production('musician-1', 'a', a1);
    }    

    var a2 = midi_analyzer.articulation(2);
    if (a1 != 0) {
        update_production('musician-2', 'a', a2);
    }

    // Collective
    var collective = math.abs(a1 - a2);
    trigger_audience('a', 1.0-collective);
    update_production('collective','a', 1.0-collective);

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
