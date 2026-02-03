#!/bin/bash

# Project Elaheh Installer
# Version 1.0.3
# Author: EHSANKiNG

set -e

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "################################################################"
echo "   Project Elaheh - Tunnel Management System"
echo "   Version 1.0.3 (Fix NPM Issue)"
echo "   'اینترنت آزاد برای همه یا هیچکس'"
echo "################################################################"
echo -e "${NC}"

# 1. Check root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Please run as root (sudo su)${NC}"
  exit 1
fi

# 2. Detect OS & Install Basic Dependencies
echo -e "${GREEN}[+] Detecting OS and installing basics...${NC}"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
fi

if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    # Fix: Added 'npm' here as a fallback, but mainly rely on nodejs package later
    apt-get install -y -qq curl git unzip
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"Fedora"* ]]; then
    dnf install -y -q curl git unzip
fi

# 3. Install Node.js 20 & NPM (FIXED LOGIC)
# We now check for 'npm' specifically. If 'npm' is missing OR 'node' is missing, we install.
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo -e "${GREEN}[+] Node.js or NPM missing. Installing Node.js 20 LTS...${NC}"
    
    # Clean install using NodeSource
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt-get install -y -qq nodejs
    else
        dnf install -y -q nodejs
    fi
else
    echo -e "${GREEN}[+] Node.js ($(node -v)) and NPM ($(npm -v)) are already installed.${NC}"
fi

# 4. Install PM2 (Process Manager)
echo -e "${GREEN}[+] Checking PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${GREEN}[+] Installing PM2 global process manager...${NC}"
    npm install -g pm2
else
    echo -e "${GREEN}[+] PM2 is already installed.${NC}"
fi

# 5. Setup Directory & Clone
INSTALL_DIR="/opt/elaheh-project"
REPO_URL="https://github.com/ehsanking/Elaheh-Project.git"

if [ -d "$INSTALL_DIR" ]; then
    echo -e "${GREEN}[+] Updating existing installation at $INSTALL_DIR...${NC}"
    cd "$INSTALL_DIR"
    git reset --hard
    git pull origin main
else
    echo -e "${GREEN}[+] Cloning repository to $INSTALL_DIR...${NC}"
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# 6. Install NPM Packages
echo -e "${GREEN}[+] Installing Project Dependencies...${NC}"
# Use --unsafe-perm to avoid permission issues when running as root
npm install --silent --unsafe-perm

# 7. Parse Arguments
ROLE="unknown"
KEY=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --role) ROLE="$2"; shift 2;;
    --key) KEY="$2"; shift 2;;
    *) shift 1;;
  esac
done

# 8. Save Configuration
mkdir -p src/assets
echo -e "${GREEN}[+] Saving configuration...${NC}"
cat <<EOF > src/assets/server-config.json
{
  "role": "$ROLE",
  "key": "$KEY",
  "installedAt": "$(date)"
}
EOF

# 9. Start Application with PM2
echo -e "${GREEN}[+] Starting application with PM2...${NC}"
pm2 stop elaheh-app 2>/dev/null || true
pm2 delete elaheh-app 2>/dev/null || true

# Start the app
pm2 start npm --name "elaheh-app" -- start

# Save PM2 list and generate startup script
pm2 save --force
# Automatically setup startup script for current user
pm2 startup | grep "sudo" | bash || true

# 10. Final Output
PUBLIC_IP=$(curl -s ifconfig.me || echo "localhost")

echo -e "${CYAN}"
echo "################################################################"
echo "   Installation Complete!"
echo "   Dashboard URL: http://$PUBLIC_IP:4200"
echo "   Role: $ROLE"
echo "   Status: Application is running in background"
echo "################################################################"
echo -e "${NC}"
