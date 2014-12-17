$(function () {

	////////////////////////////////////////////////////////
	///////////////////// Golden Layout ////////////////////
	////////////////////////////////////////////////////////

	var config = {
	  content: [{
	    type: 'column',
	    content: [
			{
			    type: 'row',
			    content: [
			    	{
				        type:'component',
				        componentName: 'Empathetic Performer',
				        componentState: { text: 'Empathetic Performer' },
		                isClosable: false,
		                height: 20,
		                title: "Empathetic Performer"
			    	}
			  	]
			},
			{
			    type: 'row',
			    content: [
			    	{
			    		type: 'column',
						content: [					
					    	{
						        type:'component',
						        componentName: 'RS',
						        componentState: { text: 'RS' },
				                isClosable: false
					    	}

						]
					}
			  	]
			},
			{
			    type: 'row',
			    content: [
			    	{
				        type:'component',
				        componentName: 'Musician 1',
				        componentState: { text: 'Musician 1' },
		                isClosable: false
			    	},
			        {
				        type:'component',
				        componentName: 'Musician 2',
				        componentState: { text: 'Musician 2' },
		                isClosable: false
				    }
			  	]
			  },
			  {
			    type: 'row',
			    content: [
			    	{
				        type:'component',
				        componentName: 'Audience',
				        componentState: { text: 'Audience' },
		                isClosable: false
			    	}
			  	]
			  }
	  	]
	  }
	]};

	var myLayout = new GoldenLayout( config );

	myLayout.registerComponent( 'Empathetic Performer', function( container, state ){
		var el = container.getElement();
		el.html( '<h2>' + state.text + '</h2>');
	});

	var RS;
	myLayout.registerComponent( 'RS', function( container, state ){
		RS = container.getElement();
		RS.html( '<h2>' + state.text + '</h2>');
	});

	myLayout.registerComponent( 'Musician 1', function( container, state ){
	  container.getElement().html( '<h2>' + state.text + '</h2>');
	});

	myLayout.registerComponent( 'Musician 2', function( container, state ){
	  container.getElement().html( '<h2>' + state.text + '</h2>');
	});

	myLayout.registerComponent( 'Audience', function( container, state ){
	  container.getElement().html( '<h2>' + state.text + '</h2>');
	});

	myLayout.init();

	////////////////////////////////////////////////////////
	///////////////////// Playing Audio ////////////////////
	////////////////////////////////////////////////////////

	// Future-proofing...
	var context;
	if (typeof AudioContext !== "undefined") {
	    context = new AudioContext();
	} else if (typeof webkitAudioContext !== "undefined") {
	    context = new webkitAudioContext();
	} else {
	    $(".hideIfNoApi").hide();
	    $(".showIfNoApi").show();
	}


	// Web socket connections
	var uuid = "";
	var synchronizationSocket;

	var send_message = function (key, d) {
		synchronizationSocket.send(JSON.stringify({message: key, id: uuid, data: d}));
	}

	setTimeout(function () {
		synchronizationSocket = new WebSocket("ws://localhost:3000", "protocolOne");
		
		synchronizationSocket.onopen = function (event) {
			console.log("Socket connection opened.");
		};

		synchronizationSocket.onmessage = function (event) {
			var obj = JSON.parse(event.data);
			uuid = obj['id'];
			var message = obj['message'];
			var data = obj['data'];

			// New connection
			if (message == 'connection') {
				var res = {message: "production-handshake", id: uuid};
			  	synchronizationSocket.send(JSON.stringify(res)); 

			// Updating UI
			} else if ( message == 'collective-rs') {
				RS.html('<h2>' + data + '</h2>')
			}
		}
	}, 2000);

	////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////

	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
	    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
	                                || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
	    window.requestAnimationFrame = function (callback, element) {
	        var currTime = new Date().getTime();
	        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	        var id = window.setTimeout(function () { callback(currTime + timeToCall); },
	            timeToCall);
	        lastTime = currTime + timeToCall;
	        return id;
	    };

	if (!window.cancelAnimationFrame)
	    window.cancelAnimationFrame = function (id) {
	        clearTimeout(id);
	    };

	// Create the analyser
	var analyser = context.createAnalyser();
	analyser.fftSize = 64;
	var frequencyData = new Uint8Array(analyser.frequencyBinCount);

	var min = 65;
	var max = 140;

	// Get the frequency data and update the visualisation
	function update() {
	    requestAnimationFrame(update);

	    analyser.getByteFrequencyData(frequencyData);
	    var sum = 0
	    for (i in frequencyData) {
	    	sum += frequencyData[i];
	    }
	    var avg = sum / frequencyData.length;
	    var normalized = ((avg-min)/(max-min)).toFixed(2);
	    normalized = normalized < 0.0 ? 0.0 : normalized;
	    normalized = normalized > 1.0 ? 1.0 : normalized;

	    // triggered audio data
	    if (normalized != 0) {
	        console.log(normalized);	
	        send_message("sync-amp", normalized)	        	
	    }
	};

	// Hook up the audio routing...
	// player -> analyser -> speakers
	$("#water").bind('canplay', function() {
		var source = context.createMediaElementSource(this);
		source.connect(analyser);
		analyser.connect(context.destination);
	});

	update();
});