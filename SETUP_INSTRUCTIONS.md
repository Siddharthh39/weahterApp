# Setup Instructions for Local Development

This guide will help you run the Weather App locally on your machine for development and testing.

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- A modern web browser

---

## Quick Start

### Step 1: Clone the Repository

```bash
git clone https://github.com/Siddharthh39/weahterApp.git
cd weahterApp
```

### Step 2: Set Up the Backend

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Start the Backend Server

```bash
# Make sure you're in the backend directory with venv activated
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

You should see output like:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

### Step 4: Open the Frontend

1. Open a new terminal/command prompt
2. Navigate to the frontend directory: `cd frontend`
3. Open `index.html` in your web browser, or use a simple HTTP server:
   ```bash
   # Using Python's built-in server
   python3 -m http.server 3000
   # Then open http://localhost:3000 in your browser
   ```

### Step 5: Test the Application

1. You should see an interactive map
2. Click anywhere on the map
3. A popup will appear showing:
   - Location name
   - Current temperature
   - Weather condition
   - Humidity
   - Wind speed and direction
   - Feels like temperature

---

## Features

✅ **No API Key Required** - Uses [Open-Meteo](https://open-meteo.com/) for weather data (free, unlimited)
✅ **No Registration** - No sign-ups or accounts needed
✅ **Free Geocoding** - Uses [OpenStreetMap Nominatim](https://nominatim.org/) for location names
✅ **Auto-configuration** - Frontend automatically detects local vs. production environment

---

## Troubleshooting

### Backend won't start

**Error: `ModuleNotFoundError`**
```bash
# Make sure virtual environment is activated and dependencies installed
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**Error: `Address already in use`**
```bash
# Port 8000 is already in use. Either kill the process or use a different port:
uvicorn app:app --reload --host 0.0.0.0 --port 8001
# Then update frontend/config.js to use port 8001
```

### Frontend shows "Failed to fetch weather data"

1. **Check if backend is running**: Open http://localhost:8000 in your browser
   - You should see: `{"message": "Weather API is running with Open-Meteo"}`
   
2. **Check browser console**: Press F12 and look for errors
   - CORS errors mean the backend isn't properly configured (should not happen with current setup)
   - Network errors mean backend isn't running or wrong port

3. **Verify API endpoint**: The frontend should automatically use `http://localhost:8000` when running locally

### Map doesn't load

- Check your internet connection (Leaflet.js loads map tiles from the internet)
- Check browser console for JavaScript errors

---

## Development Tips

### Testing the API Directly

You can test the backend API directly using curl or your browser:

```bash
# Get weather for a location (e.g., Delhi)
curl "http://localhost:8000/weather?lat=28.7041&lon=77.1025"

# Check if API is running
curl "http://localhost:8000/"
```

### Making Code Changes

- **Backend changes**: The server auto-reloads with `--reload` flag
- **Frontend changes**: Just refresh your browser

### Understanding the Code

- **backend/app.py**: FastAPI backend that fetches weather from Open-Meteo
- **frontend/script.js**: Handles map interactions and API calls
- **frontend/config.js**: Environment-specific configuration (auto-detects local vs. production)

---

## What's Different from Production?

| Feature | Local Development | Production (AWS) |
|---------|------------------|------------------|
| Backend URL | `http://localhost:8000` | `/api` (via Apache proxy) |
| Frontend serving | File system or Python http.server | Apache web server |
| Backend process | Terminal (manual start) | systemd service (auto-start) |
| Configuration | Auto-detected by config.js | Apache reverse proxy |

---

## Next Steps

- **Ready to deploy?** See [QUICK_START_AWS.md](./QUICK_START_AWS.md)
- **Need detailed deployment guide?** See [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)
- **Want to check before deploying?** See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

## Support

If you encounter issues:
1. Check this troubleshooting section
2. Verify all prerequisites are installed
3. Make sure virtual environment is activated
4. Check that ports 8000 and 3000 are not in use
5. Look for errors in the terminal/console

---

**Happy Coding! 🚀**
