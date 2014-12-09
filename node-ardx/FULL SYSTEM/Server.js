var ws = require('ws')

var WebSocketServer = ws.Server
var wss = new WebSocketServer({port: 3000});

utils = require("./utils.js");

wss.on('connection', function(ws) {
	console.log("New socket connection.");

    ws.on('message', function(message) {
        console.log('received: %s', message);
    });

    var response = {message: "connection-successful",
			id: uuid()};
	console.log(response);
	var res_string = JSON.stringify(response);
    ws.send(res_string);

});