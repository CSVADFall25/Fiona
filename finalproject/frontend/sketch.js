let mode = 0; // 0 = summary, 1 = k-means viz
let clusters = [];
let points = [];
let centroids = [];
let genreSelect;
let selectedGenre= "All";
let mainfont;

let minX, maxX, minY, maxY;

function preload() {
  // Load custom font if available; if not, p5 will use default
  try {
    mainfont = loadFont('Courier New Bold.ttf');
  } catch (e) {
    console.warn('[sketch] Font not found, using default:', e.message);
    mainfont = null; // use p5 default if font file not found
  }
}

function setup() {
  // here, canvas is handled differently, so you toggle it on/off with DOM 
  const cnv = createCanvas(windowWidth, windowHeight);   // Create canvas and attach to wrapper so we can show/hide it via DOM
  const wrap = document.getElementById('canvas-wrap');
  if (wrap) cnv.parent('canvas-wrap');

  textAlign(CENTER, CENTER);
  textSize(16);
  if (mainfont) textFont(mainfont); // only set font if it loaded successfully

// Listen for view mode changes from the DOM
window.addEventListener('setMode', (e) => {
    const m = e?.detail?.mode;
    if (typeof m === 'number') {
      mode = m;
      syncVisibility();
    }
});

// Listen for live diary data from script.js
window.addEventListener("diaryData", (e) => {
    handleDiaryData(e.detail);
  });
}

function syncVisibility() {
  const wrap = document.getElementById("canvas-wrap");
  const results = document.getElementById("results-container");

  if (wrap) wrap.style.display = (mode === 1 ? "block" : "none");
  if (results) results.style.display = (mode === 0 ? "block" : "none");

  if (mode === 1) genreSelect.show();
  else genreSelect.hide();
}

