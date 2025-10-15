# Apache (httpd) vs FastAPI - What's Different?

Since you're familiar with serving HTML files with Apache/httpd, here's what's different with this app:

---

## Traditional Apache Setup (What You Know)

```
┌─────────────────────┐
│   Apache (httpd)    │
│     Port 80         │
├─────────────────────┤
│   index.html        │
│   style.css         │
│   script.js         │
│   images/           │
└─────────────────────┘
```

**Workflow:**
1. Put files in `/var/www/html/`
2. Apache serves them directly
3. Done!

---

## Weather App Setup (What's New)

```
┌─────────────────────────────────────┐
│         Apache (httpd)              │
│           Port 80                   │
├─────────────────────────────────────┤
│  Static Files:                      │
│  • index.html                       │
│  • style.css                        │
│  • script.js                        │
│  • icons/                           │
│                                     │
│  Reverse Proxy:                     │
│  /api/* → localhost:8000            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      FastAPI Backend                │
│      localhost:8000                 │
│      (Python Application)           │
├─────────────────────────────────────┤
│  • Fetches weather data             │
│  • Processes coordinates            │
│  • Returns JSON                     │
└─────────────────────────────────────┘
```

**Workflow:**
1. Put frontend files in `/var/www/html/` (same as before!)
2. Run Python backend as a service (new!)
3. Configure Apache to proxy API requests (new!)
4. Done!

---

## Why Do We Need a Backend?

### Static Files Only (Your Usual Setup)
```javascript
// This is what you're used to
<script>
  // All code runs in browser
  // Can't make API calls that require keys
  // Limited functionality
</script>
```

### With Backend (Weather App)
```javascript
// Frontend (runs in browser)
fetch('/api/weather?lat=28&lon=77')
  .then(response => response.json())
  .then(data => {
    // Display weather data
  });

// Backend (runs on server)
def get_weather(lat, lon):
    # Fetch from Open-Meteo
    # Process data
    # Return to frontend
    return weather_data
```

**Benefits:**
- Backend can call external APIs
- Backend can process data
- Backend protects sensitive information
- Frontend stays simple

---

## File Locations Comparison

### Traditional Apache
```
/var/www/html/
├── index.html
├── style.css
└── script.js
```

### Weather App
```
/var/www/html/              ← Frontend (Apache serves these)
├── index.html
├── config.js
├── script.js
├── styles.css
└── icons/

/home/ubuntu/Weather-App/   ← Backend (systemd runs this)
└── backend/
    └── app.py
```

---

## Commands Comparison

### Traditional Apache (What You Know)

```bash
# Start Apache
sudo systemctl start apache2

# Update website
sudo cp index.html /var/www/html/

# View logs
sudo tail -f /var/log/apache2/error.log
```

### Weather App (What's New)

```bash
# Start Apache (same!)
sudo systemctl start apache2

# Start Backend (new!)
sudo systemctl start weather-api

# Update frontend (same!)
sudo cp -r frontend/* /var/www/html/

# Update backend (new!)
cd ~/Weather-App
git pull
sudo systemctl restart weather-api

# View logs
sudo tail -f /var/log/apache2/error.log  # Apache logs (same)
sudo journalctl -u weather-api -f        # Backend logs (new!)
```

---

## Configuration Comparison

### Traditional Apache

**File:** `/etc/apache2/sites-available/000-default.conf`
```apache
<VirtualHost *:80>
    DocumentRoot /var/www/html
</VirtualHost>
```

That's it! Apache just serves files.

### Weather App

**File:** `/etc/apache2/sites-available/000-default.conf`
```apache
<VirtualHost *:80>
    DocumentRoot /var/www/html
    
    # NEW: Proxy API requests to backend
    ProxyPass /api http://localhost:8000
    ProxyPassReverse /api http://localhost:8000
</VirtualHost>
```

**Additional File:** `/etc/systemd/system/weather-api.service`
```ini
[Service]
ExecStart=/home/ubuntu/Weather-App/venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000
```

This tells the system to run your Python backend.

---

## Request Flow Comparison

### Traditional Apache

```
User Browser
    │
    ▼
http://your-site.com/index.html
    │
    ▼
Apache finds /var/www/html/index.html
    │
    ▼
Sends file to browser
    │
    ▼
Done!
```

### Weather App

```
User clicks map
    │
    ▼
JavaScript: fetch('/api/weather?lat=28&lon=77')
    │
    ▼
Request goes to Apache (port 80)
    │
    ▼
Apache sees /api/* path
    │
    ▼
Apache proxies to localhost:8000 (FastAPI)
    │
    ▼
FastAPI fetches weather from Open-Meteo
    │
    ▼
FastAPI returns JSON to Apache
    │
    ▼
Apache returns JSON to browser
    │
    ▼
JavaScript displays weather on map
    │
    ▼
Done!
```

---

## What's the Same?

✅ **Apache serves static files** - Just like before!
✅ **Files go in `/var/www/html/`** - Same location!
✅ **Apache starts on boot** - Same behavior!
✅ **Check logs the same way** - Familiar commands!
✅ **Update HTML/CSS/JS** - Same process!

## What's Different?

🆕 **Backend service running** - Python app runs separately
🆕 **Apache proxies API requests** - New configuration
🆕 **Two services to manage** - Apache + Backend
🆕 **Two sets of logs** - Apache + Backend
🆕 **systemd service** - Backend runs as a service

---

## Mental Model

Think of it like this:

**Traditional Apache:**
- Apache is a **waiter**
- Serves pre-made food (HTML files)

**Weather App:**
- Apache is still a **waiter** (serves HTML files)
- **PLUS** Apache is a **receptionist** (forwards API requests)
- FastAPI backend is the **kitchen** (cooks up weather data)

---

## Quick Command Reference

```bash
# What you already know (Apache)
sudo systemctl start apache2
sudo systemctl restart apache2
sudo systemctl status apache2
sudo tail -f /var/log/apache2/error.log

# What's new (Backend)
sudo systemctl start weather-api
sudo systemctl restart weather-api
sudo systemctl status weather-api
sudo journalctl -u weather-api -f

# Both together
sudo systemctl restart apache2 weather-api
```

---

## Troubleshooting

### "My HTML changes aren't showing!"

**Solution:** Clear browser cache or hard refresh (Ctrl+F5)

This is the same as before!

### "The map shows but no weather data!"

**Check these NEW things:**

1. Is backend running?
   ```bash
   sudo systemctl status weather-api
   ```

2. Are there backend errors?
   ```bash
   sudo journalctl -u weather-api -n 50
   ```

3. Can Apache reach the backend?
   ```bash
   curl http://localhost:8000/weather?lat=28&lon=77
   ```

4. Is proxy configured?
   ```bash
   apache2ctl -M | grep proxy
   ```

---

## Summary

You're **90% familiar** with this setup already!

- ✅ Apache works the same
- ✅ HTML/CSS/JS work the same
- ✅ File locations are the same
- 🆕 Added: Python backend service
- 🆕 Added: Apache proxy configuration

**Think of the backend as a helper that does the heavy lifting, while Apache still does what it always did - serve your files!**

---

Ready to deploy? Start with **QUICK_START_AWS.md**! 🚀
