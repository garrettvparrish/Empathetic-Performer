var http = require("http");
var url = require('url');
var SerialPort = require("serialport").SerialPort

var HISTORYMAX = 100;

// move to right
var min = 50;
// move to left
var max = 50;

var m1xHistory = [];
var m2xHistory = [];
var m1yHistory = [];
var m2yHistory = [];

http.createServer(function(request, response) {
	var url_parts = url.parse(request.url, true);
	var query = url_parts.query;

	var x = query['x'];
	var z = query['z'];
	var n = query['n'];

	// Only fires if it actually gets stuff
	if (x || y || z || n) {

		if (x.substring(0,1) == '-') {
			x = parseInt(x.substring(3,5));
			x = (x > max) ? max : x;
			x = max - x;
		} else {
			// range from 50 - 99	
			x = parseInt(x.substring(2,4));
			x = (x > max) ? max : x;
			x += max - 1;
		}

		if (z.substring(0,1) == '-') {
			z = parseInt(z.substring(3,5));
			z = (z > max) ? max : z;
			z =  max - z;
		} else {	
			// range from 50 - 99	
			z = parseInt(z.substring(2,4));
			z = (z > max) ? max : z;
			z += max - 1;
		}

		var string = '$' + x + ',' + z + ',' + n;
		console.log(string);
		serialPort.write(string);
	}

    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
}).listen(8888);


var receivedData = "";
serialPort = new SerialPort("/dev/tty.usbmodem1411", {
    baudrate: 250000,
    // defaults for Arduino serial communication
    dataBits: 8, 
    parity: 'none', 
    stopBits: 1, 
    flowControl: false 
});

serialPort.on("open", function () {
  console.log('Serial Communication Initiated');
	serialPort.on('data', function(data) {
	    console.log('Response: ' + data);
	});
});  
