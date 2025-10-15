# Setup Instructions for Local Testing

## Problem Identified ❌

The OpenWeather API key in the code (`6bdaae7500dd9fc7e01a543bf6d47056`) is **INVALID**. 

When you clicked on the map, the API returned:
```
{"cod":401, "message": "Invalid API key. Please see https://openweathermap.org/faq#error401"}
```

## Solution ✅

### Step 1: Get a Valid API Key

1. **Visit**: https://openweathermap.org/api
2. **Click**: "Sign Up" (top right) or "Get API Key"
3. **Create Account**: Fill in your details and verify your email
4. **Get Your Key**: 
   - Log in to your account
   - Go to "API keys" section
   - Copy your default API key (or generate a new one)
5. **Wait**: New API keys take **10-15 minutes** to activate

### Step 2: Update the .env File

1. Open: `/run/media/siddharth/My Stuff/contri/Weather-App/backend/.env`
2. Replace the current key with your new key:
   ```
   OPENWEATHER_API_KEY=your_new_key_here
   ```
3. Save the file

### Step 3: Restart the Backend

The backend should auto-reload when you save the .env file. If not:
1. Stop the server (Ctrl+C in the terminal)
2. Restart it with:
   ```bash
   cd "/run/media/siddharth/My Stuff/contri/Weather-App/backend"
   "/run/media/siddharth/My Stuff/contri/Weather-App/myenv/bin/python" -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

### Step 4: Test the App

1. Refresh the frontend in your browser
2. Click anywhere on the map
3. You should now see weather data! 🌤️

## What Was Fixed

✅ Fixed the `os.getenv()` bug in `app.py` (was hardcoding the key instead of reading from env)
✅ Created proper `.env` file for local development
✅ Updated `script.js` to use `localhost:8000` instead of production URL
✅ Added comprehensive error handling for API failures
✅ Frontend now displays clear error messages when API key is invalid

## Current Status

- ✅ Backend server is running on `http://localhost:8000`
- ✅ Frontend is configured to connect to local backend
- ❌ **Waiting for valid OpenWeather API key**

Once you add a valid API key and wait for it to activate, everything will work! 🎉
