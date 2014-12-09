// $(function () {
    // Future-proofing...
    var context;
    if (typeof AudioContext !== "undefined") {
        context = new AudioContext();
    } else if (typeof webkitAudioContext !== "undefined") {
        context = new webkitAudioContext();
    } else {
        $(".hideIfNoApi").hide();
        $(".showIfNoApi").show();
        // return;
    }

    // Overkill - if we've got Web Audio API, surely we've got requestAnimationFrame. Surely?...
    // requestAnimationFrame polyfill by Erik M�ller
    // fixes from Paul Irish and Tino Zijdel
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
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
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);

    // Get the frequency data and update the visualisation
    function update() {
        requestAnimationFrame(update);

        analyser.getByteFrequencyData(frequencyData);
        console.log(frequencyData);
    };

    // Hook up the audio routing...
    // player -> analyser -> speakers
    // (Do this after the player is ready to play - https://code.google.com/p/chromium/issues/detail?id=112368#c4)
    $("#water").bind('canplay', function() {
      var source = context.createMediaElementSource(this);
      source.connect(analyser);
      analyser.connect(context.destination);
    });

    // Kick it off...
    update();
    
    $( document ).ready(function() {
      var water = document.getElementById('water');
      water.play();
    });

// var audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // define audio context
// // Webkit/blink browsers need prefix, Safari won't work without window.

// var voiceSelect = document.getElementById("voice"); // select box for selecting voice effect options
// var visualSelect = document.getElementById("visual"); // select box for selecting audio visualization options
// var mute = document.querySelector('.mute'); // mute button
// var drawVisual; // requestAnimationFrame

// var analyser = audioCtx.createAnalyser();
// var distortion = audioCtx.createWaveShaper();
// var gainNode = audioCtx.createGain();
// var biquadFilter = audioCtx.createBiquadFilter();

// function makeDistortionCurve(amount) { // function to make curve shape for distortion/wave shaper node to use
//   var k = typeof amount === 'number' ? amount : 50,
//     n_samples = 44100,
//     curve = new Float32Array(n_samples),
//     deg = Math.PI / 180,
//     i = 0,
//     x;
//   for ( ; i < n_samples; ++i ) {
//     x = i * 2 / n_samples - 1;
//     curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
//   }
//   return curve;
// };

// navigator.getUserMedia (
//   // constraints - only audio needed for this app
//   {
//     audio: true
//   },

//   // Success callback
//   function(stream) {
//     source = audioCtx.createMediaStreamSource(stream);
//     source.connect(analyser);
//     analyser.connect(distortion);
//     distortion.connect(biquadFilter);
//     biquadFilter.connect(gainNode);
//     gainNode.connect(audioCtx.destination); // connecting the different audio graph nodes together

//     visualize(stream);
//     voiceChange();

//   },

//   // Error callback
//   function(err) {
//     console.log('The following gUM error occured: ' + err);
//   }
// );

// function visualize(stream) {
//   WIDTH = canvas.width;
//   HEIGHT = canvas.height;

//   var visualSetting = visualSelect.value;
//   console.log(visualSetting);

//   if(visualSetting == "sinewave") {
//     analyser.fftSize = 2048;
//     var bufferLength = analyser.frequencyBinCount; // half the FFT value
//     var dataArray = new Uint8Array(bufferLength); // create an array to store the data

//     canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

//     function draw() {

//       drawVisual = requestAnimationFrame(draw);

//       analyser.getByteTimeDomainData(dataArray); // get waveform data and put it into the array created above

//       canvasCtx.fillStyle = 'rgb(200, 200, 200)'; // draw wave with canvas
//       canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

//       canvasCtx.lineWidth = 2;
//       canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

//       canvasCtx.beginPath();

//       var sliceWidth = WIDTH * 1.0 / bufferLength;
//       var x = 0;

//       for(var i = 0; i < bufferLength; i++) {

//         var v = dataArray[i] / 128.0;
//         var y = v * HEIGHT/2;

//         if(i === 0) {
//           canvasCtx.moveTo(x, y);
//         } else {
//           canvasCtx.lineTo(x, y);
//         }

//         x += sliceWidth;
//       }

//       canvasCtx.lineTo(canvas.width, canvas.height/2);
//       canvasCtx.stroke();
//     };

//     draw();

//   } else if(visualSetting == "off") {
//     canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
//     canvasCtx.fillStyle = "red";
//     canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
//   }

// }

// function voiceChange() {
//   distortion.curve = new Float32Array;
//   biquadFilter.gain.value = 0; // reset the effects each time the voiceChange function is run

//   var voiceSetting = voiceSelect.value;
//   console.log(voiceSetting);

//   if(voiceSetting == "distortion") {
//     distortion.curve = makeDistortionCurve(400); // apply distortion to sound using waveshaper node
//   } else if(voiceSetting == "biquad") {
//     biquadFilter.type = "lowshelf";
//     biquadFilter.frequency.value = 1000;
//     biquadFilter.gain.value = 25; // apply lowshelf filter to sounds using biquad
//   } else if(voiceSetting == "off") {
//     console.log("Voice settings turned off"); // do nothing, as off option was chosen
//   }

// }

// // event listeners to change visualize and voice settings

// visualSelect.onchange = function() {
//   window.cancelAnimationFrame(drawVisual);
//   visualize(stream);
// }

// voiceSelect.onchange = function() {
//   voiceChange();
// }

// mute.onclick = voiceMute;

// function voiceMute() { // toggle to mute and unmute sound
//   if(mute.id == "") {
//     gainNode.gain.value = 0; // gain set to 0 to mute sound
//     mute.id = "activated";
//     mute.innerHTML = "Unmute";
//   } else {
//     gainNode.gain.value = 1; // gain set to 1 to unmute sound
//     mute.id = "";    
//     mute.innerHTML = "Mute";
//   }
// }