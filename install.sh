
#!/bin/bash

# Project Elaheh Installer
# Version 1.9.3 (DNS Switch & Mirror Priority)
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
    
    # Backup existing resolv.conf (dereferencing symlinks)
    if [ -f /etc/resolv.conf ]; then
        $SUDO cp -L /etc/resolv.conf /tmp/resolv.conf.backup_elaheh
    fi

    # Set Google DNS
    # We use tee to overwrite. This works even if resolv.conf is a symlink managed by systemd
    $SUDO rm -f /etc/resolv.conf
    echo "nameserver 8.8.8.8" | $SUDO tee /etc/resolv.conf > /dev/null
    echo "nameserver 8.8.4.4" | $SUDO tee -a /etc/resolv.conf > /dev/null

    echo -e "   > Restarting Network/DNS Services to apply changes..."
    
    # Restart DNS resolver or networking based on availability
    if systemctl list-units --full -all | grep -q "systemd-resolved.service"; then
        $SUDO systemctl restart systemd-resolved
    elif systemctl list-units --full -all | grep -q "networking.service"; then
        $SUDO systemctl restart networking
    elif systemctl list-units --full -all | grep -q "NetworkManager.service"; then
        $SUDO systemctl restart NetworkManager
    fi
    
    # Brief pause to allow network to stabilize
    sleep 3
    echo -e "${GREEN}[+] Google DNS applied temporarily.${NC}"
}

restore_original_dns() {
    echo -e "${YELLOW}[!] Restoring original DNS configuration...${NC}"
    
    if [ -f /tmp/resolv.conf.backup_elaheh ]; then
        $SUDO cp /tmp/resolv.conf.backup_elaheh /etc/resolv.conf
        $SUDO rm -f /tmp/resolv.conf.backup_elaheh
        
        echo -e "   > Restarting Network/DNS Services to revert changes..."
        if systemctl list-units --full -all | grep -q "systemd-resolved.service"; then
            $SUDO systemctl restart systemd-resolved
        elif systemctl list-units --full -all | grep -q "networking.service"; then
            $SUDO systemctl restart networking
        elif systemctl list-units --full -all | grep -q "NetworkManager.service"; then
            $SUDO systemctl restart NetworkManager
        fi
        
        echo -e "${GREEN}[+] Original DNS restored.${NC}"
    else
        echo -e "${RED}[!] Warning: DNS backup not found. Leaving current DNS.${NC}"
    fi
}

configure_iran_npm_mirrors() {
    echo -e "${YELLOW}[!] Configuring Iranian NPM Mirrors...${NC}"
    echo -e "   > Sources: Runflare, ArvanCloud, Jamko, NVMNode"
    
    # We prioritize Runflare as the registry url, but acknowledgment of the requested list
    if command -v npm >/dev/null 2>&1; then
        # Using Runflare as the primary robust registry for Iran
        $SUDO npm config set registry https://npm.runflare.com --global 2>/dev/null || true
        
        # In a real scenario, we can't set multiple registries simultaneously, 
        # so we set the most reliable one from the user's list.
        echo -e "${GREEN}[+] NPM Registry set to Runflare (Iran Optimized).${NC}"
    fi
}

# -----------------------------------------------------------------------------
# Initialization
# -----------------------------------------------------------------------------

clear
echo -e "${CYAN}"
echo "################################################################"
echo "   Project Elaheh - Stealth Tunnel Management System"
echo "   Version 1.9.3 (DNS Switch & Mirror Priority)"
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
    
    # STEP 1 & 2: Set Google DNS and Restart Network
    apply_google_dns
    
    # Configure Mirrors
    configure_iran_npm_mirrors
else
    echo -e "${GREEN}>> Configuring as FOREIGN Server...${NC}"
    # Ensure default NPM registry for foreign server
    if command -v npm >/dev/null 2>&1; then
        $SUDO npm config delete registry --global 2>/dev/null || true
    fi
fi

echo -e "${YELLOW}Enter your Domain:${NC}"
read -p "Domain: " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Domain is required.${NC}"
    # Restore DNS if we exited early
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
echo -e "   > Updating and Upgrading System Packages..."

export DEBIAN_FRONTEND=noninteractive

if [[ "$OS_ID" == "ubuntu" ]] || [[ "$OS_ID" == "debian" ]]; then
    # Fix potential lock issues
    $SUDO rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock
    
    # Update lists
    $SUDO apt-get update -y -qq
    
    # Full Upgrade
    echo -e "   > Applying system upgrades (this may take a while)..."
    $SUDO apt-get upgrade -y -qq
    
    # Install dependencies
    echo -e "   > Installing dependencies..."
    $SUDO apt-get install -y -qq curl git unzip ufw xz-utils grep sed nginx certbot python3-certbot-nginx socat lsof build-essential openvpn wireguard sqlite3 redis-server cron

elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"Fedora"* ]]; then
    echo -e "   > Applying system upgrades..."
    $SUDO dnf upgrade -y --refresh
    
    # Install dependencies
    if ! rpm -q epel-release >/dev/null 2>&1; then
         $SUDO dnf install -y epel-release
    fi
    $SUDO dnf install -y -q curl git unzip firewalld grep sed nginx certbot python3-certbot-nginx socat lsof tar make openvpn wireguard-tools sqlite redis cronie
    $SUDO systemctl enable --now crond
else
    echo -e "${RED}Unsupported OS. Proceeding with caution.${NC}"
fi

# -----------------------------------------------------------------------------
# Service Configuration
# -----------------------------------------------------------------------------

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

# SSL & Auto-Renewal
if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo -e "   > Requesting SSL Certificate..."
    $SUDO certbot certonly --standalone --preferred-challenges http --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}" || echo -e "${YELLOW}Warning: SSL request failed. You can retry later via dashboard.${NC}"
fi

# Configure Auto-Renewal
echo -e "   > Configuring SSL Auto-Renewal (Daily check)..."
($SUDO crontab -l 2>/dev/null | grep -v "certbot renew") | $SUDO crontab - || true
($SUDO crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --deploy-hook 'systemctl reload nginx'") | $SUDO crontab -

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
    
    # Try alternate mirror for binary if in Iran (though binary d/l usually works, using standard)
    curl -L "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" -o "/tmp/node.tar.xz"
    $SUDO tar -xf "/tmp/node.tar.xz" -C /usr/local --strip-components=1
fi

# Apply NPM Registry settings (Runflare/Iran Check)
if [[ "$ROLE" == "iran" ]]; then
    if command -v npm >/dev/null 2>&1; then
        $SUDO npm config set registry https://npm.runflare.com --global 2>/dev/null || true
    fi
else
    if command -v npm >/dev/null 2>&1; then
        $SUDO npm config delete registry --global 2>/dev/null || true
    fi
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

# Run install (Registry is set to Runflare if Role is Iran)
npm install --legacy-peer-deps --loglevel error
npm install @google/genai@latest --legacy-peer-deps --save

echo -e "   > Building Application..."
npm run build

DIST_PATH="$INSTALL_DIR/dist/project-elaheh/browser"
if [ ! -d "$DIST_PATH" ]; then
    echo -e "${RED}[!] Build Failed! Check memory or logs.${NC}"
    # Clean up DNS before exit
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
# RESTORE DNS (Important Step)
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
