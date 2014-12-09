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

wss.on('connection', function(ws) {
	utils.log("New socket connection.");

	var send_to_id = function (mes, i) {
		utils.log("Sending '" + mes + "' to " + i);
		ws.send(JSON.stringify({message: mes, id: i}));	
	} 

	// Message handler
    ws.on('message', function(message) {
		var obj = JSON.parse(message);
		var mes = obj['message'];

    	utils.log("Received: '" + message + "'");

    	// handshake of the sync device
    	if (mes == "sync-handshake") {
    		sync_uuid = obj['id'];
	    	utils.log("Synchronization system connected at " + sync_uuid);

	    	// Start sync
	    	// utils.log("Starting synchronization.");
			// send_to_id("start-sync", sync_uuid);
    	} else if (mes == "sync-audio") {
    		utils.log("Audio Data: " + obj['data']);
    		// now send to trigger other stuff

    	} else if (mes == "identify") {
    		utils.log("Identifying " + obj['id'] + " as " + obj['name']);
    		if (obj['name'] == 'musician-1') {
    			m1_uuid = obj['id'];
    		} else if (obj['name'] == 'musician-1') {
    			m2_uuid = obj['id'];
    		}
    	}
    });

    var response = {message: "connection",
			id: utils.uuid()};
	send_to_id("connection", utils.uuid());
	var res_string = JSON.stringify(response);
    ws.send(res_string);

});


// my_http.createServer(function(request,response){  
//     var my_path = url.parse(request.url).pathname;
// 	var url_parts = url.parse(request.url, true);
// 	var query = url_parts.query;

// 	var success = function () {
// 		response.writeHeader(200);    
//         response.write("Success");    
//         response.end();
// 	}

// 	// Volume Control
//     if (my_path == '/v') {
// 		var v = query['val'];
// 		console.utils.log('V :' + v)
// 		success();
//         breathEmulator1.start((1.0-v) * 255);
//         breathEmulator2.start((1.0-v) * 255);

//     // Temperature Control
//     } else if (my_path == '/t') {
// 		var t = query['val'];
// 		console.utils.log('T :' + t)
// 		success();
// 		temperatureEmulator.start((1.0-t) * 200);
//     // Syncronization
// 	} else if (my_path == '/r') {
// 		breathEmulator1.stop();
// 		temperatureEmulator.stop();
// 		// RUN SYNCHRONIZATION ROUTINE
// 		runSynchronizationRoutine();
// 		success();

// 	// Server the files
//     } else {
// 	    var full_path = path.join(process.cwd(),my_path);  
// 	    path.exists(full_path, function(exists){  
// 	        if(!exists){  
// 	            response.writeHeader(404, {"Content-Type": "text/plain"});    
// 	            response.write("404 Not Found\n");    
// 	            response.end();  
// 	        }  
// 	        else {  
// 	            filesys.readFile(full_path, "binary", function(err, file) {    
// 	                 if(err) {    
// 	                     response.writeHeader(500, {"Content-Type": "text/plain"});    
// 	                     response.write(err + "\n");    
// 	                     response.end();   
// 	                 }    
// 	                 else{  
// 	                    response.writeHeader(200);    
// 	                    response.write(file, "binary");    
// 	                    response.end();  
// 	                }  
	                       
// 	            });  
// 	        }
// 	    });
//     }
// }).listen(8080);  
// sys.puts("Server Running on 8080");


var runSynchronizationRoutine = function () {
	console.utils.log("SYNCRONIZATION");
	// setTimeout(func, 4000);
	// function func() {
	//     alert('Do stuff here');
	// }
};
