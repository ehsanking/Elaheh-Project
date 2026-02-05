
#!/bin/bash

# Project Elaheh Installer
# Version 2.2.0 (Dynamic Mirror Fallback)
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

find_working_mirror() {
    echo -e "${YELLOW}[!] Finding a responsive NPM mirror for Iran...${NC}"
    mirrors=(
        "https://registry.npmmirror.com/" # Taobao/Alibaba is generally fast and reliable
        "https://registry.npmjs.org/"     # Official, but can be slow from Iran
    )
    
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}Error: curl is not installed. Cannot test mirrors. Defaulting to npmjs.org.${NC}"
        SELECTED_REGISTRY="https://registry.npmjs.org/"
        return
    fi

    for mirror in "${mirrors[@]}"; do
        echo -e "   > Testing mirror: ${mirror}..."
        status_code=$(curl -s -L --max-time 10 -o /dev/null -w "%{http_code}" "${mirror}pnpm")
        
        if [ "$status_code" -eq 200 ]; then
            echo -e "${GREEN}   > Mirror is responsive. Selecting: ${mirror}${NC}"
            SELECTED_REGISTRY="$mirror"
            return
        else
            echo -e "${YELLOW}   > Mirror test failed (HTTP Status: $status_code). Trying next...${NC}"
        fi
    done

    echo -e "${RED}[!] All primary mirrors failed. The installation may be slow or fail. Falling back to the default registry.${NC}"
    SELECTED_REGISTRY="https://registry.npmjs.org/"
}

