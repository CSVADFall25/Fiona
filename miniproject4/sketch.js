let circles = [];
let table;
let labels = [];
let tooltipGraphics;

function preload() {
  //  CSV is in the same folder as the sketch! titled "diary.csv" i believe this is default export file name from letterboxd 
  table = loadTable('diary.csv', 'csv', 'header');
}

function setup() {
  createCanvas(2000, 400);
  tooltipGraphics = createGraphics(2000, 400);
  colorMode(HSB);
  // draw() will run continuously to support hover interaction

  let minDate = getMinDate();
  let maxDate = getMaxDate();

  // Extract all values from CSV
  for (let r = 0; r < table.getRowCount(); r++) {
    let date = table.getString(r, 'Date');
    let name = table.getString(r, 'Name');
    let year = int(table.getString(r, 'Year'));
    let url = table.getString(r, 'Letterboxd URI');
    let rating = float(table.getString(r, 'Rating'));
    let rewatch = table.getString(r, 'Rewatch')==='Yes';
    let tags = table.getString(r, 'Tags');
    let watchedDate = new Date(table.getString(r, 'Watched Date'));


    // add all mappings here
    let size = map(rating, 0, 5, 10, 50); // size based on rating 
    let velocity = (random(0.5, 2)); // just random for now idk 
    let hue = map(year, 1950, 2025, 180, 360); // color for year
    let mappedX = map(watchedDate.getTime(), minDate.getTime(), maxDate.getTime(), 40, width - 40);


    circles.push(new Circle(size, velocity, hue, name, rating, year, tags, rewatch, url, mappedX));
  }
  // initial frame will be drawn in draw()
}


function draw() {
  background(10);
  // const center = createVector(width / 2, height / 2);
  for (let c of circles) {
    c.update();
    c.show();
  }
  drawTooltip();
}

function getMinDate() {
  let times = [];
  for (let r = 0; r < table.getRowCount(); r++) {
    times.push(new Date(table.getString(r, 'Watched Date')).getTime());
  }
  return new Date(min(times));
}

function getMaxDate() {
  let times = [];
  for (let r = 0; r < table.getRowCount(); r++) {
    times.push(new Date(table.getString(r, 'Watched Date')).getTime());
  }
  return new Date(max(times));
}

function drawTooltip() {
  tooltipGraphics.clear();

  for (let c of circles) {
    if (c.mouseOver(mouseX, mouseY)) {
      let lines = [
        `${c.name} (${c.year})`,
        `Rating: ${c.rating}`,
        `${c.rewatch ? 'Rewatch' : 'First time'}`,
        `${c.tags}`
      ];

      tooltipGraphics.fill(0, 180);
      tooltipGraphics.noStroke();
      let padding = 8;
      let tw = 0;
      for (let t of lines) tw = max(tw, textWidth(t));
      let boxW = tw + padding * 2;
      let boxH = lines.length * 16 + padding * 2;
      let tipX = constrain(mouseX + 10, 0, width - boxW);
      let tipY = constrain(mouseY - (boxH + 12), 0, height - boxH);
      tooltipGraphics.rect(tipX, tipY, boxW, boxH, 6);

      tooltipGraphics.fill(255);
      tooltipGraphics.textSize(12);
      for (let li = 0; li < lines.length; li++) {
        tooltipGraphics.text(lines[li], tipX + padding, tipY + padding + li * 16);
      }
    }
  }
  image(tooltipGraphics, 0, 0);
}
// Circle class
class Circle {
  constructor(r, velocity, hue, name, rating, year, tags, rewatch, url, x) {
    this.pos = createVector(x, random(height));
    this.vel = createVector(0, velocity);
    this.acc = createVector(0, 0);
    this.r = r;
    this.hue = hue;
    this.name = name;
    this.rating = rating;
    this.year = year;
    this.tags = tags;
    this.rewatch = rewatch;
    this.url = url;
  }

  update() {
    this.pos.y += this.vel.y;
    if (this.pos.y > height || this.pos.y < 0) this.vel.y *= -1;
  }

  show() {
    noStroke();
    if (this.rewatch) {
      stroke(255, 100);
      strokeWeight(1.5);
    }
    fill(this.hue, 200, map(this.rating, 0, 5, 80, 255), 0.9);
    circle(this.pos.x, this.pos.y, this.r * 2);
  }

  mouseOver(mx, my) {
    return dist(mx, my, this.pos.x, this.pos.y) < this.r;
  }
}
