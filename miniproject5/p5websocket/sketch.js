// Create WebSocket connection.
const socket = new WebSocket('ws://localhost:8765');
let bgHue = 0;
// Connection opened
socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
});

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
    //assumes data from serial is 0-255
    bgHue = map(event.data, 20, 35, 0, 360);
});

function setup() {
  createCanvas(400, 400);
}

function draw() {
  colorMode(HSB, 360, 100, 100);
  background(bgHue, 100, 100);
}