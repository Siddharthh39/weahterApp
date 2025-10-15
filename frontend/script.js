// Initialize map
var map = L.map('map', {
  minZoom: 2,
  worldCopyJump: true, // recenters if you drag across 180° meridian
  maxBounds: [
    [-90, -Infinity], // Southwest corner
    [90, Infinity]    // Northeast corner
  ],
  maxBoundsViscosity: 1.0 // stickiness 
}).setView([20, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

// Handle click
map.on('click', function(e) {
  var lat = e.latlng.lat;
  var lon = e.latlng.lng;

  // Use API_CONFIG from config.js
  const apiUrl = window.API_CONFIG ? window.API_CONFIG.apiBaseUrl : 'http://localhost:8000';
  fetch(`${apiUrl}/weather?lat=${lat}&lon=${lon}`)
    .then(response => response.json())
    .then(data => {
      // Check for errors
      if (data.error) {
        L.popup()
          .setLatLng(e.latlng)
          .setContent(`
            <b style="color: red;">Error</b><br>
            ${data.error}<br>
            <small>${data.message || ''}</small>
          `)
          .openOn(map);
        alert(`Error: ${data.error}\n\n${data.message || ''}`);
        return;
      }

      // Show popup on map
      L.popup()
        .setLatLng(e.latlng)
        .setContent(`
          <b>${
            data.location && data.location.trim() !== "" 
              ? data.location 
              : `${data.lat}, ${data.lon}`
          }</b><br>
          Temp: ${data.temperature} °C<br>
          Condition: ${data.weather}
        `)
        .openOn(map);

      // === Update weather info panel ===
      const infoBox = document.getElementById("weather-info");
      const details = document.getElementById("weather-details");
      const icon = document.getElementById("weather-icon");

      function formatCoord(lat, lon) {
        let latDir = lat >= 0 ? "N" : "S";
        let lonDir = lon >= 0 ? "E" : "W";
        return `${Math.abs(lat)}°${latDir}, ${Math.abs(lon)}°${lonDir}`;
      }

      let coords = formatCoord(data.lat, data.lon);

      details.innerHTML = `
        <b>${data.location} (${coords})</b><br>
        🌡️Temp: ${data.temperature}°C <i>(feels like ${data.feels_like}°C)</i><br>
        💧Humidity: ${data.humidity}%<br>
        ☁️Condition: ${data.weather}<br>
        💨Wind: ${data.wind_speed} m/s (${data.wind_direction}°)<br>
      `;

      // Pick icon depending on condition
      let condition = data.weather.toLowerCase();
      if (condition.includes("overcast")) {
        icon.src = "icons/overcast.png";
      } else if (condition.includes("cloud")) {
        icon.src = "icons/cloudy.png";
      } else if (condition.includes("rain")) {
        icon.src = "icons/rainy.png";
      } else if (condition.includes("clear") || condition.includes("sun")) {
        icon.src = "icons/clear.png";
      } else if (condition.includes("snow")) {
        icon.src = "icons/snowy.png";
      } else if (condition.includes("drizzle")) {
        icon.src = "icons/drizzle.png";
      } else if (condition.includes("thunder")) {
        icon.src = "icons/thunder.png";
      } else {
        icon.src = "icons/default.png"; 
      }

      infoBox.classList.remove("hidden");
      document.getElementById("close-btn").addEventListener("click", function() {
      document.getElementById("weather-info").classList.add("hidden");
    });
    });
});