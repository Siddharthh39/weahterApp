#!/bin/bash
# Quick deployment script for AWS EC2
# Run this on your EC2 instance after cloning the repo

set -e  # Exit on error

echo "=================================="
echo "Weather App - AWS Deployment Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run as root. Run as ubuntu user.${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Updating system packages...${NC}"
sudo apt update

echo -e "${BLUE}Step 2: Installing Apache, Python, and dependencies...${NC}"
sudo apt install -y apache2 python3 python3-pip python3-venv git

echo -e "${BLUE}Step 3: Setting up Python virtual environment...${NC}"
cd /home/ubuntu/Weather-App
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

echo -e "${BLUE}Step 4: Testing backend...${NC}"
cd backend
python3 -c "import fastapi, uvicorn, requests; print('All Python packages installed successfully!')"
cd ..

echo -e "${BLUE}Step 5: Setting up systemd service for backend...${NC}"
sudo cp backend/weather-api.service /etc/systemd/system/
# Update service file with current user
sudo sed -i "s|User=ubuntu|User=$USER|g" /etc/systemd/system/weather-api.service
sudo sed -i "s|/home/ubuntu|$HOME|g" /etc/systemd/system/weather-api.service

sudo systemctl daemon-reload
sudo systemctl enable weather-api
sudo systemctl start weather-api

echo -e "${BLUE}Step 6: Deploying frontend to Apache...${NC}"
sudo rm -rf /var/www/html/*
sudo cp -r frontend/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

echo -e "${BLUE}Step 7: Configuring Apache reverse proxy...${NC}"
sudo a2enmod proxy proxy_http headers
sudo systemctl restart apache2

echo -e "${BLUE}Step 8: Checking service status...${NC}"
sudo systemctl status weather-api --no-pager

echo ""
echo -e "${GREEN}=================================="
echo -e "Deployment Complete! ✓"
echo -e "==================================${NC}"
echo ""
echo "Backend API: http://localhost:8000"
echo "Frontend: http://$(curl -s ifconfig.me)"
echo ""
echo "To view backend logs: sudo journalctl -u weather-api -f"
echo "To view Apache logs: sudo tail -f /var/log/apache2/error.log"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Configure Apache reverse proxy (see AWS_DEPLOYMENT_GUIDE.md)"
echo "2. Update frontend config.js with your domain/IP"
echo "3. (Optional) Set up HTTPS with Let's Encrypt"
echo ""
