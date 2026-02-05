
#!/bin/bash

# Project Elaheh Installer
# Version 1.9.8 (Fix NPM Hangs & Late Domain Config)
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
    if [ -f /etc/resolv.conf ]; then
        $SUDO cp -L /etc/resolv.conf /tmp/resolv.conf.backup_elaheh
    fi
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

# Advanced NPM Config for Iran
configure_iran_npm_environment() {
    echo -e "${YELLOW}[!] Configuring Advanced NPM Mirrors (Binary Bypasses)...${NC}"
    
    # 1. Base Registry (Taobao/NpmMirror is most stable for Iran)
    $SUDO npm config set registry https://registry.npmmirror.com --global 2>/dev/null || true
    
    # 2. Disable Strict SSL (Fixes random handshake drops)
    $SUDO npm config set strict-ssl false --global 2>/dev/null || true
    
    # 3. Increase Network Timeouts
    $SUDO npm config set fetch-retry-mintimeout 20000 --global 2>/dev/null || true
    $SUDO npm config set fetch-retry-maxtimeout 120000 --global 2>/dev/null || true
    $SUDO npm config set fetch-retries 10 --global 2>/dev/null || true
    
    # 4. CRITICAL: Redirect Binary Downloads to Mirrors
    # This prevents npm install from trying to download binaries from Github/S3 which usually hangs
    $SUDO npm config set sass_binary_site https://npmmirror.com/mirrors/node-sass --global 2>/dev/null || true
    $SUDO npm config set electron_mirror https://npmmirror.com/mirrors/electron/ --global 2>/dev/null || true
    $SUDO npm config set puppeteer_download_host https://npmmirror.com/mirrors/chrome-for-testing --global 2>/dev/null || true
    $SUDO npm config set chromedriver_cdnurl https://npmmirror.com/mirrors/chromedriver --global 2>/dev/null || true
    $SUDO npm config set operative_system_selection_disabled true --global 2>/dev/null || true
    $SUDO npm config set sentrycli_cdnurl https://npmmirror.com/mirrors/sentry-cli --global 2>/dev/null || true
    $SUDO npm config set sharp_binary_host https://npmmirror.com/mirrors/sharp --global 2>/dev/null || true
    $SUDO npm config set sharp_libvips_binary_host https://npmmirror.com/mirrors/sharp-libvips --global 2>/dev/null || true
    
    echo -e "${GREEN}[+] NPM Environment Optimized for Restricted Networks.${NC}"
}

repair_apt_system() {
    echo -e "${YELLOW}[!] Analyzing and Repairing APT/DPKG System...${NC}"
    $SUDO killall apt apt-get dpkg 2>/dev/null || true
    sleep 2
    locks=("/var/lib/dpkg/lock-frontend" "/var/lib/dpkg/lock" "/var/cache/apt/archives/lock" "/var/lib/apt/lists/lock")
    for lock in "${locks[@]}"; do
        if [ -f "$lock" ]; then $SUDO rm -f "$lock"; fi
    done
    if grep -q "mirror.runflare.com" /etc/apt/sources.list; then
        $SUDO sed -i 's/mirror.runflare.com/archive.ubuntu.com/g' /etc/apt/sources.list
        $SUDO sed -i 's/http:\/\/mirror.runflare.com/http:\/\/archive.ubuntu.com/g' /etc/apt/sources.list
    fi
    $SUDO dpkg --configure -a || true
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
echo "   Version 1.9.8 (Fix NPM Hangs & Late Domain Config)"
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
    apply_google_dns
else
    echo -e "${GREEN}>> Configuring as FOREIGN Server...${NC}"
fi

# NOTE: We do NOT ask for domain here anymore. We wait until installs are done.

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
    repair_apt_system
    echo -e "   > Updating repository lists..."
    $SUDO apt-get update -y -qq
    echo -e "   > Applying system upgrades..."
    $SUDO apt-get upgrade -y -qq
    echo -e "   > Installing dependencies..."
    $SUDO apt-get install -y -qq curl git unzip ufw xz-utils grep sed nginx certbot python3-certbot-nginx socat lsof build-essential openvpn wireguard sqlite3 redis-server cron tar

elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"Fedora"* ]]; then
    $SUDO dnf upgrade -y --refresh
    $SUDO dnf install -y -q curl git unzip firewalld grep sed nginx certbot python3-certbot-nginx socat lsof tar make openvpn wireguard-tools sqlite redis cronie
    $SUDO systemctl enable --now crond
else
    echo -e "${RED}Unsupported OS. Proceeding with caution.${NC}"
fi

# -----------------------------------------------------------------------------
# Service Configuration
# -----------------------------------------------------------------------------

$SUDO systemctl enable --now redis-server >/dev/null 2>&1 || $SUDO systemctl enable --now redis >/dev/null 2>&1

# Force 2GB Swap for NPM stability
TOTAL_MEM=$(grep MemTotal /proc/meminfo | awk '{print $2}')
if [ "$TOTAL_MEM" -lt 3000000 ]; then
    if [ ! -f /swapfile ]; then
        echo -e "   > Low memory detected. Adding Swap file (2GB)..."
        $SUDO fallocate -l 2G /swapfile
        $SUDO chmod 600 /swapfile
        $SUDO mkswap /swapfile >/dev/null 2>&1
        $SUDO swapon /swapfile
        echo '/swapfile none swap sw 0 0' | $SUDO tee -a /etc/fstab > /dev/null
    fi
fi