configure_iran_npm_environment() {
    echo -e "${YELLOW}[!] Configuring NPM to use selected mirror (${SELECTED_REGISTRY}) and reliable binary sources...${NC}"
    
    $SUDO npm config set registry "${SELECTED_REGISTRY}" --global 2>/dev/null || true
    $SUDO npm config set strict-ssl false --global 2>/dev/null || true
    $SUDO npm config set local-address 0.0.0.0 --global 2>/dev/null || true
    $SUDO npm config set fetch-retry-mintimeout 20000 --global 2>/dev/null || true
    $SUDO npm config set fetch-retry-maxtimeout 120000 --global 2>/dev/null || true
    $SUDO npm config set fetch-retries 5 --global 2>/dev/null || true
    
    echo -e "   > Setting binary mirrors env vars to use npmmirror.com..."
    
    export SASS_BINARY_SITE=https://npmmirror.com/mirrors/node-sass
    export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
    export PUPPETEER_DOWNLOAD_HOST=https://npmmirror.com/mirrors/chrome-for-testing
    export CHROMEDRIVER_CDNURL=https://npmmirror.com/mirrors/chromedriver
    export SENTRYCLI_CDNURL=https://npmmirror.com/mirrors/sentry-cli
    export SHARP_BINARY_HOST=https://npmmirror.com/mirrors/sharp
    export SHARP_LIBVIPS_BINARY_HOST=https://npmmirror.com/mirrors/sharp-libvips
    export PYTHON_MIRROR=https://npmmirror.com/mirrors/python
    export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node
    
    $SUDO npm config set sass_binary_site https://npmmirror.com/mirrors/node-sass --global 2>/dev/null || true
    $SUDO npm config set electron_mirror https://npmmirror.com/mirrors/electron/ --global 2>/dev/null || true
    $SUDO npm config set sharp_binary_host https://npmmirror.com/mirrors/sharp --global 2>/dev/null || true
    $SUDO npm config set sharp_libvips_binary_host https://npmmirror.com/mirrors/sharp-libvips --global 2>/dev/null || true

    echo -e "${GREEN}[+] NPM Environment Optimized for Iran (Dynamic Registry + Reliable Binary Mirrors).${NC}"
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
echo "   Version 2.2.0 (Dynamic Mirror Fallback)"
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

if [[ "$ROLE_CHOICE" == *"2"* || "$ROLE_CHOICE" == *"۲"* ]]; then
    ROLE_CHOICE_NORMALIZED=2
else
    ROLE_CHOICE_NORMALIZED=1
fi

ROLE="external"
REGISTRY_FLAG=""
SELECTED_REGISTRY=""

if [ "$ROLE_CHOICE_NORMALIZED" -eq 2 ]; then
    ROLE="iran"
    echo -e "${GREEN}>> Configuring as IRAN Server...${NC}"
    find_working_mirror
    REGISTRY_FLAG="--registry=${SELECTED_REGISTRY}"
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
    $SUDO apt-get update -y -qq
    $SUDO apt-get upgrade -y -qq
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

install_node() {
    echo -e "${YELLOW}[!] Installing Node.js...${NC}"
    NODE_VERSION="v22.12.0" 
    NODE_DIST="node-${NODE_VERSION}-linux-x64"
    
    if [[ "$ROLE" == "iran" ]]; then
        NODE_URL="https://npmmirror.com/mirrors/node/${NODE_VERSION}/${NODE_DIST}.tar.xz"
        echo -e "   > Using npmmirror.com for Node.js binary download."
    else
        NODE_URL="https://nodejs.org/dist/${NODE_VERSION}/${NODE_DIST}.tar.xz"
    fi

    $SUDO rm -rf /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx /usr/local/lib/node_modules/npm
    
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

install_node

if [[ "$ROLE" == "iran" ]]; then
    configure_iran_npm_environment
fi

echo -e "   > Installing pnpm package manager..."
$SUDO npm install -g pnpm --loglevel error ${REGISTRY_FLAG}
echo -e "${GREEN}   > pnpm installed successfully.${NC}"

if [[ "$ROLE" == "iran" ]]; then
    echo -e "   > Configuring pnpm to use selected mirror..."
    $SUDO pnpm config set registry "${SELECTED_REGISTRY}" --global
fi

$SUDO pnpm config set --global global-bin-dir /usr/local/bin

echo -e "   > Installing global tools (pm2, @angular/cli) using pnpm..."
$SUDO pnpm add -g pm2 @angular/cli ${REGISTRY_FLAG}

# -----------------------------------------------------------------------------
# Project Setup & Dependency Install
# -----------------------------------------------------------------------------

INSTALL_DIR="/opt/elaheh-project"
CURRENT_USER=$(id -un)
CURRENT_GROUP=$(id -gn)

echo -e "   > Setting up Project..."
if [ -d "$INSTALL_DIR" ]; then $SUDO rm -rf "$INSTALL_DIR"; fi
$SUDO mkdir -p "$INSTALL_DIR"
$SUDO chown -R $CURRENT_USER:$CURRENT_GROUP "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo -e "   > Downloading Source Code..."
if timeout 45 git clone --depth 1 "https://github.com/ehsanking/Elaheh-Project.git" . >/dev/null 2>&1; then
    echo -e "${GREEN}   > Git clone successful.${NC}"
else
    echo -e "${YELLOW}   > Git clone failed. Trying direct ZIP download...${NC}"
    curl -L "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/main.zip" -o repo.zip
    unzip -q repo.zip
    mv Elaheh-Project-main/* . && mv Elaheh-Project-main/.* . 2>/dev/null || true
    rm -rf Elaheh-Project-main repo.zip
fi

echo -e "   > Installing Project Dependencies with pnpm..."
export NODE_OPTIONS="--max-old-space-size=4096"
rm -rf node_modules package-lock.json

if [[ "$ROLE" == "iran" ]]; then
    export SASS_BINARY_SITE=https://npmmirror.com/mirrors/node-sass
    export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
    export SHARP_BINARY_HOST=https://npmmirror.com/mirrors/sharp
    export SHARP_LIBVIPS_BINARY_HOST=https://npmmirror.com/mirrors/sharp-libvips
fi

echo "legacy-peer-deps=true" > .npmrc
if [[ "$ROLE" == "iran" ]]; then
    echo "registry=${SELECTED_REGISTRY}" >> .npmrc
    echo -e "   > Enforcing selected mirror (${SELECTED_REGISTRY}) via local .npmrc file."
fi

if pnpm install ${REGISTRY_FLAG}; then
    echo -e "${GREEN}   > pnpm install successful.${NC}"
else
    echo -e "${RED}   > pnpm install failed. Check logs.${NC}"
    exit 1
fi

pnpm add @google/genai@latest ${REGISTRY_FLAG}
pnpm run build

DIST_PATH="$INSTALL_DIR/dist/project-elaheh/browser"
if [ ! -d "$DIST_PATH" ]; then echo -e "${RED}[!] Build Failed!${NC}"; exit 1; fi

# -----------------------------------------------------------------------------
# DOMAIN & SSL CONFIGURATION
# -----------------------------------------------------------------------------

echo -e "\n${CYAN}--- FINAL STEP: DOMAIN CONFIGURATION ---${NC}"
echo -e "${YELLOW}Ensure your domain's A record points to: $(curl -s ifconfig.me)${NC}\n"
while [ -z "$DOMAIN" ]; do read -p "Enter your Domain (e.g. panel.example.com): " DOMAIN; done
EMAIL="admin@${DOMAIN}"

mkdir -p "$DIST_PATH/assets"
cat <<EOF > "$DIST_PATH/assets/server-config.json"
{"role": "${ROLE}", "key": "", "domain": "${DOMAIN}", "installedAt": "$(date)"}
EOF

echo -e "   > Configuring Nginx..."
$SUDO systemctl stop nginx >/dev/null 2>&1 || true
for P in 80 110; do PIDS=$($SUDO lsof -t -i:$P || true); if [ -n "$PIDS" ]; then $SUDO kill -9 $PIDS || true; fi; done

cat <<EOF | $SUDO tee /etc/nginx/sites-available/elaheh > /dev/null
server { listen 80; server_name ${DOMAIN} www.${DOMAIN}; root ${DIST_PATH}; location / { try_files \$uri \$uri/ /index.html; } }
EOF
$SUDO ln -sf /etc/nginx/sites-available/elaheh /etc/nginx/sites-enabled/
$SUDO systemctl start nginx

if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo -e "   > Requesting SSL Certificate (Certbot)..."
    $SUDO certbot certonly --nginx --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}" || echo -e "${RED}[!] SSL Generation failed. You can try again inside the panel.${NC}"
fi

cat <<EOF | $SUDO tee /etc/nginx/sites-available/elaheh > /dev/null
server { listen 80; server_name ${DOMAIN} www.${DOMAIN}; return 301 https://\$host\$request_uri; }
server {
    listen 443 ssl http2; server_name ${DOMAIN} www.${DOMAIN};
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem; ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    root ${DIST_PATH}; index index.html;
    location / { try_files \$uri \$uri/ /index.html; }
    location /ws { proxy_pass http://127.0.0.1:10000; proxy_http_version 1.1; proxy_set_header Upgrade \$http_upgrade; proxy_set_header Connection "upgrade"; }
}
EOF
$SUDO systemctl restart nginx

($SUDO crontab -l 2>/dev/null | grep -v "certbot renew") | $SUDO crontab - || true
($SUDO crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --deploy-hook 'systemctl reload nginx'") | $SUDO crontab -

# -----------------------------------------------------------------------------
# Finalize
# -----------------------------------------------------------------------------

echo -e "   > Starting Application with pm2..."
$SUDO pm2 delete elaheh-app 2>/dev/null || true
$SUDO pm2 serve "$DIST_PATH" ${APP_PORT:-3000} --name "elaheh-app" --spa
$SUDO pm2 save --force
$SUDO pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

echo -e "   > Configuring Firewall..."
if command -v ufw &> /dev/null; then
    $SUDO ufw allow 22/tcp >/dev/null 2>&1 && $SUDO ufw allow 80/tcp >/dev/null 2>&1 && $SUDO ufw allow 443/tcp >/dev/null 2>&1 && $SUDO ufw allow 110/tcp >/dev/null 2>&1 && $SUDO ufw allow 1414/udp >/dev/null 2>&1
    echo "y" | $SUDO ufw enable >/dev/null 2>&1
elif command -v firewall-cmd &> /dev/null; then
    $SUDO systemctl start firewalld
    $SUDO firewall-cmd --permanent --add-port=80/tcp >/dev/null 2>&1 && $SUDO firewall-cmd --permanent --add-port=443/tcp >/dev/null 2>&1 && $SUDO firewall-cmd --permanent --add-port=1414/udp >/dev/null 2>&1
    $SUDO firewall-cmd --reload >/dev/null 2>&1
fi

echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}   INSTALLATION SUCCESSFUL!${NC}"
echo -e "   Role: ${ROLE^^}"
echo -e "   Panel URL: https://${DOMAIN}"
echo -e "${GREEN}=========================================${NC}"
