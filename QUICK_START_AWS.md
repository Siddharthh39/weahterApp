# Quick Start - AWS Deployment

## One-Command Deployment (After EC2 Setup)

Once you have your EC2 instance running and have SSH'd into it:

```bash
# Clone the repository
git clone https://github.com/pkala7968/Weather-App.git
cd Weather-App

# Run the deployment script
./deploy.sh
```

That's it! The script will:
- ✅ Install all dependencies (Apache, Python, etc.)
- ✅ Set up Python virtual environment
- ✅ Configure systemd service for backend
- ✅ Deploy frontend to Apache
- ✅ Start all services

## Manual Steps (If Needed)

If you prefer manual deployment or the script fails, follow the detailed guide in **[AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)**

## After Deployment

### Configure Apache Reverse Proxy

Edit Apache config:
```bash
sudo nano /etc/apache2/sites-available/000-default.conf
```

Add inside `<VirtualHost *:80>`:
```apache
ProxyPreserveHost On
ProxyPass /api http://localhost:8000
ProxyPassReverse /api http://localhost:8000
```

Restart Apache:
```bash
sudo systemctl restart apache2
```

### Update Frontend Config

Edit config file:
```bash
sudo nano /var/www/html/config.js
```

The production config is already set to use `/api` which works with Apache proxy!

## Verify Deployment

1. **Check Backend:**
   ```bash
   curl http://localhost:8000/weather?lat=28.4760959&lon=77.4816687
   ```

2. **Check Frontend:**
   - Open browser: `http://YOUR-EC2-PUBLIC-IP`
   - Click on the map
   - Weather data should appear!

## Troubleshooting

**Backend not working?**
```bash
sudo systemctl status weather-api
sudo journalctl -u weather-api -f
```

**Frontend not working?**
```bash
sudo systemctl status apache2
sudo tail -f /var/log/apache2/error.log
```

## Useful Commands

```bash
# Restart backend
sudo systemctl restart weather-api

# Restart Apache
sudo systemctl restart apache2

# Update code
cd ~/Weather-App
git pull
sudo cp -r frontend/* /var/www/html/
sudo systemctl restart weather-api

# View logs
sudo journalctl -u weather-api -f
sudo tail -f /var/log/apache2/access.log
```

## Cost

- **EC2 t2.micro:** FREE for 12 months (750 hours/month)
- **After free tier:** ~$8-10/month

## Need Help?

See the complete guide: **[AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)**
