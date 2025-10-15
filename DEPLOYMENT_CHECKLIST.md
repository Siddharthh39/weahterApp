# AWS Deployment Checklist

Use this checklist to ensure smooth deployment of your Weather App on AWS.

## Pre-Deployment

- [ ] AWS account created and verified
- [ ] Basic understanding of EC2 and SSH
- [ ] SSH key pair downloaded (.pem file)
- [ ] (Optional) Domain name purchased

---

## EC2 Instance Setup

- [ ] Launched EC2 instance (Ubuntu 22.04 LTS)
- [ ] Instance type: t2.micro (free tier)
- [ ] Security group configured:
  - [ ] Port 22 (SSH) - Your IP only
  - [ ] Port 80 (HTTP) - Anywhere (0.0.0.0/0)
  - [ ] Port 443 (HTTPS) - Anywhere (0.0.0.0/0)
- [ ] Key pair selected/created
- [ ] Instance is running
- [ ] Can SSH into instance successfully

---

## Software Installation

- [ ] System updated: `sudo apt update && sudo apt upgrade -y`
- [ ] Apache installed: `sudo apt install apache2 -y`
- [ ] Python installed: `sudo apt install python3 python3-pip python3-venv -y`
- [ ] Git installed: `sudo apt install git -y`
- [ ] Apache is running: `sudo systemctl status apache2`
- [ ] Apache enabled on boot: `sudo systemctl enable apache2`

---

## Backend Deployment

- [ ] Repository cloned: `git clone https://github.com/Siddharthh39/weahterApp.git`
- [ ] Changed to project directory: `cd weahterApp`
- [ ] Virtual environment created: `python3 -m venv venv`
- [ ] Virtual environment activated: `source venv/bin/activate`
- [ ] Dependencies installed: `pip install -r backend/requirements.txt`
- [ ] Backend tested manually: `uvicorn app:app --host 0.0.0.0 --port 8000`
- [ ] Backend responds to test request: `curl http://localhost:8000/weather?lat=28&lon=77`
- [ ] Systemd service file copied: `sudo cp backend/weather-api.service /etc/systemd/system/`
- [ ] Service file updated with correct user and paths
- [ ] Systemd reloaded: `sudo systemctl daemon-reload`
- [ ] Service started: `sudo systemctl start weather-api`
- [ ] Service enabled: `sudo systemctl enable weather-api`
- [ ] Service is running: `sudo systemctl status weather-api`

---

## Frontend Deployment

- [ ] Apache default page removed: `sudo rm -rf /var/www/html/*`
- [ ] Frontend files copied: `sudo cp -r frontend/* /var/www/html/`
- [ ] Permissions set: `sudo chown -R www-data:www-data /var/www/html/`
- [ ] Permissions verified: `sudo chmod -R 755 /var/www/html/`
- [ ] Can access frontend in browser: `http://YOUR-EC2-IP`

---

## Apache Reverse Proxy Configuration

- [ ] Proxy modules enabled:
  - [ ] `sudo a2enmod proxy`
  - [ ] `sudo a2enmod proxy_http`
  - [ ] `sudo a2enmod headers`
- [ ] Apache config file edited: `/etc/apache2/sites-available/000-default.conf`
- [ ] Proxy configuration added to VirtualHost
- [ ] Apache restarted: `sudo systemctl restart apache2`
- [ ] Proxy working: Test `http://YOUR-EC2-IP/api/weather?lat=28&lon=77`
- [ ] Frontend config.js uses `/api` for production

---

## Testing

- [ ] Backend API responds: `curl http://localhost:8000/weather?lat=28&lon=77`
- [ ] Proxy works: `curl http://localhost/api/weather?lat=28&lon=77`
- [ ] Frontend loads in browser
- [ ] Map is visible
- [ ] Clicking on map shows weather popup
- [ ] Weather data displays correctly
- [ ] Location names appear (reverse geocoding working)
- [ ] Weather icons display properly
- [ ] No console errors in browser

