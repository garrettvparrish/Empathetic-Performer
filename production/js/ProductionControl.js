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
		                height: 25,
		                title: "System Status"
			    	}
			  	]
			},
			{
			    type: 'row',
			    height: 15,
			    content: [
			    	{
			    		type: 'column',
						content: [					
					    	{
						        type:'component',
						        componentName: 'RS',
						        componentState: { text: 'RS' },
				                isClosable: false
					    	}]
					},
					{
						type: 'column',
						content: [
					    	{
						        type:'component',
						        componentName: 'MS',
						        componentState: { text: 'MS' },
				                isClosable: false
					    	}
						]
					},
					{
						type: 'column',
						content: [
					    	{
						        type:'component',
						        componentName: 'Empathy',
						        componentState: { text: 'Empathy' },
				                isClosable: false
					    	}
						]
					},
					{
						type: 'column',
						content: [
					    	{
						        type:'component',
						        componentName: 'Trust',
						        componentState: { text: 'Trust' },
				                isClosable: false
					    	}
						]
					},
					{
						type: 'column',
						content: [
					    	{
						        type:'component',
						        componentName: 'Harmonic Change',
						        componentState: { text: 'Harmonic Change' },
				                isClosable: false
					    	}
						]
					},
					{
						type: 'column',
						content: [
					    	{
						        type:'component',
						        componentName: 'Rhythmic Change',
						        componentState: { text: 'Rhythmic Change' },
				                isClosable: false
					    	}
						]
					}
				]
			},
			{
			    type: 'row',
			    height: 60,
			    content: [
			    	{
				        type:'component',
				        componentName: 'Musician 1',
				        componentState: { text: '' },
			    	},
			        {
				        type:'component',
				        componentName: 'Musician 2',
				        componentState: { text: '' },
				    }
			  	]
			  }
	  	]
	  }
	]};

	var myLayout = new GoldenLayout( config );

	myLayout.registerComponent( 'Empathetic Performer', function( container, state ){
		var el = container.getElement();
		el.html(templates.systemStatus());
	});

	// Collective Attributes

	var RS;
	myLayout.registerComponent( 'RS', function( container, state ){
		RS = container.getElement();
		RS.html( '<h2>' + state.text + '</h2>');
	});

	var MS;
	myLayout.registerComponent( 'MS', function( container, state ){
		MS = container.getElement();
		MS.html( '<h2>' + state.text + '</h2>');
	});

	var TRUST;
	myLayout.registerComponent( 'Trust', function( container, state ){
		TRUST = container.getElement();
		TRUST.html( '<h2>' + state.text + '</h2>');
	});

	var EMPATHY;
	myLayout.registerComponent( 'Empathy', function( container, state ){
		EMPATHY = container.getElement();
		EMPATHY.html( '<h2>' + state.text + '</h2>');
	});

	var RC;
	myLayout.registerComponent( 'Rhythmic Change', function( container, state ){
		RC = container.getElement();
		RC.html( '<h2>' + state.text + '</h2>');
	});

	var HC;
	myLayout.registerComponent( 'Harmonic Change', function( container, state ){
		HC = container.getElement();
		HC.html( '<h2>' + state.text + '</h2>');
	});

	var M1;
	var M1_history = [];
	myLayout.registerComponent( 'Musician 1', function( container, state ){
	    M1 = container.getElement();
	    M1.html(templates.musician({history: [], number: 1}));
	});

	var M2;
	var M2_history = [];
	myLayout.registerComponent( 'Musician 2', function( container, state ){
		M2 = container.getElement();
	    M2.html(templates.musician({history: [], number: 2}));
	});

	myLayout.init();

	var sync = false;

	function rgbToHex(R, G, B){ return toHex(R) + toHex(G) + toHex(B); }

	function toHex(n){
	    n = parseInt(n, 10);
	    if( isNaN(n) ){ 
	        return "00";
	    }
	    n = Math.max(0, Math.min(n,255));
	    return "0123456789ABCDEF".charAt((n - n % 16) / 16) + "0123456789ABCDEF".charAt(n % 16);
	}


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
	var productionControlSocket;

	var send_message = function (key, d) {
		productionControlSocket.send(JSON.stringify({message: key, id: uuid, data: d}));
	}

	var MUSICIAN_NOTE_HISTORY_SIZE = 8;

	setTimeout(function () {
		productionControlSocket = new WebSocket("ws://localhost:3000", "protocolOne");
		
		productionControlSocket.onopen = function (event) {
			console.log("Socket connection opened.");
		};

		productionControlSocket.onmessage = function (event) {
			var obj = JSON.parse(event.data);
			uuid = obj['id'];
			var message = obj['message'];
			var data = obj['data'];
			console.log(message);
			// New connection
			if (message == 'connection') {
				var res = {message: "production-handshake", id: uuid};
			  	productionControlSocket.send(JSON.stringify(res)); 
			  	$("#production").css('background-color', 'green');

			// Collective Attributes
			} else if (message == "collective-rc") {

				// RS.html(encloseIn('h2', data))
			} else if (message == 'collective-ms') {	
				// MS.html(encloseIn('h2', data))						
			} else if ( message == 'collective-trust') {
				// TRUST.html(encloseIn('h2', data))
			} else if ( message == 'collective-empathy') {
				// EMPATHY.html(encloseIn('h2', data))
			} else if ( message == 'collective-rc') {
				// RC.html(encloseIn('h2', data))
			} else if ( message == 'collective-hc') {
				// HC.html(encloseIn('h2', data))

			// Musician Attributes
			} else if (message.indexOf("musician") > -1) {
				var m1 = (message.charAt(9) == "1");
				var EL = m1 ? M1 : M2;
				var history = m1 ? M1_history : M2_history;
				var number = m1 ? 1 : 2;

				if (message.indexOf("midi") > -1) {

			        if (history.length >= MUSICIAN_NOTE_HISTORY_SIZE) {
			            history.pop();
			        }
					history.unshift(data);
					EL.html(templates.musician({history: history, number: number}));					

				// Musician feedback updates
				} else {
					var m1 = (message.charAt(9) == "1");
					var type = message.substring(11, message.length);
					var fullHeight = 100;

					// Vibration
					if (type == 'vib') {
						var id = '#feedback-m' + number + '-vib';
						console.log(data);
					  	$(id).css('background-color', '#' + rgbToHex(0, data * 255, 0));

					// Hot
					} else if (type == 'hot') {
						var id = '#feedback-m' + number + '-hot';
					  	$(id).css('background-color', '#' + rgbToHex(data * 255, 0, 0));
					
					// Cold
					} else if (type == 'cld') {
						var id = '#feedback-m' + number + '-cold';
					  	$(id).css('background-color', '#' + rgbToHex(0, 0, data * 255));

					// Business
					} else if (type == 'il') {
						if (data != 0) {
							console.log(data);
							console.log(data * fullHeight);
							var id = '#m' + number + '-intensity-level';
						  	$(id).css('height',  data*fullHeight + 'px');							
						}
					// Rythmic Variation
					} else if (type == 'a') {
						if (data != 0) {
							var id = '#m' + number + '-articulation';
						  	$(id).css('height',  data*fullHeight + 'px');
						}
					} else if (type == 'rb') {
						if (data != 0) {
							var id = '#m' + number + '-rhythmic-business';
						  	$(id).css('height',  data*fullHeight + 'px');
						}
					} else if (type == 'hb') {
						if (data != 0) {
							var id = '#m' + number + '-melodic-business';
						  	$(id).css('height',  data*fullHeight + 'px');
						}						
					} else if (type == 'iv') {
						if (data != 0) {
							var id = '#m' + number + '-intensity-variation';
						  	$(id).css('height',  data*fullHeight + 'px');
						}						
					} else if (type == 'rv') {
						if (data != 0) {
							var id = '#m' + number + '-rhythmic-variation';
						  	$(id).css('height',  data*fullHeight + 'px');
						}						
					} else if (type == 'mv') {
						if (data != 0) {
							var id = '#m' + number + '-melodic-variation';
						  	$(id).css('height',  data*fullHeight + 'px');
						}						
					} else if (type == 'p') {
						if (data != 0) {
							var id = '#m' + number + '-pattern';
						  	$(id).css('height',  data*fullHeight + 'px');
						}						
					}
				}

			} else if (message == 'status-midi') {
			  	$("#midi").css('background-color', 'green');
			} else if (message == 'status-biometric') {
			  	$("#biometric").css('background-color', 'green');
			} else if (message == 'status-audience') {
			  	$("#audience").css('background-color', 'green');				
			}
		}

		var syncButton = $("#sync");
		syncButton.bind("mousedown", function (event){
			syncButton.css('background-color', '#505050');
		});
		syncButton.bind("mouseup", function (event){
			if (!sync) {
				syncButton.css('background-color', 'green');
				var water = document.getElementById("water");
				console.log(water);
				water.play();
				water.addEventListener('ended', function () {
					syncButton.css('background-color', 'red');
					sync = !sync;
				});
			} else {
				syncButton.css('background-color', 'red');
				$("#water").stop();
			}
			sync = !sync;
		});

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

	var history = [];
	var SMOOTHING_SIZE = 5.0;

	for (var i = 0; i < SMOOTHING_SIZE; i++) {
		history.push(0.0);
	}

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

	    history.pop();
	    history.unshift(normalized);

	    var sum = 0;
	    for (var i = 0; i < SMOOTHING_SIZE; i++) {
			sum += history[i];	    	
	    }

	    normalized = normalized / SMOOTHING_SIZE * 5.0;

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