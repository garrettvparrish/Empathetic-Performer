// Imports
var ws = require('ws')
var sys = require("sys"),  
my_http = require("http"),  
path = require("path"),  
url = require("url"),  
filesys = require("fs");  

utils = require("./utils.js");
audience = require("./audienceControl.js");

var WebSocketServer = ws.Server
var wss = new WebSocketServer({port: 3000});

var sync_uuid = "";
var m1_uuid = "";
var m2_uuid = "";
var audience_members = [];

///////////////////////////////
////// WEB SOCKET SERVER //////
///////////////////////////////

wss.on('connection', function(ws) {
	utils.log("New client connection.");

	var send_to_id = function (mes, i, d) {
		// utils.log("Sending '" + mes + "' to " + i + "with data: " + d);
		d = d ? d : "";
		var to_send = JSON.stringify({message: mes, id: i, data: d});
		ws.send(to_send);	
	} 

	// Message handler
    ws.on('message', function(message) {

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
            if (mes == "sync-handshake") {
                sync_uuid = identifier;
                utils.log("Synchronization system connected at " + sync_uuid);

            } else if (mes == "sync-amp") {
                utils.log("Audio Data: " + data);

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

	send_to_id("connection", utils.uuid());
});

///////////////////////////////
//// AUDIENCE FILES SERVER ////
///////////////////////////////

var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
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

