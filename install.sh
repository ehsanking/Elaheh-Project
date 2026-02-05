
#!/bin/bash

# Project Elaheh Installer
# Version 1.9.6 (Iran Standard: Direct Node Binary & APT Repair)
# Author: EHSANKiNG

set -e

# Colors
GREEN='\033[1;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# -----------------------------------------------------------------------------
# DNS & Network Helper Functions
# -----------------------------------------------------------------------------

apply_google_dns() {
    echo -e "${YELLOW}[!] Backing up current DNS and switching to Google DNS (8.8.8.8)...${NC}"
    
    # Backup existing resolv.conf
    if [ -f /etc/resolv.conf ]; then
        $SUDO cp -L /etc/resolv.conf /tmp/resolv.conf.backup_elaheh
    fi

    # Set Google DNS
    $SUDO rm -f /etc/resolv.conf
    echo "nameserver 8.8.8.8" | $SUDO tee /etc/resolv.conf > /dev/null
    echo "nameserver 8.8.4.4" | $SUDO tee -a /etc/resolv.conf > /dev/null

    echo -e "   > Restarting Network/DNS Services..."
    if systemctl list-units --full -all | grep -q "systemd-resolved.service"; then
        $SUDO systemctl restart systemd-resolved
    elif systemctl list-units --full -all | grep -q "networking.service"; then
        $SUDO systemctl restart networking
    elif systemctl list-units --full -all | grep -q "NetworkManager.service"; then
        $SUDO systemctl restart NetworkManager
    fi
    sleep 3
    echo -e "${GREEN}[+] Google DNS applied.${NC}"
}

restore_original_dns() {
    echo -e "${YELLOW}[!] Restoring original DNS configuration...${NC}"
    if [ -f /tmp/resolv.conf.backup_elaheh ]; then
        $SUDO cp /tmp/resolv.conf.backup_elaheh /etc/resolv.conf
        $SUDO rm -f /tmp/resolv.conf.backup_elaheh
        # Restart networking to apply
        if systemctl list-units --full -all | grep -q "systemd-resolved.service"; then
            $SUDO systemctl restart systemd-resolved
        elif systemctl list-units --full -all | grep -q "networking.service"; then
            $SUDO systemctl restart networking
        fi
        echo -e "${GREEN}[+] Original DNS restored.${NC}"
    else
        echo -e "${RED}[!] Warning: DNS backup not found.${NC}"
    fi
}

configure_iran_npm_mirrors() {
    echo -e "${YELLOW}[!] Configuring Iranian NPM Mirrors...${NC}"
    # We prioritize Runflare as the registry url for NPM ONLY (not APT)
    if command -v npm >/dev/null 2>&1; then
        $SUDO npm config set registry https://npm.runflare.com --global 2>/dev/null || true
        echo -e "${GREEN}[+] NPM Registry set to Runflare (Iran Optimized).${NC}"
    fi
}

repair_apt_system() {
    echo -e "${YELLOW}[!] Analyzing and Repairing APT/DPKG System...${NC}"
    
    # 1. Kill stuck processes
    $SUDO killall apt apt-get dpkg 2>/dev/null || true
    sleep 2
    
    # 2. Remove Lock Files
    locks=(
        "/var/lib/dpkg/lock-frontend"
        "/var/lib/dpkg/lock"
        "/var/cache/apt/archives/lock"
        "/var/lib/apt/lists/lock"
    )
    for lock in "${locks[@]}"; do
        if [ -f "$lock" ]; then
            echo -e "   > Removing lock: $lock"
            $SUDO rm -f "$lock"
        fi
    done
    
    # 3. Fix Corrupted Sources (Remove unreachable mirrors like runflare from APT)
    if grep -q "mirror.runflare.com" /etc/apt/sources.list; then
        echo -e "${YELLOW}   > Fixing sources.list: Removing unreachable mirrors...${NC}"
        $SUDO sed -i 's/mirror.runflare.com/archive.ubuntu.com/g' /etc/apt/sources.list
        $SUDO sed -i 's/http:\/\/mirror.runflare.com/http:\/\/archive.ubuntu.com/g' /etc/apt/sources.list
    fi

    # 4. Repair DPKG
    echo -e "   > Running dpkg --configure -a..."
    $SUDO dpkg --configure -a || true
    
    # 5. Fix Broken Installs
    echo -e "   > Running apt --fix-broken install..."
    $SUDO apt-get install -f -y || true
    
    echo -e "${GREEN}[+] System package manager repaired.${NC}"
}

