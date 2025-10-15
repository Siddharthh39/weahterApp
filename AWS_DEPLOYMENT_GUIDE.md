# AWS Deployment Guide for Weather App

This guide will help you deploy your Weather App on AWS EC2 using Apache (httpd) for the frontend and FastAPI for the backend.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              AWS EC2 Instance (Single Server)        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐      ┌───────────────────┐   │
│  │   Apache (httpd) │      │   FastAPI Backend │   │
│  │   Port 80/443    │─────▶│   Port 8000       │   │
│  │   Frontend       │      │   (systemd)       │   │
│  └──────────────────┘      └───────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
           │                              │
           ▼                              ▼
    Static HTML/CSS/JS            Open-Meteo API
    (Leaflet Map)                 (Free Weather Data)
```

## Prerequisites

- AWS Account
- Basic knowledge of SSH and Linux commands
- Domain name (optional, but recommended)

---

## Step 1: Launch EC2 Instance

### 1.1 Create EC2 Instance

1. **Log in to AWS Console** → Go to EC2 Dashboard
2. **Click "Launch Instance"**
3. **Configure:**
   - **Name:** `weather-app-server`
   - **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type:** `t2.micro` (Free tier eligible)
   - **Key Pair:** Create new or select existing (download `.pem` file)
   - **Network Settings:**
     - Allow SSH (port 22) from your IP
     - Allow HTTP (port 80) from anywhere (0.0.0.0/0)
     - Allow HTTPS (port 443) from anywhere (0.0.0.0/0)
     - Allow Custom TCP (port 8000) from localhost only (for backend API)
4. **Storage:** 8 GB (default is fine)
5. **Launch Instance**

### 1.2 Connect to Instance

```bash
# Change permissions on your key file
chmod 400 your-key.pem

# Connect to EC2
ssh -i your-key.pem ubuntu@<your-ec2-public-ip>
```

---

## Step 2: Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Apache (httpd equivalent)
sudo apt install apache2 -y

# Install Python and pip
sudo apt install python3 python3-pip python3-venv -y

# Install git (to clone your repo)
sudo apt install git -y

# Enable Apache to start on boot
sudo systemctl enable apache2
sudo systemctl start apache2
```

Verify Apache is running:
```bash
# Check Apache status
sudo systemctl status apache2

# Visit http://<your-ec2-public-ip> in browser - you should see Apache default page
```

---

## Step 3: Deploy Backend (FastAPI)

### 3.1 Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/Siddharthh39/weahterApp.git
cd weahterApp
```

### 3.2 Set Up Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt
```

### 3.3 Test Backend Manually

```bash
# Test the backend
uvicorn app:app --host 0.0.0.0 --port 8000

# In another terminal (or from your local machine):
curl http://<your-ec2-public-ip>:8000/weather?lat=28.4760959&lon=77.4816687
# Should return weather data

# Press Ctrl+C to stop
```

### 3.4 Create Systemd Service for Backend

```bash
# Copy the service file
sudo cp /home/ubuntu/Weather-App/backend/weather-api.service /etc/systemd/system/

# If your username is not 'ubuntu', edit the service file:
sudo nano /etc/systemd/system/weather-api.service
# Change 'User=ubuntu' to your username
# Change paths to match your setup

# Reload systemd
sudo systemctl daemon-reload

# Start the service
sudo systemctl start weather-api

# Enable service to start on boot
sudo systemctl enable weather-api

# Check status
sudo systemctl status weather-api
```

**Verify backend is running:**
```bash
curl http://localhost:8000/weather?lat=28.4760959&lon=77.4816687
```

---

## Step 4: Deploy Frontend (Apache)

### 4.1 Update Frontend Configuration

First, update the frontend to use your EC2 IP address:

```bash
cd /home/ubuntu/Weather-App/frontend
nano script.js
```

