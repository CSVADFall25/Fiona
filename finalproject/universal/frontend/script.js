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

// Test connection function
async function testConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      console.log("✓ Backend is connected");
    }
  } catch (error) {
    console.error("✗ Cannot connect to backend:", error);
    showError("Warning: Cannot connect to backend server. Make sure it's running on port 5000.");
  }
}

// Event Listeners
searchBtn.addEventListener("click", handleSearch);
usernameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

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

    // Display results
    displayResults(data, username);
  } catch (error) {
    console.error("Error fetching data:", error);
    showError(`Failed to fetch data: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// Display results on page
function displayResults(data, username) {
  const { diary, summary } = data;

  let html = `<div class="results">`;
  html += `<h2>Results for: ${username}</h2>`;

  // Display Summary Stats
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

  // Display Diary Entries as Table
  if (diary && diary.length > 0) {
    html += `<div class="diary-entries">
      <h3>Movie Diary (${diary.length} entries)</h3>
      <table class="diary-table">
        <thead>
          <tr>
            <th>Movie Title</th>
            <th>Rating</th>
            <th>Date</th>
            <th>Genre</th>
            <th>Language</th>
            <th>Runtime</th>
          </tr>
        </thead>
        <tbody>`;

    // Limit to first 50 entries for performance
    diary.slice(0, 50).forEach((entry) => {
      const title = entry.name || "Unknown";
      const rating = entry["actions.rating"] || "N/A";
      const date = entry["date.month"] ? `${entry["date.month"]}/2024` : "N/A";
      const genres = Array.isArray(entry.GenreNames)
        ? entry.GenreNames.join(", ")
        : "N/A";
      const language = entry.LanguageName || "N/A";
      const runtime = entry.Runtime ? `${entry.Runtime} min` : "N/A";

      html += `<tr>
        <td>${escapeHtml(title)}</td>
        <td>${rating}</td>
        <td>${date}</td>
        <td>${genres}</td>
        <td>${language}</td>
        <td>${runtime}</td>
      </tr>`;
    });

    if (diary.length > 50) {
      html += `<tr><td colspan="6" style="text-align: center; font-style: italic;">Showing 50 of ${diary.length} entries</td></tr>`;
    }

    html += `</tbody>
      </table>
    </div>`;
  } else {
    html += `<p>No diary entries found.</p>`;
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
