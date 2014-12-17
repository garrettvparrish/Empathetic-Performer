// fork getUserMedia for multiple browser versions, for those that need prefixes

navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || 
                          navigator.mozGetUserMedia || navigator.msGetUserMedia);

// set up forked web audio context, for multiple browsers window. is needed otherwise Safari explodes

// Create the 
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Voice selector
var voiceSelect = document.getElementById("voice");

// Audio Kit Elements
var source;
var stream;

// Mute / Sync Buttons
var mute = document.querySelector('.mute');

// Set up the different audio nodes we will use for the app

var analyser = audioCtx.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;

var distortion = audioCtx.createWaveShaper();
var gainNode = audioCtx.createGain();
var biquadFilter = audioCtx.createBiquadFilter();
var convolver = audioCtx.createConvolver();

// Distortion curve for the waveshaper, thanks to Kevin Ennis
// http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion
function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};

// set up canvas context for visualizer

var canvas = document.querySelector('.visualizer');
var canvasCtx = canvas.getContext("2d");

var intendedWidth = document.querySelector('.wrapper').clientWidth;

canvas.setAttribute('width',intendedWidth);

var visualSelect = document.getElementById("visual");

var drawVisual;

// main block for doing the audio recording

var createRecordingGraph = function () {
  if (navigator.getUserMedia) {
    console.log('getUserMedia supported.');
    navigator.getUserMedia (
      // constraints - only audio needed for this app
      {
         audio: true
      },
      // Success callback
      function(stream) {
        console.log("Audio Graph Created");
         source = audioCtx.createMediaStreamSource(stream);

         source.connect(analyser);
         analyser.connect(distortion);
         distortion.connect(biquadFilter);
         biquadFilter.connect(convolver);
         convolver.connect(gainNode);
         gainNode.connect(audioCtx.destination);

      	 visualize();
         voiceChange();
      },
      // Error callback
      function(err) {
         console.log('The following gUM error occured: ' + err);
      }
    );
  } else {
     console.log('getUserMedia not supported on your browser!');
  }
}

// Visualization function (canvas)
function visualize() {

  WIDTH = canvas.width;
  HEIGHT = canvas.height;
  var visualSetting = visualSelect.value;

  if(visualSetting == "sinewave") {

    analyser.fftSize = 1024;
    var bufferLength = analyser.fftSize;
    var dataArray = new Float32Array(bufferLength);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
      drawVisual = requestAnimationFrame(draw);

      analyser.getFloatTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'rgb(200, 200, 200)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

      canvasCtx.beginPath();

      var sliceWidth = WIDTH * 1.0 / bufferLength;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {
   
        var v = dataArray[i] * 200.0;
        var y = HEIGHT/2 + v;

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height/2);
      canvasCtx.stroke();
    };

    draw();

  } else if(visualSetting == "frequencybars") {
    analyser.fftSize = 256;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Float32Array(bufferLength);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
      drawVisual = requestAnimationFrame(draw);

      analyser.getFloatFrequencyData(dataArray);

      canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      var barWidth = (WIDTH / bufferLength) * 2.5;
      var barHeight;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] + 140)*2;
        
        canvasCtx.fillStyle = 'rgb(' + Math.floor(barHeight+100) + ',50,50)';
        canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

        x += barWidth + 1;
      }
    };

    draw();

  } else if(visualSetting == "off") {
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    canvasCtx.fillStyle = "red";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  }
}

function voiceChange() {
  distortion.curve = new Float32Array;
  distortion.oversample = '4x';
  biquadFilter.gain.value = 0;
  convolver.buffer = undefined;

  var voiceSetting = voiceSelect.value;

  if(voiceSetting == "distortion") {
    distortion.curve = makeDistortionCurve(400);
  } else if(voiceSetting == "convolver") {
    convolver.buffer = concertHallBuffer;
  } else if(voiceSetting == "biquad") {
    biquadFilter.type = "lowshelf";
    biquadFilter.frequency.value = 1000;
    biquadFilter.gain.value = 25;
  } else if(voiceSetting == "off") {
    console.log("Voice settings turned off");
  }
}

// event listeners to change visualize and voice settings

visualSelect.onchange = function() {
  console.log("Changed");
  window.cancelAnimationFrame(drawVisual);
  visualize();
}

voiceSelect.onchange = function() {
  voiceChange();
}

// Mute Button

mute.onclick = voiceMute;

function voiceMute() {
  if(mute.id == "") {
    gainNode.gain.value = 0;
    mute.id = "activated";
    mute.innerHTML = "Unmute";
  } else {
    gainNode.gain.value = 1;
    mute.id = "";    
    mute.innerHTML = "Mute";
  }
}

// Synchronization
var syncAnalyzer = audioCtx.createAnalyser();
syncAnalyzer.minDecibels = -90;
syncAnalyzer.maxDecibels = -10;
syncAnalyzer.smoothingTimeConstant = 0.85;

var syncBuffer;

// crete javascript node and connect to destination
var javascriptNode = audioCtx.createScriptProcessor(2048, 1, 1);

var synchronize = document.querySelector('.synchronization');

synchronize.onclick = function () {
  console.log("Initializing Synchronization.");

  // load the sound file into the buffer
  bufferLoader = new BufferLoader(audioCtx, ['./audio/water.mp3'], function (bufferList) {

    var synchronization = audioCtx.createBufferSource();
    synchronization.buffer = bufferList[0];
    synchronization.connect(audioCtx.destination);
    synchronization.start(0);

    // Graph of source --> sync analyzer --> destination (output sound)
    source = synchronization;
    source.connect(syncAnalyzer);
    syncAnalyzer.connect(audioCtx.destination);

    mapToVolume();
  });
  bufferLoader.load();
}

var mapToVolume = function () {

  syncAnalyzer.fftSize = 1024;
  var bufferLength = syncAnalyzer.fftSize;
  var dataArray = new Float32Array(bufferLength);

  function computeAverage() {
    drawVisual = requestAnimationFrame(computeAverage);

    var array =  new Uint8Array(syncAnalyzer.frequencyBinCount);
    syncAnalyzer.getByteFrequencyData(array);
    var average = getAverageVolume(array)
    console.log(average);
  };

  computeAverage();
}

javascriptNode.onaudioprocess = function() { 
  // get the average, bincount is fftsize / 2
  var array =  new Uint8Array(syncAnalyzer.frequencyBinCount);
  syncAnalyzer.getByteFrequencyData(array);
  var average = getAverageVolume(array) 
  console.log(average);
}

// Helper averaging function
function getAverageVolume(array) {
  var values = 0;
  var average;

  var length = array.length;
  for (var i = 0; i < length; i++) {
      values += array[i];
  }
  average = values / length;
  return average;
}

createRecordingGraph();