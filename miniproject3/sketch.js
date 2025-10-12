// For this mini assignment, I modified the harmonic armature sketch so that the user is able to manually create their own
// composition lines. I used a similar mechanism as the point tracking sketch in order to add each dot to the canvas.

// Instructions: click once to add a dot, click another time to create the second dot and connect them with a line. 
// Highlight the line by clicking on it, and delete by pressing "delete" key. Press space bar to toggle between hiding and 
// showing the lines.

let img;
let input;
let showlines = true;
let points = []; // array for points
let pairs = []; //array for point pairs
let margin = 0;
let clickThreshold = 8; // how close (in pixels) a click must be to select a line

function setup() {
  createCanvas(800, 600);
  imageMode(CORNER);
  noLoop();

  // File input for uploading an image
  input = createFileInput(handleFile);
  input.position(10, 10);
}


function draw() {
  background(240);

  if (img) {
    // Fit image to canvas
    let aspect = img.width / img.height;
    let w = width;
    let h = width / aspect;
    if (h > height) {
      h = height;
      w = height * aspect;
    }
// keep this all consistent with source code
    let x = (width - w) / 2;
    let y = (height - h) / 2;

    image(img, x, y, w, h);

    if (showlines) {
      drawpoints();
      drawlines();
    }
    
    // draw preview line if odd number of points
    if (points.length % 2 === 1) {
        stroke(255);
        strokeWeight(1);
        line(points[points.length - 1].x, points[points.length - 1].y, mouseX, mouseY);
    }
  
  } else {
    fill(100);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("Upload an image to manually create composition lines", width / 2, height / 2);
  }
}

 // Draw all points and pairs
   colorMode(HSB);
   function drawlines(){
    for (let i = 0; i < pairs.length; i++) {
        let pair = pairs[i];
        // draw the connecting line
        if (pair.highlighted) {
            stroke(hue(pair.color), 100, 100); // Brighter when highlighted
            strokeWeight(3);
        } else {
            stroke(hue(pair.color), 70, 80); // Normal color
            strokeWeight(2);
        }
        line(pair.p1.x, pair.p1.y, pair.p2.x, pair.p2.y);
    }
   }
    
    
    // Draw all points
    function drawpoints(){
    colorMode(RGB);
    for (let i = 0; i < points.length; i++) {
        // Draw point
        if (i % 2 === 0) {
            fill(255, 0, 0); // First point in pair: red
        } else {
            fill(0, 255, 0); // Second point in pair: green
        }
        noStroke();
        ellipse(points[i].x, points[i].y, 10, 10);
    }}


function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      resizeCanvas(img.width, img.height);
      points = [];
      pairs = [];
      redraw();
    });
  }
}

  
  //  line visibility
  if (key === ' ') {  //  spacebar for toggle
    showlines = !showlines;
    redraw();
  }


function addPoint(x, y) {
    let newPoint = createVector(x, y);
    points.push(newPoint);
    
    // if we have an even number of points, create a new pair
    if (points.length % 2 === 0) {
        let lastIndex = points.length - 1;
        pairs.push({
            p1: points[lastIndex - 1],
            p2: points[lastIndex],
            color: color(random(360), 70, 80, 0.5) // Random hue, constant saturation and brightness
        });
    }
    redraw(); // redraw the canvas to show the new point/pair
}


function mousePressed() {
  let nearest = findNearestPair(mouseX, mouseY);
  if (nearest !== -1) {
    // Toggle highlight on existing line
    pairs[nearest].highlighted = !pairs[nearest].highlighted;
  } else {
    // Add new point
    addPoint(mouseX, mouseY);
  }
  redraw();
}

function keyPressed() {
  if (keyCode === DELETE || keyCode === BACKSPACE) {
    // Remove highlighted lines
    pairs = pairs.filter(p => !p.highlighted);

    // Rebuild points list
    points = [];
    for (let p of pairs) {
      points.push(p.p1);
      points.push(p.p2);
    }
    redraw();
    return;
  }

  if (key === ' ') {
    showlines = !showlines;
    redraw();
  }
}

function findNearestPair(x, y) {
    let closestDist = clickThreshold;
    let closestIndex = -1;
    
    // Check each pair
    for (let i = 0; i < pairs.length; i++) {
        let pair = pairs[i];
        let dist = distToSegment(
            createVector(x, y),
            createVector(pair.p1.x, pair.p1.y),
            createVector(pair.p2.x, pair.p2.y)
        );
        if (dist < closestDist) {
            closestDist = dist;
            closestIndex = i;
        }
    }
    
    return closestIndex;
}

function distToSegment(p, v, w) {
    // Returns distance from point p to line segment vw
    let l2 = p5.Vector.sub(w, v).magSq();
    if (l2 === 0) return p5.Vector.sub(p, v).mag();
    
    let t = max(0, min(1, p5.Vector.sub(p, v).dot(p5.Vector.sub(w, v)) / l2));
    let proj = p5.Vector.add(v, p5.Vector.mult(p5.Vector.sub(w, v), t));
    return p5.Vector.sub(p, proj).mag();
}
