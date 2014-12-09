$(function () {

	////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////

	// Web socket connections
	var uuid = "";
	var synchronizationSocket;

	var send_message = function (key, d) {
		synchronizationSocket.send(JSON.stringify({message: key, id: uuid, data: d}));
	}

	synchronizationSocket = new WebSocket("ws://localhost:3000", "protocolOne");
	
	synchronizationSocket.onopen = function (event) {
		console.log("Socket connection opened.");
	};

	synchronizationSocket.onmessage = function (event) {
		var obj = JSON.parse(event.data);
		uuid = obj['id'];
		var message = obj['message'];
		console.log(message);

		// Establishing a new connection
		if (message == 'connection') {
			var res = {message: "identify", id: uuid, data: 'audience'};
		  	synchronizationSocket.send(JSON.stringify(res)); 
		}
	}

	synchronizationSocket.onclose = function (event) {
		var res = {message: "de-identify", id: uuid, data: 'audience'};
	  	synchronizationSocket.send(JSON.stringify(res)); 						
	}

	////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////
});