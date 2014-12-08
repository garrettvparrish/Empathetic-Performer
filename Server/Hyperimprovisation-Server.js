var ws = require('ws')

uuid = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
}

var WebSocketServer = ws.Server
var wss = new WebSocketServer({port: 3000});

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