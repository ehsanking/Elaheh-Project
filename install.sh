
#!/bin/bash

# Project Elaheh Installer
# Version 2.1.9 (Node.js Binary Mirror Fix)
# Author: EHSANKiNG

set -e

# Colors
GREEN='\033[1;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# -----------------------------------------------------------------------------
# Helper Functions
# -----------------------------------------------------------------------------

configure_iran_npm_environment() {
    echo -e "${YELLOW}[!] Configuring NPM to use ArvanCloud Mirrors...${NC}"
    
    # 1. Base Registry (ArvanCloud is fastest for Iran)
    $SUDO npm config set registry https://lib.arvancloud.ir/npm/ --global 2>/dev/null || true
    
    # 2. Disable Strict SSL & Force IPv4 (Fixes random handshake drops & IPv6 timeouts)
    $SUDO npm config set strict-ssl false --global 2>/dev/null || true
    $SUDO npm config set local-address 0.0.0.0 --global 2>/dev/null || true
    
    # 3. Increase Network Timeouts
    $SUDO npm config set fetch-retry-mintimeout 20000 --global 2>/dev/null || true
    $SUDO npm config set fetch-retry-maxtimeout 120000 --global 2>/dev/null || true
    $SUDO npm config set fetch-retries 5 --global 2>/dev/null || true
    
    # 4. CRITICAL: Export Environment Variables for Binary Mirrors (ArvanCloud)
    echo -e "   > Setting binary mirrors env vars for ArvanCloud..."
    
    export SASS_BINARY_SITE=https://lib.arvancloud.ir/node-sass
    export ELECTRON_MIRROR=https://lib.arvancloud.ir/electron/
    export PUPPETEER_DOWNLOAD_HOST=https://lib.arvancloud.ir/chrome-for-testing
    export CHROMEDRIVER_CDNURL=https://lib.arvancloud.ir/chromedriver
    export SENTRYCLI_CDNURL=https://lib.arvancloud.ir/sentry-cli
    export SHARP_BINARY_HOST=https://lib.arvancloud.ir/sharp
    export SHARP_LIBVIPS_BINARY_HOST=https://lib.arvancloud.ir/sharp-libvips
    export PYTHON_MIRROR=https://lib.arvancloud.ir/python
    export NVM_NODEJS_ORG_MIRROR=https://lib.arvancloud.ir/node
    
    # Persist these for the current session and sudo usage
    $SUDO npm config set sass_binary_site https://lib.arvancloud.ir/node-sass --global 2>/dev/null || true
    $SUDO npm config set electron_mirror https://lib.arvancloud.ir/electron/ --global 2>/dev/null || true
    $SUDO npm config set sharp_binary_host https://lib.arvancloud.ir/sharp --global 2>/dev/null || true
    $SUDO npm config set sharp_libvips_binary_host https://lib.arvancloud.ir/sharp-libvips --global 2>/dev/null || true

    echo -e "${GREEN}[+] NPM Environment Optimized for Iran (ArvanCloud Mirrors Active).${NC}"
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
echo "   Version 2.1.9 (Node.js Binary Mirror Fix)"
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

# Normalize input to handle Persian/Arabic numerals and ensure robustness
if [[ "$ROLE_CHOICE" == *"2"* || "$ROLE_CHOICE" == *"۲"* ]]; then
    ROLE_CHOICE_NORMALIZED=2
else
    ROLE_CHOICE_NORMALIZED=1
fi

ROLE="external"
REGISTRY_FLAG="" # This will be empty for non-Iran servers
if [ "$ROLE_CHOICE_NORMALIZED" -eq 2 ]; then
    ROLE="iran"
    # This flag forces all npm/pnpm commands to use the ArvanCloud mirror
    REGISTRY_FLAG="--registry=https://lib.arvancloud.ir/npm/"
    echo -e "${GREEN}>> Configuring as IRAN Server...${NC}"
else
    echo -e "${GREEN}>> Configuring as FOREIGN Server...${NC}"
fi

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
    $SUDO apt-get install -y -qq curl git unzip ufw xz-utils grep sed nginx certbot python3-certbot-nginx socat lsof build-essential openvpn wireguard sqlite3 redis-server cron tar coreutils

elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"Fedora"* ]]; then
    $SUDO dnf upgrade -y --refresh
    $SUDO dnf install -y -q curl git unzip firewalld grep sed nginx certbot python3-certbot-nginx socat lsof tar make openvpn wireguard-tools sqlite redis cronie coreutils
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
# Node.js & PNPM Installation
# -----------------------------------------------------------------------------

