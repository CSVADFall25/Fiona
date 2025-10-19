// general description of project:
// takes in mic input, and draws based on features of the sound. uses built in fft fn to get precise frequency data.

// mappings:
// x coordinate determined by mouse position, y coordinate by frequency
// hue is picked by user 
// strokeweight determined by volume (louder = thicker)

// user info:
// initial screen toggle should provide instructions to the user. intentionally, it isn't an intuitive program
// as I don't want to have it simply represent audio input but rather, feel more dynamic. so hopefully this is enough
// guidance to get them started and allow for experimentation! 

// notes: using built in sound library in p5, and DOM color picker. AI used for some syntax/class structure help, as well as the curve smoothing and spacing technique
let mic;
let fft;
let vol = 0;
let smoothedVol = 0;
let smoothedFreq = 0;

let brushstrokes = [];
let currentStroke = null;
let isDrawing = false;
let started = false;

let huePicker;

let addPointEvery = 3; // sample interval (in frames) for adding a point
let frameCounter = 0; // here, tally as each frame progresses -- used with modulo to sample every 3 frames 


function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  background(0);

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT();
  fft.setInput(mic);

  textAlign(CENTER, CENTER);
  textSize(18);

  // color picker 
  huePicker = createColorPicker('#b46de3'); // default color
  huePicker.position(12, 12);

  // small label near picker
  let label = createDiv('Choose color');
  label.position(12, 40);
  label.style('color', '#fff');
  label.style('font-size', '12px');
}

function mousePressed() {
  userStartAudio();
}


function keyPressed() {
  if (key === ' ') {
    started = !started;
    if (started) background(0);
  } 
}

// brushstroke class - store/display points
class Brushstroke {
  constructor(hue, sat, bri) {
    this.hue = hue; // 0..360
    this.sat = sat;
    this.bri = bri;
    this.points = [];
  }

  addPoint(x, y, size) {
    // remove very close points/small moves to avoid huge arrays
    if (this.points.length) {
      let last = this.points[this.points.length - 1];
      let d = dist(x, y, last.x, last.y);
      if (d < 2) return; 
    }
    this.points.push({ x, y, size });
    // limit length (memory)
    if (this.points.length > 600) this.points.shift();
  }

  update() {
    // could add things here if wanted
  }

  display() {
    if (this.points.length < 2) return;
    noFill();
    stroke(this.hue, this.sat, this.bri, 90);

    for (let i= 0; i < this.points.length-1; i++) { // here, we iterate thru every point so that each has its own correct size 
      let p1 = this.points[i];
      let p2 = this.points[i+1]; // next point or self if at end
      strokeWeight(p1.size||2); // defaults to 2 if undefined size
      line(p1.x, p1.y, p2.x, p2.y);
    } 

  }
}

function draw() {
  if (!started) {
    background(0);
    fill(255);
    noStroke();
    text("Press SPACE to begin. Click screen with cursor 1x if nothing outputs. \nUse color picker to choose hue. Control horizontal movement with mouse, brush thickness with volume, and vertical movement with frequency.", width / 2, height / 2 - 20);
    return;
  }

  // translucent background
  background(0, 18);

  // read audio
  vol = mic.getLevel();
  smoothedVol = lerp(smoothedVol, vol, 0.18); // using lerp function to smooth changes in volume 

  let spectrum = fft.analyze();
  let nyquist = sampleRate() / 2; 
  let idx = spectrum.indexOf(max(spectrum));
  let freq = idx * (nyquist / spectrum.length);
  smoothedFreq = lerp(smoothedFreq, freq, 0.12); // here, also smoothing the changes in frequency 

  // mapping x to mouse position
  let targetX = mouseX;

  // limit on frequency range for mapping, so it's reasonable for human voice 
  let minF = 80;
  let maxF = 1000;
  let mappedY = map(smoothedFreq, minF, maxF, height, 0, true);

  // volume -> size 
  let mappedSize = map(pow(smoothedVol +1e-7, 0.3), 0, 1, 1, 40, true);

  // just setting hue/sat/brightness from the color picker 
  let picked = color(huePicker.value());
  colorMode(HSB, 360, 100, 100, 100); 
  let pickedHue = hue(picked);
  let pickedSat = saturation(picked);
  let pickedBri = brightness(picked);


  // logic for curve smoothing:
  // Use a smoothed position generator so points are not instantaneous:
  // using a cursor that lerps towards target...
  if (!currentStroke) currentStroke = { cursorX: targetX, cursorY: mappedY, strokeObj: null };

  // update cursor to create organic movement (slow follow = natural curves)
  currentStroke.cursorX = lerp(currentStroke.cursorX, targetX, 0.18);
  currentStroke.cursorY = lerp(currentStroke.cursorY, mappedY, 0.18);

  // sample points only every N frames to avoid extremely dense points and to create a gentle spacing
  frameCounter++;
  if (smoothedVol > 0.004) { // voice threshold to begin stroke
    if (!isDrawing) {
      isDrawing = true;
      currentStroke.strokeObj = new Brushstroke(pickedHue, pickedSat, pickedBri);
    }
    if (frameCounter % addPointEvery === 0) {
      currentStroke.strokeObj.addPoint(currentStroke.cursorX, currentStroke.cursorY, mappedSize);
    }
  } else if (isDrawing) {
    // finish stroke
    isDrawing = false;
    if (currentStroke.strokeObj && currentStroke.strokeObj.points.length > 1) {
      brushstrokes.push(currentStroke.strokeObj);
    }
    currentStroke = { cursorX: targetX, cursorY: mappedY, strokeObj: null };
  }

  // update + display all strokes
  for (let s of brushstrokes) {
    s.update();
    s.display();
  }
  // show current in-progress
  if (currentStroke && currentStroke.strokeObj) currentStroke.strokeObj.display();

  // UI overlays
  push();
  noStroke();
  fill(255);
  textSize(12);
  textAlign(LEFT, TOP);
  text(`Freq: ${nf(smoothedFreq,1,0)} Hz`, 12, 70);
  text(`Vol: ${nf(smoothedVol,1,4)}`, 12, 86);
  pop();
}
