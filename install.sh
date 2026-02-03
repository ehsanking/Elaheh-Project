#!/bin/bash

# Project Elaheh Installer
# Version 1.0.1
# Author: EHSANKiNG

set -e

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "################################################################"
echo "   Project Elaheh - Tunnel Management System"
echo "   Version 1.0.1"
echo "   'اینترنت آزاد برای همه یا هیچکس'"
echo "   'Free Internet for everyone or no one'"
echo "################################################################"
echo -e "${NC}"

# Check root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 1
fi

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
fi
echo -e "${GREEN}[+] Detected OS: $OS${NC}"

# Install System Dependencies
echo -e "${GREEN}[+] Installing system dependencies...${NC}"
if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get install -y -qq curl git unzip
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]]; then
    dnf install -y -q curl git unzip
fi

# Install Node.js 20
if ! command -v node &> /dev/null; then
    echo -e "${GREEN}[+] Installing Node.js 20...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt-get install -y -qq nodejs
    else
        dnf install -y -q nodejs
    fi
else
    echo -e "${GREEN}[+] Node.js is already installed.${NC}"
fi

# Setup Directory
INSTALL_DIR="/opt/project-elaheh"
REPO_URL="https://github.com/EHSANKiNG/project-elaheh.git"

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

# Install NPM Packages
echo -e "${GREEN}[+] Installing NPM packages (this may take a moment)...${NC}"
npm install --silent

# Parse Arguments
ROLE="unknown"
KEY=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --role) ROLE="$2"; shift ;;
        --key) KEY="$2"; shift ;;
        *) shift ;;
    esac
done

# Save Configuration (Mock Backend)
mkdir -p src/assets
cat <<EOF > src/assets/server-config.json
{
  "role": "$ROLE",
  "key": "$KEY",
  "installedAt": "$(date)"
}
EOF

# Get Public IP
PUBLIC_IP=$(curl -s ifconfig.me || echo "localhost")

echo -e "${CYAN}"
echo "################################################################"
echo "   Installation Complete!"
echo "   Dashboard URL: http://$PUBLIC_IP:4200"
echo "   Role: $ROLE"
echo "################################################################"
echo -e "${NC}"

echo "Starting Application..."
npm start