# -----------------------------------------------------------------------------
# Node.js Installation (Iran Standard Strategy)
# -----------------------------------------------------------------------------

install_node_iran_standard() {
    echo -e "${YELLOW}[!] Installing Node.js (Iran Standard Strategy)...${NC}"
    NODE_VERSION="v22.12.0" 
    NODE_DIST="node-${NODE_VERSION}-linux-x64"
    NODE_URL="https://nodejs.org/dist/${NODE_VERSION}/${NODE_DIST}.tar.xz"
    $SUDO rm -rf /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx
    $SUDO rm -rf /usr/local/lib/node_modules/npm
    
    echo -e "   > Downloading Node.js binary..."
    if curl -L --retry 3 --retry-delay 5 -o node.tar.xz "$NODE_URL"; then
        tar -xf node.tar.xz
        $SUDO cp -R ${NODE_DIST}/* /usr/local/
        rm -rf node.tar.xz ${NODE_DIST}
        echo -e "${GREEN}   > Node.js installed: $(node -v)${NC}"
    else
        echo -e "${RED}   > Failed to download Node.js.${NC}"
        exit 1
    fi
}

install_node_iran_standard

# Configure Mirrors
if [[ "$ROLE" == "iran" ]]; then
    configure_iran_npm_environment
fi

$SUDO npm install -g pm2 @angular/cli >/dev/null 2>&1

# -----------------------------------------------------------------------------
# Project Setup & NPM Install (The Critical Part)
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
if git clone "https://github.com/ehsanking/Elaheh-Project.git" . >/dev/null 2>&1; then
    echo -e "${GREEN}   > Git clone successful.${NC}"
else
    echo -e "${YELLOW}   > Git clone failed. Trying direct ZIP download...${NC}"
    curl -L "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/main.zip" -o repo.zip
    unzip -q repo.zip
    mv Elaheh-Project-main/* .
    mv Elaheh-Project-main/.* . 2>/dev/null || true
    rm -rf Elaheh-Project-main repo.zip
    echo -e "${GREEN}   > ZIP download successful.${NC}"
fi

echo -e "   > Installing NPM Packages (This may take time)..."
export NODE_OPTIONS="--max-old-space-size=4096"

# Cleanup any previous artifacts
rm -rf node_modules package-lock.json

# Attempt Install with verbose output reduced, but handling binary mirrors via config
echo -e "   > Using mirrors: registry.npmmirror.com + Binary Mirrors"
npm install --legacy-peer-deps --no-audit --no-fund --loglevel warn

# Explicitly install GenAI if missed
npm install @google/genai@latest --legacy-peer-deps --save --no-audit

echo -e "   > Building Application..."
npm run build

DIST_PATH="$INSTALL_DIR/dist/project-elaheh/browser"
if [ ! -d "$DIST_PATH" ]; then
    echo -e "${RED}[!] Build Failed! Check memory or logs.${NC}"
    if [ "$ROLE" == "iran" ]; then restore_original_dns; fi
    exit 1
fi

# -----------------------------------------------------------------------------
# DOMAIN & SSL CONFIGURATION (MOVED TO END)
# -----------------------------------------------------------------------------

echo -e ""
echo -e "${CYAN}----------------------------------------------------------------${NC}"
echo -e "${CYAN}   FINAL STEP: DOMAIN CONFIGURATION${NC}"
echo -e "${CYAN}----------------------------------------------------------------${NC}"
echo -e "${YELLOW}Now that the system is ready, please enter your domain.${NC}"
echo -e "Ensure your domain's A record points to: $(curl -s ifconfig.me)"
echo -e ""

while [ -z "$DOMAIN" ]; do
    read -p "Enter your Domain (e.g. panel.example.com): " DOMAIN
done
EMAIL="admin@${DOMAIN}"

# Config File Generation
mkdir -p "$DIST_PATH/assets"
cat <<EOF > "$DIST_PATH/assets/server-config.json"
{
  "role": "${ROLE}",
  "key": "",
  "domain": "${DOMAIN}",
  "installedAt": "$(date)"
}
EOF

# Nginx Config
echo -e "   > Configuring Nginx..."
$SUDO systemctl stop nginx >/dev/null 2>&1 || true
for P in 80 110; do
    PIDS=$($SUDO lsof -t -i:$P || true)
    if [ -n "$PIDS" ]; then $SUDO kill -9 $PIDS || true; fi
done

# Initial Nginx for Certbot (HTTP only first)
cat <<EOF | $SUDO tee /etc/nginx/sites-available/elaheh > /dev/null
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    root /opt/elaheh-project/dist/project-elaheh/browser;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
$SUDO ln -sf /etc/nginx/sites-available/elaheh /etc/nginx/sites-enabled/
$SUDO systemctl start nginx

# Request SSL
if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo -e "   > Requesting SSL Certificate (Certbot)..."
    $SUDO certbot certonly --nginx --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}" || echo -e "${RED}[!] SSL Generation failed. Check your DNS. You can try again inside the panel.${NC}"
fi

# Final Nginx Config (HTTPS)
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
$SUDO systemctl restart nginx

# SSL Auto-Renewal
echo -e "   > Configuring SSL Auto-Renewal..."
($SUDO crontab -l 2>/dev/null | grep -v "certbot renew") | $SUDO crontab - || true
($SUDO crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --deploy-hook 'systemctl reload nginx'") | $SUDO crontab -

# -----------------------------------------------------------------------------
# Finalize
# -----------------------------------------------------------------------------

echo -e "   > Starting Application..."
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
