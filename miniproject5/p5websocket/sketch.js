// Create WebSocket connection.
const socket = new WebSocket('ws://localhost:8765');
let bgHue = 180; //cyan background!
let prevButton = 0;
let fishnum = 10; // starts with 10 fish
let fishsat = 0; // starts with no saturation
let fishArray = []; //storing all fish objects
 
// connection opened
socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
});

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);

    let types = event.data.split(",");
    if (types.length > 2){
      temp = float(types[0]);
      humid = float(types[1]);
      button = int(types[2]); // 0/1 for not pressed/pressed
    }

    generateFish(temp, humid);
    removeFish(button);
});

function generateFish(temp, hum) {
  fishArray = [];
  let fishnum = int(map(hum, 0, 100, 1, 10));
  let fishsat = int(map(temp, 0, 40, 160, 20));

  for (let i = 0; i < numFish; i++) {
    fishArray.push(new Fish(random(width), random(height), hueVal, random(20, 60)));
  }
}

function removeFish(button) {
  if (button == 1 && prevButton == 0 && fishArray.length > 0) {
    fishArray.pop();
  }
  prevButton = button;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  colorMode(HSB, 360, 100, 100);
  background(bgHue, 100, 100);
}