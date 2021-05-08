

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

var osc = audioCtx.createOscillator()
osc.frequency.value = 220;
const gainNode = audioCtx.createGain();
var gainMultiplier = 0;
var gainSave = 0;
var filter = audioCtx.createBiquadFilter();
filter.type = 'lowpass';

osc.connect(filter).connect(gainNode).connect(audioCtx.destination);

osc.start(0);
var playing = false;
gainNode.gain.value = 0;


//_______________________________________________
//______________Sliders&Buttons__________________

//Duty Slider
const dutyControl = document.querySelector('#duty');
var duty = 0.5;
dutyControl.addEventListener('input', function() {
    duty = this.value;
    changeWave(waveSelector.value, duty);
}, false);

//Filter Cutoff Slider
const cutoffControl = document.querySelector('#filtercutoff');
filter.frequency.value = 20000;
cutoffControl.addEventListener('input', function() {
    filter.frequency.value = logslider(this.value, 30, 20000);
}, false);

//Filter Q Slider
const qControl = document.querySelector('#filterq');
filter.Q.value = 0.0001;
qControl.addEventListener('input', function() {
    filter.Q.value = this.value;
}, false);

//Play Button
const playButton = document.querySelector('.tape-controls-play');
playButton.addEventListener('click', function() {
	if (playing === false) {
		playing = true;
	} else if (playing === true) {
		gainNode.gain.value = 0;
		playing = false;
	}
}, false);

//Shift Buttons
var semitone = Math.pow(2,1/12.0);
const shiftDownButton = document.querySelector('.shiftdown');
shiftDownButton.addEventListener('click', function() {
	minF = minF / semitone;
	maxF = maxF / semitone;
}, false);
const shiftUpButton = document.querySelector('.shiftup');
shiftUpButton.addEventListener('click', function() {
	minF = minF * semitone;
	maxF = maxF * semitone;
}, false);
const oshiftDownButton = document.querySelector('.oshiftdown');
oshiftDownButton.addEventListener('click', function() {
	minF = minF / 2;
	maxF = maxF / 2;
}, false);
const oshiftUpButton = document.querySelector('.oshiftup');
oshiftUpButton.addEventListener('click', function() {
	minF = minF * 2;
	maxF = maxF * 2;
}, false);

var minF = 330;
var maxF = 1320;
//Mouse Watcher
w = window.innerWidth;
h = window.innerHeight;
document.addEventListener("mousemove", function(e) {
        osc.frequency.value = logslider(e.clientX / w * 100, minF, maxF);
        if (playing===true) {
        	gainSave = (1 - e.clientY / h);
        	gainNode.gain.setTargetAtTime(gainSave*gainMultiplier, audioCtx.currentTime, 0.005);
        }
    });

function logslider(position, min, max) {
  // position will be between 0 and 100
  var minp = 0;
  var maxp = 100;

  // The result should be between 100 an 10000000
  var minv = Math.log(min);
  var maxv = Math.log(max);

  // calculate adjustment factor
  var scale = (maxv-minv) / (maxp-minp);

  return Math.exp(minv + scale*(position-minp));
}

//Key Watcher Down
var keyTrigger = false;
document.addEventListener ('keydown', function(event) {

  	if (event.code ==='ShiftLeft' && playing===true && keyTrigger===false) {
  		gainNode.gain.setTargetAtTime(gainSave, audioCtx.currentTime, 0.025);
  		gainMultiplier = 1;
  		keyTrigger = true;
  	}

});
//Key Watcher Up
document.addEventListener ('keyup', function(event) {

	if (event.code ==='ShiftLeft' && playing===true) {
  		gainMultiplier = gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.01);
  		keyTrigger = false;
  	}

});


//_____________________________________
//______________Waves__________________

//Wave Selector
const waveSelector = document.querySelector('#wave');
waveSelector.addEventListener('change', function() {
	changeWave(this.value, duty);
}, false);

function pulseArray(duty) {
	var imag = new Float32Array(49);
	imag[0] = 0;
	for (let n = 1; n < 100; n=n+1) {
		imag[n] = Math.abs(Math.sin(Math.PI*n*duty)/n);
	}
	return imag;
}

function sineArray() {
	var imag = new Float32Array([0,1]);

	return imag;
}

function sawArray() {
	var imag = new Float32Array(49);
	imag[0] = 0;
	for (let n = 1; n < 50; n=n+1) {
		imag[n] = 1.0/n;
	}
	return imag;
}

function triangleArray() {
	var imag = new Float32Array(49);
	imag[0] = 0;
	for (let n = 1; n < 50; n=n+1) {
		if (Math.mod(n,2)===0)
			imag[n] = 0;
		else
			imag[n] = 8 / Math.pow(Math.PI,2) * Math.pow(-1,(n+1)*0.5) / Math.pow(n,2);
	}
	return imag;
}

function guitarArray() {
	var imag = new Float32Array(49);
	imag[0] = 0;
	imag[1] = 0.639710700767524;
	imag[2] = 0.289285293751711
	imag[3] = 0.034360458213413;
	imag[4] = 0.016643547267352;
	return imag;
}

function malletArray() {
	var imag = new Float32Array(49);
	imag[0] = 0;

	return imag;
}

function changeWave(wave, duty) {
	var imag;
	switch(wave) {
		case 'sine':
			imag = sineArray();
			break;
		case 'pulse':
			imag = pulseArray(duty);
			break;
		case 'saw':
			imag = sawArray();
			break;
		case 'triangle':
			imag = triangleArray();
			break;
		case 'guitar':
			imag = guitarArray();
			break;
		case 'mallet':
			imag = malletArray();
			break;
		default:
			imag = sineArray();
	}

	var real = new Float32Array(imag.length);

	var wave1 = audioCtx.createPeriodicWave(real, imag, {disableNormalization: true});
	osc.setPeriodicWave(wave1);
}