install_node_iran_standard() {
    echo -e "${YELLOW}[!] Installing Node.js...${NC}"
    NODE_VERSION="v22.12.0" 
    NODE_DIST="node-${NODE_VERSION}-linux-x64"
    
    if [[ "$ROLE" == "iran" ]]; then
        # CRITICAL FIX: Arvan's node binary mirror is unreliable/has a different path.
        # npmmirror.com is the most stable and fastest option for binaries in Iran.
        NODE_URL="https://npmmirror.com/mirrors/node/${NODE_VERSION}/${NODE_DIST}.tar.xz"
        echo -e "   > Using npmmirror.com for Node.js binary download (fastest mirror for region)."
    else
        NODE_URL="https://nodejs.org/dist/${NODE_VERSION}/${NODE_DIST}.tar.xz"
    fi

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

echo -e "   > Installing pnpm package manager..."
$SUDO npm install -g pnpm --loglevel error ${REGISTRY_FLAG}
echo -e "${GREEN}   > pnpm installed successfully.${NC}"

if [[ "$ROLE" == "iran" ]]; then
    echo -e "   > Configuring pnpm to use ArvanCloud mirror..."
    $SUDO pnpm config set registry https://lib.arvancloud.ir/npm/ --global
fi

echo -e "   > Configuring pnpm global location..."
$SUDO pnpm config set --global global-bin-dir /usr/local/bin

echo -e "   > Installing global tools (pm2, @angular/cli) using pnpm..."
$SUDO pnpm add -g pm2 @angular/cli ${REGISTRY_FLAG}

# -----------------------------------------------------------------------------
# Project Setup & Dependency Install (The Critical Part)
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

echo -e "   > Downloading Source Code (Git with 45s timeout)..."
if timeout 45 git clone --depth 1 "https://github.com/ehsanking/Elaheh-Project.git" . >/dev/null 2>&1; then
    echo -e "${GREEN}   > Git clone successful.${NC}"
else
    echo -e "${YELLOW}   > Git clone failed or timed out. Trying direct ZIP download...${NC}"
    curl -L "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/main.zip" -o repo.zip
    unzip -q repo.zip
    mv Elaheh-Project-main/* .
    mv Elaheh-Project-main/.* . 2>/dev/null || true
    rm -rf Elaheh-Project-main repo.zip
    echo -e "${GREEN}   > ZIP download successful.${NC}"
fi

echo -e "   > Installing Project Dependencies with pnpm..."
export NODE_OPTIONS="--max-old-space-size=4096"

# Cleanup any previous artifacts
rm -rf node_modules package-lock.json

# CRITICAL: Re-export variables here to ensure they persist in this shell context for pnpm install
if [[ "$ROLE" == "iran" ]]; then
    export SASS_BINARY_SITE=https://lib.arvancloud.ir/node-sass
    export ELECTRON_MIRROR=https://lib.arvancloud.ir/electron/
    export SHARP_BINARY_HOST=https://lib.arvancloud.ir/sharp
    export SHARP_LIBVIPS_BINARY_HOST=https://lib.arvancloud.ir/sharp-libvips
fi

# Create .npmrc to handle peer dependency issues
echo "legacy-peer-deps=true" > .npmrc
if [[ "$ROLE" == "iran" ]]; then
    # This project-local .npmrc overrides any user/global config.
    echo "registry=https://lib.arvancloud.ir/npm/" >> .npmrc
    echo -e "   > Enforcing ArvanCloud mirror via local .npmrc file."
fi


if pnpm install ${REGISTRY_FLAG}; then
    echo -e "${GREEN}   > pnpm install successful.${NC}"
else
    echo -e "${RED}   > pnpm install failed. Please check network connection and logs.${NC}"
    exit 1
fi

echo -e "   > Verifying @google/genai installation..."
pnpm add @google/genai@latest ${REGISTRY_FLAG}

echo -e "   > Building Application..."
pnpm run build

DIST_PATH="$INSTALL_DIR/dist/project-elaheh/browser"
if [ ! -d "$DIST_PATH" ]; then
    echo -e "${RED}[!] Build Failed! Check memory or logs.${NC}"
    exit 1
fi

# -----------------------------------------------------------------------------
# DOMAIN & SSL CONFIGURATION
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

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   INSTALLATION SUCCESSFUL!${NC}"
echo -e "   Role: ${ROLE^^}"
echo -e "   Panel URL: https://${DOMAIN}"
echo -e "   SSL: Auto-Renew Enabled"
echo -e "${GREEN}=========================================${NC}"
