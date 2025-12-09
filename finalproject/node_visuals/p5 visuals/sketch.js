// COMMENTED OUT - ONLY ONE MODE NOW SINCE JUST NODE VISUALS let mode = 0; // 0 = summary screen, 1 = k-means viz
let clusters = [];
let points = [];
let centroids = [];
let genreSelect;
let selectedGenre= "All";
let mainfont;

function preload() {
  // make sure your CSVs are in the same folder as the sketch! 
  mainfont=loadFont('Courier New Bold.ttf'); 
  // here I'm using a custom font since I didn't like the default... just copied Courier New Bold to the folder

  // network tag representation data 
  fullTable = loadTable('diary_final.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(16);
  textFont(mainfont)

  // parse full table 
  if (fullTable.getRowCount() > 0) {
    let row = fullTable.rows[0];
    summary ={
        avgrating : row.get('Average Rating'),
        topGenres : parseList(row.get('Top 5 Genres')),
        topTags : parseList(row.get('Top 5 Tags')),
        languages : parseList(row.get('Languages Watched in')),
        avgMoviesPerMonth : row.get('Monthly Average'),
        totalMovies : row.get('Total Movie Number'),
        totalRuntime : row.get('Total Runtime (hrs)')
  };
}



let pca1s = k_meansTable.getColumn("PCA1").map(parseFloat);
let pca2s = k_meansTable.getColumn("PCA2").map(parseFloat);
let minX = Math.min(...pca1s);
let maxX = Math.max(...pca1s);
let minY = Math.min(...pca2s);
let maxY = Math.max(...pca2s);

for (let r = 0; r < k_meansTable.getRowCount(); r++) {
  let pca1 = float(k_meansTable.get(r, "PCA1"));
  let pca2 = float(k_meansTable.get(r, "PCA2"));
  let cluster = int(k_meansTable.get(r, "Palette Cluster"));


  let genreStr = k_meansTable.get(r, "GenreNames");
  let genres = parseList(genreStr).map(g => g.toLowerCase());
  let title = k_meansTable.get(r, "Name") || "(unknown title)";
  points.push({
    x: map(pca1, minX, maxX, 100, width - 100),
    y: map(pca2, minY, maxY, height - 100, 100),
    cluster,
    genres,
    title
  });
}
console.log("summary rows:", summaryTable.getRowCount());
console.log("k_means rows:", k_meansTable.getRowCount());
console.log("first PCA1:", k_meansTable.get(0, "PCA1"));
console.log("columns:", k_meansTable.columns);
}


// very basic draw loop: just shows toggle and calls upon either summary or clusters
function draw() {
  background(245);
 //draw nodes:

 
}

// resizes if the window itself changes! i've never tried this before. pretty cool
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}



// draw summary stats:
function drawSummary() {
  fill(0);
  textSize(18);
  textStyle(BOLD); 
  text("Movie Summary Stats", width / 2, 40);
  textStyle(NORMAL);
  textSize(14);
  textAlign(LEFT, TOP);

  let y = 100;
  text(`Average Rating: ${summary.avgrating}`, 80, y); y += 30;
  text(`Top 5 Genres: ${summary.topGenres.join(", ")}`, 80, y); y += 30;
  text(`Top 5 Tags: ${summary.topTags.join(", ")}`, 80, y); y += 30;
  text(`Languages Watched in: ${summary.languages.join(", ")}`, 80, y); y += 30;
  text(`Monthly Average: ${summary.avgMoviesPerMonth}`, 80, y);y += 30;
  text(`Total Movie Number: ${summary.totalMovies}`, 80, y);y += 30;
  text(`Total Runtime (in hours) ${summary.totalRuntime}`, 80, y);y += 30;

  textAlign(CENTER, CENTER);
  textSize(12);
  fill(100);
  text("(press SPACE to view K-Means visualization)", width / 2, height - 40);
}


// k means clustering viz:
function drawClusters() {
  background(0);
  textAlign(CENTER);
  fill(255);
  textSize(18);
  text("K-Means Clustering Visualization", width / 2, 40);
  textSize(14);
  text("(press SPACE to return to summary)", width / 2, height - 40);

  // plot points 

  for (let p of points) {
    let show =
      selectedGenre === "All" ||
      p.genres.some(g => g === selectedGenre.toLowerCase());
    if (!show) continue;

    let c = color((p.cluster * 70) % 255, 150, 255 - (p.cluster * 50) % 255);
    fill(c);
    noStroke();
    ellipse(p.x, p.y, 8);
  }


  // hover detection - used chat for this basic function 
  let hoverRadius = 10;
  let hovered = null;

  for (let p of points) {
    let show =
      selectedGenre === "All" ||
      p.genres.some(g => g === selectedGenre.toLowerCase());
    if (!show) continue;

    let d = dist(mouseX, mouseY, p.x, p.y);
    if (d < hoverRadius) {
      hovered = p;
      break;
    }
  }

  if (hovered) {
    fill(255);
    noStroke();
    textAlign(LEFT, BOTTOM);
    textSize(13);
    text(hovered.title, mouseX + 10, mouseY - 5);
  }
}


function parseList(str) {
  if (!str) return [];
  return str
    .replace(/[\[\]"']+/g, "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}