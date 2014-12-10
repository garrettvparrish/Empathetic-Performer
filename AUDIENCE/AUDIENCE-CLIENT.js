$(function () {

	// UI helper functions
	function rgbToHex(R, G, B){ return toHex(R) + toHex(G) + toHex(B); }

	function toHex(n){
	    n = parseInt(n, 10);
	    if( isNaN(n) ){ 
	        return "00";
	    }
	    n = Math.max(0, Math.min(n,255));
	    return "0123456789ABCDEF".charAt((n - n % 16) / 16) + "0123456789ABCDEF".charAt(n % 16);
	}

	var main = document.getElementById("main");
	
	// Web socket connections
	var uuid = "";
	var audienceMemberSocket;
	

	audienceMemberSocket = new WebSocket("ws://18.111.9.98:3000", "protocolOne");

	var send_message = function (key, d) {
		audienceMemberSocket.send(JSON.stringify({message: key, id: uuid, data: d}));
	}
	
	audienceMemberSocket.onopen = function (event) {
		console.log("Socket connection opened.");
	};

	audienceMemberSocket.onmessage = function (event) {

		var obj = JSON.parse(event.data);
		var message = obj['message'];
		var data = obj['data'];
		console.log(event.data);

		// Establishing a new connection -- send a handshake
		if (message == 'connection') {
			uuid = obj['id'];

			var res = {message: "identify", id: uuid, data: 'audience'};
		  	audienceMemberSocket.send(JSON.stringify(res)); 

		// Play the audio file
		} 

		if (message == 'start-sync') {
			console.log("Playing sound");

			var water = document.getElementById("water");
			water.play();

		// Update the display
		}

		if (message == 'audio-amp') {
			var val = parseFloat(data);
			var rgb = "#" + rgbToHex(val * 30, val * 90, val * 255); 
			main.style.backgroundColor = rgb;
		}
	}
});