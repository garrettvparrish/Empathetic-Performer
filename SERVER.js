// Imports
var socket = require('ws')
var sys = require("sys"),  
my_http = require("http"),  
path = require("path"),  
url = require("url"),  
filesys = require("fs");  
keyboard = require("./MUSICIANS/KEYBOARD.js")

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
    utils.log("Sending '" + mes + "' to " + i + " with data: " + d);
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

            } else if (mes == "sync-start") {
                utils.log("Starting synchronization.");
                send_to_all("sync-start", "");

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

                v1.start(data * 255);
                v2.start(data * 255);
                h1.start(255);
                h2.start(255);

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
 
    if (fs.statSync(filename).isDirectory()) filename += 'AUDIENCE/AUDIENCE-CLIENT.html';
 
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

