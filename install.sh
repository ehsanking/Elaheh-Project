#!/bin/bash
# Project Elaheh Installer v2.2.0
# Auto-detects OS and installs via ZIP (Releases/Main) to avoid Git auth issues.

set -e

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "################################################################"
echo "   Project Elaheh - Tunnel Management System v2.2.0"
echo "   'اینترنت آزاد برای همه یا هیچکس'"
echo "################################################################"
echo -e "${NC}"

# Check root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 1
fi

# 1. OS Detection & Dependency Install
if [ -f /etc/os-release ]; then . /etc/os-release; fi
echo -e "${GREEN}[+] Detected OS: $NAME${NC}"

if [[ "$NAME" == *"Ubuntu"* ]] || [[ "$NAME" == *"Debian"* ]]; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get install -y -qq curl unzip nodejs sqlite3
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]]; then
    dnf install -y -q curl unzip nodejs sqlite3
else
    echo "Unsupported OS. Proceeding with generic assumptions..."
fi

# 2. Node.js Check
if ! command -v node &> /dev/null; then
    echo -e "${GREEN}[+] Installing Node.js 20...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs || dnf install -y nodejs
fi

# 3. Download Project (Robust Method with Fallbacks)
INSTALL_DIR="/opt/project-elaheh"
rm -rf "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

download_and_extract() {
    URL="$1"
    echo -e "${GREEN}>>> Trying to download: $URL${NC}"
    HTTP_CODE=$(curl -L -w "%{http_code}" -o /tmp/elaheh.zip "$URL")
    
    if [ "$HTTP_CODE" -eq 200 ] && [ $(wc -c < /tmp/elaheh.zip) -gt 1000 ]; then
        echo -e "${GREEN}>>> Download successful. Extracting...${NC}"
        if unzip -o -q /tmp/elaheh.zip -d /tmp/elaheh-extract; then
            mv /tmp/elaheh-extract/*/* "$INSTALL_DIR/" 2>/dev/null || mv /tmp/elaheh-extract/* "$INSTALL_DIR/"
            rm -rf /tmp/elaheh.zip /tmp/elaheh-extract
            return 0
        fi
    fi
    echo -e "${CYAN}>>> Warning: Download failed. Trying next source...${NC}"
    return 1
}

echo -e "${GREEN}[+] Downloading Project Archive...${NC}"
if ! download_and_extract "https://github.com/ehsanking/Elaheh-Project/archive/refs/tags/v2.2.0.zip"; then
    if ! download_and_extract "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/main.zip"; then
        if ! download_and_extract "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/master.zip"; then
            echo ">>> ERROR: Failed to download repository. Please check internet connection or repo visibility."
            exit 1
        fi
    fi
fi

cd "$INSTALL_DIR"

# 4. Install Node Modules
echo -e "${GREEN}[+] Installing Dependencies...${NC}"
npm install --silent --production

# 5. Parse Arguments & Configure
ROLE="unknown"
KEY=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --role) ROLE="$2"; shift ;;
        --key) KEY="$2"; shift ;;
        *) shift ;;
    esac
done

echo -e "${GREEN}[+] Applying Configuration...${NC}"
mkdir -p src/assets
cat <<EOF > src/assets/server-config.json
{
  "role": "$ROLE",
  "key": "$KEY",
  "installedAt": "$(date)"
}
EOF

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