# -----------------------------------------------------------------------------
# Initialization
# -----------------------------------------------------------------------------

clear
echo -e "${CYAN}"
echo "################################################################"
echo "   Project Elaheh - Stealth Tunnel Management System"
echo "   Version 1.9.6 (Iran Standard)"
echo "   'Secure. Fast. Uncensored.'"
echo "################################################################"
echo -e "${NC}"

# Sudo Check
SUDO=""
if [ "$EUID" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    echo -e "${YELLOW}[!] Running with sudo...${NC}"
    SUDO="sudo"
  else
    echo -e "${RED}Error: Root privileges required. Please install sudo or run as root.${NC}"
    exit 1
  fi
fi

# Fix Hostname Resolution
HOSTNAME=$(hostname)
if ! grep -q "127.0.0.1.*$HOSTNAME" /etc/hosts; then
    echo "127.0.0.1 $HOSTNAME" | $SUDO tee -a /etc/hosts > /dev/null
fi

# -----------------------------------------------------------------------------
# Configuration & Role Selection
# -----------------------------------------------------------------------------

echo -e "${YELLOW}Select Server Location/Role:${NC}"
echo "1) Foreign Server (Upstream)"
echo "2) Iran Server (Edge - User Access)"
read -p "Select [1 or 2]: " ROLE_CHOICE

ROLE="external"
if [ "$ROLE_CHOICE" -eq 2 ]; then
    ROLE="iran"
    echo -e "${GREEN}>> Configuring as IRAN Server...${NC}"
    
    # Step 1: Set DNS immediately to ensure connectivity
    apply_google_dns
else
    echo -e "${GREEN}>> Configuring as FOREIGN Server...${NC}"
fi

echo -e "${YELLOW}Enter your Domain:${NC}"
read -p "Domain: " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Domain is required.${NC}"
    if [ "$ROLE" == "iran" ]; then restore_original_dns; fi
    exit 1
fi
EMAIL="admin@${DOMAIN}"

# -----------------------------------------------------------------------------
# System Update & Upgrade
# -----------------------------------------------------------------------------

echo ""
echo -e "${CYAN}Starting System Update...${NC}"

if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    OS_ID=$ID
fi

echo -e "   > Detected OS: $OS"

export DEBIAN_FRONTEND=noninteractive

if [[ "$OS_ID" == "ubuntu" ]] || [[ "$OS_ID" == "debian" ]]; then
    # CRITICAL: Repair APT/DPKG before attempting update
    repair_apt_system

    echo -e "   > Updating repository lists..."
    $SUDO apt-get update -y -qq
    
    echo -e "   > Applying system upgrades (Safe Upgrade)..."
    $SUDO apt-get upgrade -y -qq
    
    echo -e "   > Installing dependencies..."
    $SUDO apt-get install -y -qq curl git unzip ufw xz-utils grep sed nginx certbot python3-certbot-nginx socat lsof build-essential openvpn wireguard sqlite3 redis-server cron tar

elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"Fedora"* ]]; then
    echo -e "   > Applying system upgrades..."
    $SUDO dnf upgrade -y --refresh
    $SUDO dnf install -y -q curl git unzip firewalld grep sed nginx certbot python3-certbot-nginx socat lsof tar make openvpn wireguard-tools sqlite redis cronie
    $SUDO systemctl enable --now crond