Find this line:
```javascript
fetch(`http://localhost:8000/weather?lat=${lat}&lon=${lon}`)
```

Change to:
```javascript
fetch(`http://<your-ec2-public-ip>:8000/weather?lat=${lat}&lon=${lon}`)
```

Or better yet, use relative path with Apache proxy (see Step 5).

### 4.2 Copy Frontend Files to Apache

```bash
# Remove Apache default page
sudo rm -rf /var/www/html/*

# Copy frontend files
sudo cp -r /home/ubuntu/Weather-App/frontend/* /var/www/html/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

### 4.3 Test Frontend

Open browser and visit: `http://<your-ec2-public-ip>`

You should see the weather map!

---

## Step 5: Configure Apache as Reverse Proxy (Recommended)

Instead of exposing port 8000, use Apache to proxy requests to the backend.

### 5.1 Enable Apache Modules

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo systemctl restart apache2
```

### 5.2 Configure Apache Virtual Host

```bash
sudo nano /etc/apache2/sites-available/000-default.conf
```

Add this inside the `<VirtualHost *:80>` block:

```apache
<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html

    # Proxy API requests to FastAPI backend
    ProxyPreserveHost On
    ProxyPass /api http://localhost:8000
    ProxyPassReverse /api http://localhost:8000

    # Add CORS headers
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type"

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

Restart Apache:
```bash
sudo systemctl restart apache2
```

### 5.3 Update Frontend to Use Proxy

Edit frontend script:
```bash
nano /var/www/html/script.js
```

Change fetch URL from:
```javascript
fetch(`http://<your-ec2-public-ip>:8000/weather?lat=${lat}&lon=${lon}`)
```

To:
```javascript
fetch(`/api/weather?lat=${lat}&lon=${lon}`)
```

### 5.4 Update Security Group

Now you can **remove port 8000** from EC2 security group (only allow port 80 and 443).

---

## Step 6: Set Up Domain (Optional)

### 6.1 Point Domain to EC2

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Create an **A Record** pointing to your EC2 public IP
   - Example: `weather.yourdomain.com` → `<your-ec2-public-ip>`

### 6.2 Update Apache Configuration

```bash
sudo nano /etc/apache2/sites-available/000-default.conf
```

Add:
```apache
ServerName weather.yourdomain.com
```

Restart Apache:
```bash
sudo systemctl restart apache2
```

---

## Step 7: Enable HTTPS with Let's Encrypt (Optional but Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache -y

# Get SSL certificate
sudo certbot --apache -d weather.yourdomain.com

# Follow the prompts
# Certbot will automatically configure Apache for HTTPS

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Maintenance Commands

### Check Backend Status
```bash
sudo systemctl status weather-api
```

### View Backend Logs
```bash
sudo journalctl -u weather-api -f
```

### Restart Backend
```bash
sudo systemctl restart weather-api
```

### Check Apache Status
```bash
sudo systemctl status apache2
```

### View Apache Logs
```bash
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log
```

### Update Application
```bash
cd /home/ubuntu/Weather-App
git pull
sudo cp -r frontend/* /var/www/html/
sudo systemctl restart weather-api
```

---

## Troubleshooting

### Backend not starting
```bash
# Check logs
sudo journalctl -u weather-api -n 50

# Check if port 8000 is in use
sudo lsof -i :8000

# Test manually
cd /home/ubuntu/Weather-App/backend
source /home/ubuntu/Weather-App/venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000
```

### Frontend not loading
```bash
# Check Apache logs
sudo tail -f /var/log/apache2/error.log

# Verify files are in place
ls -la /var/www/html/

# Check permissions
sudo chown -R www-data:www-data /var/www/html/
```

### API calls failing
```bash
# Test backend directly
curl http://localhost:8000/weather?lat=28.4760959&lon=77.4816687

# Check Apache proxy
sudo apache2ctl -M | grep proxy

# Test from EC2
curl http://localhost/api/weather?lat=28.4760959&lon=77.4816687
```

---

## Cost Estimation

- **EC2 t2.micro:** Free tier (750 hours/month for 12 months)
- **Data Transfer:** First 100 GB/month free
- **After Free Tier:** ~$8-10/month for t2.micro

---

## Security Best Practices

1. ✅ **Keep software updated:** `sudo apt update && sudo apt upgrade -y`
2. ✅ **Use SSH keys** (disable password authentication)
3. ✅ **Configure firewall:** `sudo ufw enable`
4. ✅ **Use HTTPS** with Let's Encrypt
5. ✅ **Limit SSH access** to your IP only
6. ✅ **Regular backups** of your data
7. ✅ **Monitor logs** regularly

---

## Quick Deployment Checklist

- [ ] Launch EC2 instance with proper security groups
- [ ] SSH into instance
- [ ] Install Apache, Python, Git
- [ ] Clone repository
- [ ] Set up Python virtual environment
- [ ] Install backend dependencies
- [ ] Create and start systemd service for backend
- [ ] Copy frontend files to `/var/www/html/`
- [ ] Configure Apache reverse proxy
- [ ] Update frontend API URL
- [ ] Test the application
- [ ] (Optional) Set up domain and HTTPS

---

## Support

If you encounter issues:
1. Check logs (systemd and Apache)
2. Verify all services are running
3. Test backend and frontend separately
4. Check security group rules

Good luck with your deployment! 🚀
