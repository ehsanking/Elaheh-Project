
#!/bin/bash

# Project Elaheh Installer
# Version 1.6.0 (Anti-Sanction & Fast NPM)
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

switch_to_iran_mirrors() {
    echo -e "${YELLOW}[!] Network error detected. Switching to Iranian Mirrors...${NC}"
    
    if [ -f /etc/apt/sources.list ]; then
        # Backup original
        cp /etc/apt/sources.list /etc/apt/sources.list.backup_$(date +%s)
        
        # Replace with ir.archive.ubuntu.com
        # Using a comprehensive regex to catch archive.ubuntu.com, security.ubuntu.com, nova.clouds..., etc.
        sed -i 's|http://[a-z0-9.-]*ubuntu.com/ubuntu|http://ir.archive.ubuntu.com/ubuntu|g' /etc/apt/sources.list
        sed -i 's|https://[a-z0-9.-]*ubuntu.com/ubuntu|http://ir.archive.ubuntu.com/ubuntu|g' /etc/apt/sources.list
        
        echo -e "${GREEN}[+] Mirrors switched to ir.archive.ubuntu.com${NC}"
    fi
}

run_apt_robust() {
    local cmd="$1"
    
    # Try running directly first
    set +e
    eval "$cmd"
    local status=$?
    set -e
    
    if [ $status -ne 0 ]; then
        echo -e "${RED}[!] APT command failed (Code: $status).${NC}"
        
        # Switch mirrors
        switch_to_iran_mirrors
        
        echo -e "${CYAN}>> Retrying update with new mirrors...${NC}"
        # Update cache first after switch
        $SUDO apt-get update -y -qq || echo -e "${YELLOW}[!] Update warning (ignoring)...${NC}"
        
        # Retry the original install command
        echo -e "${CYAN}>> Retrying installation...${NC}"
        eval "$cmd"
    fi
}

# -----------------------------------------------------------------------------
# Initialization
# -----------------------------------------------------------------------------

clear
echo -e "${CYAN}"
echo "################################################################"
echo "   Project Elaheh - Stealth Tunnel Management System"
echo "   Version 1.6.0"
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
# Configuration
# -----------------------------------------------------------------------------

echo -e "${YELLOW}Select Server Location/Role:${NC}"
echo "1) Foreign Server (Upstream)"
echo "2) Iran Server (Edge - User Access)"
read -p "Select [1 or 2]: " ROLE_CHOICE

ROLE="external"
if [ "$ROLE_CHOICE" -eq 2 ]; then
    ROLE="iran"
    echo -e "${GREEN}>> Configuring as IRAN Server...${NC}"
else
    echo -e "${GREEN}>> Configuring as FOREIGN Server...${NC}"
fi

echo -e "${YELLOW}Enter your Domain:${NC}"
read -p "Domain: " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Domain is required.${NC}"
    exit 1
fi
EMAIL="admin@${DOMAIN}"

# -----------------------------------------------------------------------------
# System Preparation
# -----------------------------------------------------------------------------

echo ""
echo -e "${CYAN}Starting Installation...${NC}"

if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
fi

echo -e "   > Detecting OS: $OS"

# Install System Dependencies
echo -e "   > Installing System Packages..."
export DEBIAN_FRONTEND=noninteractive

if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    $SUDO rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock
    
    # Try standard update, fallback to Iran mirrors if failed
    UPDATE_CMD="$SUDO apt-get update -y -qq"
    run_apt_robust "$UPDATE_CMD"
    
    INSTALL_CMD="$SUDO apt-get install -y -qq curl git unzip ufw xz-utils grep sed nginx certbot python3-certbot-nginx socat lsof build-essential openvpn wireguard sqlite3 redis-server"
    run_apt_robust "$INSTALL_CMD"
    
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"Fedora"* ]]; then
    # DNF usually handles mirrors better, but we can add retry logic if needed
    $SUDO dnf upgrade -y --refresh
    if ! rpm -q epel-release >/dev/null 2>&1; then
         $SUDO dnf install -y epel-release
    fi
    $SUDO dnf install -y -q curl git unzip firewalld grep sed nginx certbot python3-certbot-nginx socat lsof tar make openvpn wireguard-tools sqlite redis
else
    echo -e "${RED}Unsupported OS. Proceeding with caution.${NC}"
fi

# Enable Services
$SUDO systemctl enable --now redis-server >/dev/null 2>&1 || $SUDO systemctl enable --now redis >/dev/null 2>&1

# Swap Setup
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

# SSL
if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo -e "   > Requesting SSL Certificate..."
    $SUDO certbot certonly --standalone --preferred-challenges http --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}" || echo -e "${YELLOW}Warning: SSL request failed. You can retry later via dashboard.${NC}"
fi

# Nginx
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

# Node.js
echo -e "   > Installing Node.js v22..."
NODE_VERSION="v22.12.0"
if ! command -v node &> /dev/null || [[ $(node -v) != "v22.12.0" ]]; then
    MACHINE_ARCH=$(uname -m)
    if [ "${MACHINE_ARCH}" == "x86_64" ]; then NODE_ARCH="x64"; else NODE_ARCH="arm64"; fi
    curl -L "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" -o "/tmp/node.tar.xz"
    $SUDO tar -xf "/tmp/node.tar.xz" -C /usr/local --strip-components=1
fi

# CRITICAL: Set NPM Mirror for Iran to bypass sanctions
echo -e "   > Configuring NPM Registry..."
npm config set registry https://registry.npmmirror.com

$SUDO npm install -g pm2 @angular/cli >/dev/null 2>&1

# -----------------------------------------------------------------------------
# Project Setup
# -----------------------------------------------------------------------------

INSTALL_DIR="/opt/elaheh-project"
CURRENT_USER=$(id -un)
CURRENT_GROUP=$(id -gn)

echo -e "   > Setting up Project..."

# Force remove directory to ensure fresh clone
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}   > Cleaning existing directory to prevent conflicts...${NC}"
    $SUDO rm -rf "$INSTALL_DIR"
fi

$SUDO mkdir -p "$INSTALL_DIR"
$SUDO chown -R $CURRENT_USER:$CURRENT_GROUP "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo -e "   > Downloading Source Code..."
# Try Git first, Fallback to ZIP download
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

echo -e "   > Installing NPM Packages..."
export NODE_OPTIONS="--max-old-space-size=4096"
# Ensure registry is set for project install as well
npm config set registry https://registry.npmmirror.com
npm install --legacy-peer-deps --loglevel error
npm install @google/genai@latest --legacy-peer-deps --save

echo -e "   > Building Application..."
npm run build

DIST_PATH="$INSTALL_DIR/dist/project-elaheh/browser"
if [ ! -d "$DIST_PATH" ]; then
    echo -e "${RED}[!] Build Failed! Check memory or logs.${NC}"
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

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   INSTALLATION SUCCESSFUL!${NC}"
echo -e "   Role: ${ROLE^^}"
echo -e "   Panel URL: https://${DOMAIN}"
echo -e "${GREEN}=========================================${NC}"
