let mode = 0; // 0 = summary screen, 1 = k-means viz
let clusters = [];
let points = [];
let centroids = [];
let genreSelect;
let selectedGenre= "All";

function preload() {
  // make sure your CSVs are in the same folder as the sketch! 
  summaryTable = loadTable('summary_stats.csv', 'csv', 'header');   
  k_meansTable = loadTable('df_colors.csv', 'csv', 'header');
  console.log(k_meansTable.columns);

   // not using this right now but might add later since i'm interested in doing node network representation w/tags 
  fullTable = loadTable('diary_final.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(16);

  // quickly parse summary stats
  if (summaryTable.getRowCount() > 0) {
    let row = summaryTable.rows[0];
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

// dropdown for genre
  genreSelect = createSelect();
  genreSelect.position(20, 20);
  genreSelect.option("All");
  for (let g of summary.topGenres) {
    genreSelect.option(g);
  }
  genreSelect.changed(() => {
    selectedGenre = genreSelect.value();
  });
  genreSelect.hide(); // hidden on summary screen

// now parsing k means data, adding all clusters/points/centroid data

// for this section below, needed to scale correctly so that the points fit nicely on the canvas
// used Chat GPT to help with automatic scaling 
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
  
  points.push({
    x: map(pca1, minX, maxX, 100, width - 100),
    y: map(pca2, minY, maxY, height - 100, 100),
    cluster,
    genres
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

  if (mode === 0) {
    drawSummary();
    genreSelect.hide();
  } else {
    drawClusters();
    genreSelect.show();
  }
}

// resizes if the window itself changes! i've never tried this before 
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// spacebar pressed toggle fn
function keyPressed() {
  if (key === ' ') {
    mode = (mode + 1) % 2; // toggle between 0 and 1
  }
}


// draw summary stats:
function drawSummary() {
  fill(0);
  textSize(18);
  text("Movie Summary Stats", width / 2, 40);
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

  //plot points 

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
}


function parseList(str) {
  if (!str) return [];
  return str
    .replace(/[\[\]"']+/g, "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}