else
    echo -e "${RED}Unsupported OS. Proceeding with caution.${NC}"
fi

# -----------------------------------------------------------------------------
# Service Configuration
# -----------------------------------------------------------------------------

# Enable Redis
$SUDO systemctl enable --now redis-server >/dev/null 2>&1 || $SUDO systemctl enable --now redis >/dev/null 2>&1

# Swap Setup (if needed)
TOTAL_MEM=$(grep MemTotal /proc/meminfo | awk '{print $2}')
if [ "$TOTAL_MEM" -lt 2000000 ]; then
    if [ ! -f /swapfile ]; then
        echo -e "   > Adding Swap file (2GB)..."
        $SUDO fallocate -l 2G /swapfile
        $SUDO chmod 600 /swapfile
        $SUDO mkswap /swapfile >/dev/null 2>&1
        $SUDO swapon /swapfile
        echo '/swapfile none swap sw 0 0' | $SUDO tee -a /etc/fstab > /dev/null
    fi
fi

# Cleanup Ports
echo -e "   > Cleaning up ports 80/443..."
$SUDO systemctl stop nginx >/dev/null 2>&1 || true
for P in 80 110; do
    PIDS=$($SUDO lsof -t -i:$P || true)
    if [ -n "$PIDS" ]; then $SUDO kill -9 $PIDS || true; fi
done

# SSL & Auto-Renewal
if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo -e "   > Requesting SSL Certificate..."
    $SUDO certbot certonly --standalone --preferred-challenges http --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}" || echo -e "${YELLOW}Warning: SSL request failed. You can retry later via dashboard.${NC}"
fi

