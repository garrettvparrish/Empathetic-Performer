var a = 0;
var p = 0;
var mv = 0;
var mb = 0;
var rv = 0;
var rb = 0;
var il = 0;
var iv = 0;

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

	var main = document.getElementById("body");
	
	// Web socket connections
	var uuid = "";
	var audienceSocket;
	
	audienceSocket = new WebSocket("ws://localhost:3000", "protocolOne");

	var send_message = function (key, d) {
		audienceSocket.send(JSON.stringify({message: key, id: uuid, data: d}));
	}
	
	audienceSocket.onopen = function (event) {
		console.log("Socket connection opened.");
		// audienceSocket.send(JSON.stringify({message: }))
	};

	audienceSocket.onmessage = function (event) {

		var obj = JSON.parse(event.data);
		var message = obj['message'];
		var data = obj['data'];

		// Establishing a new connection -- send a handshake
		if (message == 'connection') {
			uuid = obj['id'];

			var res = {message: "identify", id: uuid, data: 'audience'};
		  	audienceSocket.send(JSON.stringify(res)); 

		// Play the audio file
		} 

		if (message == 'audio-amp') {
			var val = parseFloat(data);
			var rgb = "#" + rgbToHex(val * 30, val * 90, val * 255); 
			document.body.style.backgroundColor = rgb;
		}

		if (message == 'il') il = data;
		if (message == 'ib') ib = data;
		if (message == 'a') a = data;
		if (message == 'p') p = data;
		if (message == 'mv') mv = data;
		if (message == 'mb') mb = data;
		if (message == 'rv') rv = data;
		if (message == 'rb') rb = data;
	}
});