// this function takes in the incoming data and rebuilds all of the points that will then be displayed 
function handleDiaryData(payload) {
  if (!payload || !payload.diary) return;

  const rows = payload.diary;
  points = [];

  const pca1s = rows.map(r => +r.PCA1).filter(v => !isNaN(v));
  const pca2s = rows.map(r => +r.PCA2).filter(v => !isNaN(v));

  console.log('[sketch] received diary rows:', rows.length);
  if (pca1s.length === 0) {
    console.warn('[sketch] no PCA1 values available — cannot visualize');
    points = [];
    return;
  }

  minX = Math.min(...pca1s);
  maxX = Math.max(...pca1s);
  minY = Math.min(...pca2s);
  maxY = Math.max(...pca2s);

  // guard against zero range (all identical values)
  if (minX === maxX) { minX -= 0.5; maxX += 0.5; }
  if (minY === maxY) { minY -= 0.5; maxY += 0.5; }


  for (let r of rows) {
    let pca1 = +r.PCA1;
    let pca2 = +r.PCA2;
    if (isNaN(pca1) || isNaN(pca2)) continue;

    let cluster = Number(
      r["Palette Cluster"] ??
       0
    );

    let genres = [];
    if (Array.isArray(r.GenreNames)) genres = r.GenreNames.map(g => g.toLowerCase());
    else if (typeof r.GenreNames === "string")
      genres = parseList(r.GenreNames).map(g => g.toLowerCase());

    let title = r.name || r.Name || r.Title || "(unknown title)";

    // extract color palette and compute average of all 3 swatches
    let colorRgb = [200, 200, 200];
    try {
      const pal = r['Color Palette'] ?? r['ColorPalette'] ?? r.color_palette ?? r.colorPalette;
      if (Array.isArray(pal) && pal.length >= 9) {
        // palette is 9 values: [r1,g1,b1, r2,g2,b2, r3,g3,b3]
        // average all 3 swatches
        if (typeof pal[0] === 'number') {
          const r_avg = Math.round((pal[0] + pal[3] + pal[6]) / 3);
          const g_avg = Math.round((pal[1] + pal[4] + pal[7]) / 3);
          const b_avg = Math.round((pal[2] + pal[5] + pal[8]) / 3);
          colorRgb = [r_avg, g_avg, b_avg];
        }
      } else if (Array.isArray(pal) && pal.length >= 3) {
        // fallback: if only 3 values, use as-is
        if (typeof pal[0] === 'number') colorRgb = [pal[0], pal[1], pal[2]];
        else if (Array.isArray(pal[0]) && pal[0].length >= 3) colorRgb = [pal[0][0], pal[0][1], pal[0][2]];
      } else if (typeof pal === 'string') {
        const nums = pal.replace(/[\[\]"]+/g, '').split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        if (nums.length >= 9) {
          const r_avg = Math.round((nums[0] + nums[3] + nums[6]) / 3);
          const g_avg = Math.round((nums[1] + nums[4] + nums[7]) / 3);
          const b_avg = Math.round((nums[2] + nums[5] + nums[8]) / 3);
          colorRgb = [r_avg, g_avg, b_avg];
        } else if (nums.length >= 3) {
          colorRgb = [nums[0], nums[1], nums[2]];
        }
      }
    } catch (e) {}

    points.push({
      x: map(pca1, minX, maxX, 100, width - 100),
      y: map(pca2, minY, maxY, height - 100, 100),
      cluster,
      genres,
      title,
      color: colorRgb
    });
}

    mode = 1;
    // ensure canvas is visible when new data arrives
    syncVisibility();
    console.log('[sketch] built points:', points.length, 'minX,maxX', minX, maxX, 'minY,maxY', minY, maxY);

  // map cluster centroids (if available) into canvas coords and colors
  centroids = [];
  if (payload.cluster_centers) {
    const cinfo = payload.cluster_centers;
    const cps = cinfo.pca || cinfo.centroid_pca || cinfo.pca_positions || [];
    const crgb = cinfo.rgb || cinfo.centroid_rgb || [];
    if (Array.isArray(cps) && cps.length > 0) {
      for (let i = 0; i < cps.length; i++) {
        const cp = cps[i];
        if (!Array.isArray(cp) || cp.length < 2) continue;
        const cx = map(cp[0], minX, maxX, 100, width - 100);
        const cy = map(cp[1], minY, maxY, height - 100, 100);
        let crow = [200, 200, 200];
        try {
          const crep = crgb[i];
          if (Array.isArray(crep) && crep.length >= 9) {
            // crep is [r1,g1,b1, r2,g2,b2, r3,g3,b3] - average all 3 swatches
            if (typeof crep[0] === 'number') {
              const r_avg = Math.round((crep[0] + crep[3] + crep[6]) / 3);
              const g_avg = Math.round((crep[1] + crep[4] + crep[7]) / 3);
              const b_avg = Math.round((crep[2] + crep[5] + crep[8]) / 3);
              crow = [r_avg, g_avg, b_avg];
            }
          } else if (Array.isArray(crep) && crep.length >= 3) {
            // fallback: if only 3 values
            if (typeof crep[0] === 'number') crow = [crep[0], crep[1], crep[2]];
            else if (Array.isArray(crep[0])) crow = [crep[0][0], crep[0][1], crep[0][2]];
          }
        } catch (e) {}
        centroids.push({ x: cx, y: cy, color: crow });
      }
    }
  }

if (payload.summary?.topGenres) {
    genreSelect.elt.innerHTML = ""; 
    genreSelect.option("All");
    payload.summary.topGenres.forEach(g => genreSelect.option(g));
  }
}

// very basic draw loop: just shows toggle and calls upon either summary or clusters
function draw() {
  background(245);

  if (mode === 1) {
    drawClusters();
  } else {
    // summary mode handled by script.js DOM
    background(245);
  }
}


// k means clustering viz:
function drawClusters() {
  background(0);

  // occasional debug log
  if (!drawClusters._lastLog || Date.now() - drawClusters._lastLog > 2000) {
    console.log(`[sketch] drawClusters - points=${points.length} centroids=${centroids.length} mode=${mode}`);
    drawClusters._lastLog = Date.now();
  }

  textAlign(CENTER);
  fill(255);
  textSize(18);
  text("K-Means Clustering Visualization", width / 2, 40);
  textSize(14);
  
  // plot points 
  if (points.length === 0) return;
  noStroke();

  for (let p of points) {
    let show =
      selectedGenre === "All" ||
      p.genres.some(g => g === selectedGenre.toLowerCase());
    if (!show) continue;

    // use actual palette color if available
    if (p.color && Array.isArray(p.color) && p.color.length >= 3) {
      fill(p.color[0], p.color[1], p.color[2]);
    } else {
      let c = color((p.cluster * 70) % 255, 150, 255 - (p.cluster * 50) % 255);
      fill(c);
    }

    ellipse(p.x, p.y, 8);
  }

// hover text titles 
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

  // draw centroids on top
  if (centroids && centroids.length > 0) {
    for (let c of centroids) {
      noStroke();
      fill(c.color[0], c.color[1], c.color[2]);
      rectMode(CENTER);
      rect(c.x, c.y, 14, 14, 3);
      // subtle outline
      stroke(255, 200);
      noFill();
      rect(c.x, c.y, 18, 18, 4);
      noStroke();
    }
  }
}

// all helper functions here
function parseList(str) {
  if (!str) return [];
  return str
    .replace(/[\[\]"']+/g, "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

function keyPressed() {
  if (key === " ") {
    mode = 0;
    syncVisibility();
  }
}

// resizes if the window itself changes
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}