# Configure Nginx
echo -e "   > Configuring Nginx..."
cat <<EOF | $SUDO tee /etc/nginx/sites-available/elaheh > /dev/null
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    root /opt/elaheh-project/dist/project-elaheh/browser;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /ws {
        if (\$http_upgrade != "websocket") { return 404; }
        proxy_pass http://127.0.0.1:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF
$SUDO ln -sf /etc/nginx/sites-available/elaheh /etc/nginx/sites-enabled/
$SUDO systemctl restart nginx

# -----------------------------------------------------------------------------
# Node.js Installation (Iran Standard Strategy)
# -----------------------------------------------------------------------------
# We bypass NVM/Github entirely and use direct binary download from nodejs.org
# This works reliably in Iran where Github/Raw might be blocked.

install_node_iran_standard() {
    echo -e "${YELLOW}[!] Installing Node.js (Iran Standard Strategy)...${NC}"
    
    # Node v22 LTS (Stable & Modern)
    NODE_VERSION="v22.12.0" 
    NODE_DIST="node-${NODE_VERSION}-linux-x64"
    NODE_URL="https://nodejs.org/dist/${NODE_VERSION}/${NODE_DIST}.tar.xz"
    
    # Cleanup previous installs
    $SUDO rm -rf /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx
    $SUDO rm -rf /usr/local/lib/node_modules/npm
    
    echo -e "   > Downloading Node.js binary from official source..."
    if curl -L --retry 3 --retry-delay 5 -o node.tar.xz "$NODE_URL"; then
        echo -e "   > Extracting..."
        tar -xf node.tar.xz
        
        echo -e "   > Installing to /usr/local..."
        $SUDO cp -R ${NODE_DIST}/* /usr/local/
        
        # Cleanup
        rm -rf node.tar.xz ${NODE_DIST}
        
        echo -e "${GREEN}   > Node.js installed: $(node -v)${NC}"
    else
        echo -e "${RED}   > Failed to download Node.js. Check your internet connection.${NC}"
        exit 1
    fi
}

install_node_iran_standard

# Configure Mirrors for NPM
if [[ "$ROLE" == "iran" ]]; then
    configure_iran_npm_mirrors
fi

$SUDO npm install -g pm2 @angular/cli >/dev/null 2>&1

# -----------------------------------------------------------------------------
# Project Setup
# -----------------------------------------------------------------------------

INSTALL_DIR="/opt/elaheh-project"
CURRENT_USER=$(id -un)
CURRENT_GROUP=$(id -gn)

echo -e "   > Setting up Project..."

if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}   > Cleaning existing directory...${NC}"
    $SUDO rm -rf "$INSTALL_DIR"
fi

$SUDO mkdir -p "$INSTALL_DIR"
$SUDO chown -R $CURRENT_USER:$CURRENT_GROUP "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo -e "   > Downloading Source Code..."
# Try git, fallback to zip
if git clone "https://github.com/ehsanking/Elaheh-Project.git" . >/dev/null 2>&1; then
    echo -e "${GREEN}   > Git clone successful.${NC}"
else
    echo -e "${YELLOW}   > Git clone failed/blocked. Trying direct ZIP download...${NC}"
    curl -L "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/main.zip" -o repo.zip
    unzip -q repo.zip
    mv Elaheh-Project-main/* .
    mv Elaheh-Project-main/.* . 2>/dev/null || true
    rm -rf Elaheh-Project-main repo.zip
    echo -e "${GREEN}   > ZIP download successful.${NC}"
fi

echo -e "   > Installing NPM Packages..."
export NODE_OPTIONS="--max-old-space-size=4096"

npm install --legacy-peer-deps --loglevel error
npm install @google/genai@latest --legacy-peer-deps --save

echo -e "   > Building Application..."
npm run build

DIST_PATH="$INSTALL_DIR/dist/project-elaheh/browser"
if [ ! -d "$DIST_PATH" ]; then
    echo -e "${RED}[!] Build Failed! Check memory or logs.${NC}"
    if [ "$ROLE" == "iran" ]; then restore_original_dns; fi
    exit 1
fi

# Config File
mkdir -p "$DIST_PATH/assets"
cat <<EOF > "$DIST_PATH/assets/server-config.json"
{
  "role": "${ROLE}",
  "key": "",
  "domain": "${DOMAIN}",
  "installedAt": "$(date)"
}
EOF

# Finalize
echo -e "   > Starting Services..."
$SUDO pm2 delete elaheh-app 2>/dev/null || true
$SUDO pm2 serve "$DIST_PATH" ${APP_PORT:-3000} --name "elaheh-app" --spa
$SUDO pm2 save --force
$SUDO pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# Firewall
echo -e "   > Configuring Firewall..."
if command -v ufw &> /dev/null; then
    $SUDO ufw allow 22/tcp >/dev/null 2>&1
    $SUDO ufw allow 80/tcp >/dev/null 2>&1
    $SUDO ufw allow 443/tcp >/dev/null 2>&1
    $SUDO ufw allow 110/tcp >/dev/null 2>&1
    $SUDO ufw allow 1414/udp >/dev/null 2>&1
    echo "y" | $SUDO ufw enable >/dev/null 2>&1
elif command -v firewall-cmd &> /dev/null; then
    $SUDO systemctl start firewalld
    $SUDO firewall-cmd --permanent --add-port=80/tcp >/dev/null 2>&1
    $SUDO firewall-cmd --permanent --add-port=443/tcp >/dev/null 2>&1
    $SUDO firewall-cmd --permanent --add-port=1414/udp >/dev/null 2>&1
    $SUDO firewall-cmd --reload >/dev/null 2>&1
fi

# -----------------------------------------------------------------------------
# RESTORE DNS
# -----------------------------------------------------------------------------
if [ "$ROLE" == "iran" ]; then
    restore_original_dns
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   INSTALLATION SUCCESSFUL!${NC}"
echo -e "   Role: ${ROLE^^}"
echo -e "   Panel URL: https://${DOMAIN}"
echo -e "   SSL: Auto-Renew Enabled"
echo -e "${GREEN}=========================================${NC}"