---

## Domain Setup (Optional)

- [ ] Domain purchased
- [ ] A record created pointing to EC2 IP
- [ ] DNS propagation complete (test with `nslookup your-domain.com`)
- [ ] ServerName added to Apache config
- [ ] Apache restarted
- [ ] Site accessible via domain

---

## SSL/HTTPS Setup (Optional but Recommended)

- [ ] Certbot installed: `sudo apt install certbot python3-certbot-apache -y`
- [ ] SSL certificate obtained: `sudo certbot --apache -d your-domain.com`
- [ ] Certificate auto-renewal configured
- [ ] Test renewal: `sudo certbot renew --dry-run`
- [ ] HTTPS works: `https://your-domain.com`
- [ ] HTTP redirects to HTTPS

---

## Security Hardening

- [ ] Port 8000 removed from security group (backend only accessible via proxy)
- [ ] SSH restricted to your IP only
- [ ] Firewall configured: `sudo ufw enable`
- [ ] Firewall rules added:
  - [ ] `sudo ufw allow 22/tcp`
  - [ ] `sudo ufw allow 80/tcp`
  - [ ] `sudo ufw allow 443/tcp`
- [ ] Password authentication disabled in SSH
- [ ] Root login disabled in SSH
- [ ] Fail2ban installed (optional): `sudo apt install fail2ban -y`

---

## Monitoring & Logs

- [ ] Know how to check backend logs: `sudo journalctl -u weather-api -f`
- [ ] Know how to check Apache logs: `sudo tail -f /var/log/apache2/error.log`
- [ ] Backend service auto-restarts on failure
- [ ] Set up log rotation (optional)
- [ ] CloudWatch monitoring enabled (optional)

---

## Backup & Maintenance

- [ ] Application code backed up (GitHub)
- [ ] Deployment script saved
- [ ] Documentation accessible
- [ ] Know how to update application: `git pull && sudo cp -r frontend/* /var/www/html/`
- [ ] Know how to restart services
- [ ] System update schedule planned

---

## Final Verification

- [ ] Application accessible from different devices
- [ ] Application works on mobile browsers
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] Weather data loads quickly
- [ ] Location names display correctly
- [ ] All weather conditions working (clear, rain, snow, etc.)
- [ ] Performance is acceptable

---

## Documentation

- [ ] README.md updated with deployment info
- [ ] AWS_DEPLOYMENT_GUIDE.md reviewed
- [ ] QUICK_START_AWS.md bookmarked
- [ ] Apache config saved
- [ ] Systemd service file saved
- [ ] Security group settings documented
- [ ] Domain/DNS settings documented (if applicable)

---

## Post-Deployment

- [ ] Application URL shared
- [ ] Team/users notified (if applicable)
- [ ] Monitoring dashboard set up (if applicable)
- [ ] Cost alerts configured
- [ ] Billing alarms set
- [ ] Regular maintenance scheduled

---

## Troubleshooting Knowledge

- [ ] Know how to check service status
- [ ] Know how to view logs
- [ ] Know how to restart services
- [ ] Know how to test API endpoints
- [ ] Know how to check Apache configuration
- [ ] Know how to verify proxy settings
- [ ] Have AWS_DEPLOYMENT_GUIDE.md handy for reference

---

## Success Criteria

✅ **Your deployment is successful when:**

1. You can access the app via `http://YOUR-IP` or `https://your-domain.com`
2. Clicking on the map displays weather information
3. Backend API is running as a systemd service
4. Apache serves the frontend and proxies API requests
5. No errors in logs
6. Application survives server reboot

---

**Congratulations! Your Weather App is now live on AWS! 🎉**

Remember to:
- Monitor logs regularly
- Keep system updated
- Renew SSL certificates (Certbot does this automatically)
- Back up any important data
- Check AWS billing dashboard

For issues, refer to the Troubleshooting section in **AWS_DEPLOYMENT_GUIDE.md**
