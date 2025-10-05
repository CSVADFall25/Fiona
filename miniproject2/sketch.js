// I adapted the code for the triadic/tetradic color schemes, combining it w/horizontal mouse movement of Accent Palette 
// Now, a split complementary scheme is default. 
// When toggled between modes, second mode allows user to change the lightness/saturation
// In split complementary mode -- mouse position changes base hue value. 

let outerRadius = 200;
let innerRadius = 100; // hole size
let steps = 360/15; // resolution
let mode = 'splitComp'; // default, toggle to 'lightness' to change color lightness
lasthues = [];
let baseHue = 0;
let squareWidth = 800/3;


function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 360, 100, 100);
  noStroke();
}

function draw() {
  background(100);
  if(mode === 'splitComp'){
    drawRing();
    drawSplitCompColors();
  } else if(mode === 'lightness'){
    changeLightness();
  }
  fill(0);
  text('click to toggle mode',50, height-50);
}

function mousePressed(){
  if(mode === 'splitComp'){
    mode = 'lightness';
  } else if(mode === 'lightness'){
    mode = 'splitComp';
  } 
}


function drawSplitCompColors(){
  // Map mouseX to hue (0–360)
  let baseHue = map(mouseX, 0, width, 0, 360);

  let squareWidth = width/3;
  // Square 1: base hue -- this stays the same with split complementary
  fill((baseHue + 0) % 360, 100, 100);
  rect(0, 0, squareWidth, height/4);
  drawColorPosition(baseHue);

  // Square 2: base + 150
  fill((baseHue + 150) % 360, 100, 100);
  rect(squareWidth, 0, squareWidth, height/4);
  drawColorPosition(baseHue + 150);

  // Square 3: base + 210
  fill((baseHue + 210) % 360, 100, 100);
  rect(squareWidth * 2, 0, squareWidth, height/4);
  drawColorPosition(baseHue + 210);

  lasthues = [baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360];

}

function changeLightness(){
  // here, just keeping the little squares from last mode to show the colors!

  let b = map(mouseY, 0, height, 100, 0); // brightness corresponds to vertical mouse
  let s = map(mouseX, 0, width, 0, 100); // saturation corresponds to horizontal mouse


  fill(lasthues[0], b, s);
  rect(0, 0, squareWidth, height/4);

  fill(lasthues[1], b, s);
  rect(squareWidth, 0, squareWidth, height/4);

  fill(lasthues[2], b, s);
  rect(squareWidth * 2, 0, squareWidth, height/4);

}

function drawColorPosition(hue){
  push();
  translate(width / 2, height / 2); 
  let x1 = cos(radians(hue)) * (innerRadius+(outerRadius-innerRadius)/2);
  let y1 = sin(radians(hue)) * (innerRadius+(outerRadius-innerRadius)/2);
  fill(0);
  ellipse(x1, y1, 20,20);
  pop();
}

function drawRing(){
  push();
  translate(width / 2, height / 2); // center of canvas

  

  for (let angle = 0; angle < 360; angle+=steps) {
    let nextAngle = angle + steps;

    // Outer edge points
    let x1 = cos(radians(angle)) * outerRadius;
    let y1 = sin(radians(angle)) * outerRadius;
    let x2 = cos(radians(nextAngle)) * outerRadius;
    let y2 = sin(radians(nextAngle)) * outerRadius;

    // Inner edge points
    let x3 = cos(radians(nextAngle)) * innerRadius;
    let y3 = sin(radians(nextAngle)) * innerRadius;
    let x4 = cos(radians(angle)) * innerRadius;
    let y4 = sin(radians(angle)) * innerRadius;

    fill(angle, 100, 100);
    quad(x1, y1, x2, y2, x3, y3, x4, y4);
   
  }
  pop();

}