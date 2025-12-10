// Configuration
const API_BASE_URL = "http://localhost:5001";

// DOM Elements
const usernameInput = document.getElementById("username-input");
const searchBtn = document.getElementById("search-btn");
const loadingDiv = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const resultsContainer = document.getElementById("results-container");

// Test connection on page load
document.addEventListener("DOMContentLoaded", () => {
  testConnection();
});

// Test connection function - checks if can connect to backend 
async function testConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      console.log("Backend is connected");
    }
  } catch (error) {
    console.error("Cannot connect to backend:", error);
    showError("Warning: Cannot connect to backend server. Make sure it's running on port 5000.");
  }
}

// Event Listeners
searchBtn.addEventListener("click", handleSearch);
usernameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

// toggle elements (in html) that move between summary view and viz view 
const viewSummaryBtn = document.getElementById('view-summary');
const viewVizBtn = document.getElementById('view-viz');
const canvasWrap = document.getElementById('canvas-wrap');

function setView(mode) {
  // mode: 0 = summary (DOM), 1 = viz (canvas)
  window.dispatchEvent(new CustomEvent('setMode', { detail: { mode } }));
  if (mode === 0) {
    resultsContainer.style.display = 'block';
    if (canvasWrap) canvasWrap.style.display = 'none';
  } else {
    resultsContainer.style.display = 'none';
    if (canvasWrap) canvasWrap.style.display = 'block';
  }
}

viewSummaryBtn?.addEventListener('click', () => setView(0));
viewVizBtn?.addEventListener('click', () => setView(1));

// Main search handler
async function handleSearch() {
  const username = usernameInput.value.trim();

  if (!username) {
    showError("Please enter a username");
    return;
  }

  // Reset UI
  clearMessages();
  showLoading(true);
  resultsContainer.innerHTML = "";

  try {
    // Fetch data from backend
    const response = await fetch(`${API_BASE_URL}/get_movies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    // Display results (DOM summary)
    displayResults(data, username);

    // Make data available to visuals in sketch.js
    try {
      // store on window for sketch to pick up
      window.DIARY_DATA = data;
      // dispatch an event so sketch.js can listen and update visuals immediately
      window.dispatchEvent(new CustomEvent('diaryData', { detail: data }));
      // call optional callback if defined by sketch
      if (typeof window.onDiaryData === 'function') {
        window.onDiaryData(data);
      }
    } catch (e) {
      console.warn('Could not dispatch diaryData event', e);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    showError(`Failed to fetch data: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// display summary stats on page
function displayResults(data, username) {
  const { diary, summary } = data;

  let html = `<div class="results">`;
  html += `<h2>Results for: ${username}</h2>`;

  // Display Stats 
  if (summary) {
    html += `<div class="summary">
      <h3>Summary Statistics</h3>
      <p><strong>Total Movies:</strong> ${summary["Total Movies"]}</p>
      <p><strong>Average Rating:</strong> ${summary["Average Rating"]?.toFixed(2) || "N/A"}</p>
      <p><strong>Unique Languages:</strong> ${summary["Unique Languages"]}</p>`;

    if (summary["Top 5 Genres"]) {
      html += `<p><strong>Top 5 Genres:</strong> ${summary["Top 5 Genres"].join(", ")}</p>`;
    }

    if (summary["Monthly Watch Counts"]) {
      html += `<p><strong>Monthly Watches:</strong> ${JSON.stringify(summary["Monthly Watch Counts"])}</p>`;
    }

    html += `</div>`;
  }
  html += `</div>`;
  resultsContainer.innerHTML = html;
}

// Utility Functions
function showLoading(show) {
  loadingDiv.style.display = show ? "block" : "none";
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

function clearMessages() {
  errorDiv.style.display = "none";
  errorDiv.textContent = "";
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
