
#!/bin/bash

# Project Elaheh Installer
# Version 1.2.0 (Self-Healing Network Edition)
# Author: EHSANKiNG

# -----------------------------------------------------------------------------
# Configuration & Lists
# -----------------------------------------------------------------------------

# DNS Servers to try (Priority Order)
DNS_SERVERS=(
    "178.22.122.100"  # Shecan
    "185.51.200.2"    # Shecan
    "172.29.2.100"    # 403
    "10.139.177.21"
    "185.55.226.26"
    "172.16.1.100"
    "194.104.158.48"
    "85.15.1.15"
    "1.1.1.1"         # Cloudflare (Fallback)
)

# Colors
GREEN='\033[1;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# State
CURRENT_DNS_INDEX=0
INSTALL_SUCCESS=false

# -----------------------------------------------------------------------------
# Core Networking Functions
# -----------------------------------------------------------------------------

# Apply a specific DNS IP
set_dns() {
    local ip=$1
    if [ "$EUID" -ne 0 ] && command -v sudo >/dev/null 2>&1; then
        echo "nameserver $ip" | sudo tee /etc/resolv.conf > /dev/null
        echo "options timeout:2 attempts:1" | sudo tee -a /etc/resolv.conf > /dev/null
    else
        echo "nameserver $ip" > /etc/resolv.conf
        echo "options timeout:2 attempts:1" >> /etc/resolv.conf
    fi
}

# Test connection to critical services
check_connection() {
    # Try GitHub first, then NPM registry
    if curl --connect-timeout 3 -sI https://github.com >/dev/null 2>&1; then
        return 0
    fi
    if curl --connect-timeout 3 -sI https://registry.npmjs.org >/dev/null 2>&1; then
        return 0
    fi
    return 1
}

# Loop through DNS list until one works
find_working_dns() {
    echo -e "${YELLOW}[Network] Connection lost or unstable. Searching for a working DNS...${NC}"
    
    local found=false
    
    for dns in "${DNS_SERVERS[@]}"; do
        echo -ne "   > Testing DNS: ${CYAN}$dns${NC} ... "
        set_dns "$dns"
        
        if check_connection; then
            echo -e "${GREEN}CONNECTED${NC}"
            found=true
            break
        else
            echo -e "${RED}FAILED${NC}"
        fi
    done
    
    if [ "$found" = false ]; then
        echo -e "${RED}[!] Critical Error: No working DNS found in the list.${NC}"
        echo -e "${YELLOW}[!] Retrying the list in 5 seconds...${NC}"
        sleep 5
        find_working_dns # Recursive retry (Infinite loop until fixed)
    fi
}

# Wrapper to run commands with auto-resume and DNS switching
run_robust() {
    local cmd="$1"
    local description="$2"
    local max_retries=100 # Effectively infinite retry until success
    local attempt=1
    
    echo -e "${CYAN}>> $description${NC}"
    
    while [ $attempt -le $max_retries ]; do
        # Try running the command
        set +e # Temporarily allow failure
        eval "$cmd"
        local status=$?
        set -e
        
        if [ $status -eq 0 ]; then
            return 0 # Success
        else
            echo -e "${RED}[!] Command failed (Exit Code: $status).${NC}"
            echo -e "${YELLOW}[!] Pausing download/process to switch DNS...${NC}"
            
            # Find a new DNS
            find_working_dns
            
            echo -e "${GREEN}[+] New DNS set. Resuming process...${NC}"
            attempt=$((attempt+1))
        fi
    done
    
    echo -e "${RED}[!] Fatal: Failed to complete '$description' after many attempts.${NC}"
    exit 1
}

# -----------------------------------------------------------------------------
# UI Functions
# -----------------------------------------------------------------------------

spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while ps -p $pid > /dev/null 2>&1; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

show_progress() {
    local width=40
    local percent=$1
    local info="$2"
    local num_filled=$(( width * percent / 100 ))
    local num_empty=$(( width - num_filled ))
    printf "\r["
    printf "%0.s#" $(seq 1 $num_filled)
    printf "%0.s " $(seq 1 $num_empty)
    printf "] %3d%% - %s" "$percent" "$info"
}

# -----------------------------------------------------------------------------
# Initialization
# -----------------------------------------------------------------------------

cleanup_on_exit() {
    if [ "$INSTALL_SUCCESS" = true ]; then
        echo ""
        echo -e "${GREEN}[+] Installation Completed Successfully.${NC}"
        echo -e "${YELLOW}[!] Setting final DNS to Google (8.8.8.8)...${NC}"
        set_dns "8.8.8.8"
        
        echo -e "${YELLOW}[!] Removing installer script...${NC}"
        rm -- "$0"
    else
        echo ""
        echo -e "${RED}[!] Installation Failed or Interrupted.${NC}"
        # We generally leave the last working DNS set so the user can debug
    fi
}
trap cleanup_on_exit EXIT

clear
echo -e "${CYAN}"
echo "################################################################"
echo "   Project Elaheh - Stealth Tunnel Management System"
echo "   Version 1.2.0 (Self-Healing Network Edition)"
echo "   'Secure. Fast. Uncensored.'"
echo "################################################################"
echo -e "${NC}"

# Sudo Check
SUDO=""
if [ "$EUID" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    echo -e "${RED}Error: Root privileges required.${NC}"
    exit 1
  fi
fi

# Hostname Resolution Fix
HOSTNAME=$(hostname)
if ! grep -q "127.0.0.1.*$HOSTNAME" /etc/hosts; then
    echo "127.0.0.1 $HOSTNAME" | $SUDO tee -a /etc/hosts > /dev/null
fi

# -----------------------------------------------------------------------------
# Role Selection
# -----------------------------------------------------------------------------

echo -e "${YELLOW}Select Server Location/Role:${NC}"
echo "1) Foreign Server (Upstream)"
echo "2) Iran Server (Edge - User Access)"
read -p "Select [1 or 2]: " ROLE_CHOICE

ROLE="external"
if [ "$ROLE_CHOICE" -eq 2 ]; then
    ROLE="iran"
    echo -e "${GREEN}>> Configuring as IRAN Server...${NC}"
    
    # Initial DNS Check for Iran
    find_working_dns
else
    echo -e "${GREEN}>> Configuring as FOREIGN Server...${NC}"
fi

# Get Domain
echo -e "${YELLOW}Enter your Domain:${NC}"
read -p "Domain: " DOMAIN
EMAIL="admin@${DOMAIN}"

# -----------------------------------------------------------------------------
# Installation Process (Using run_robust)
# -----------------------------------------------------------------------------

echo ""
echo -e "${CYAN}Starting Installation Process...${NC}"

# 1. System Updates
if [ -f /etc/os-release ]; then . /etc/os-release; OS=$NAME; fi
export DEBIAN_FRONTEND=noninteractive

UPDATE_CMD=""
INSTALL_CMD=""

if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    # Fix dpkg locks first
    $SUDO rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock
    UPDATE_CMD="$SUDO apt-get update -y -qq"
    INSTALL_CMD="$SUDO apt-get install -y -qq curl git unzip ufw xz-utils grep sed nginx certbot python3-certbot-nginx socat lsof build-essential openvpn wireguard sqlite3 redis-server"
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]]; then
    UPDATE_CMD="$SUDO dnf upgrade -y --refresh"
    INSTALL_CMD="$SUDO dnf install -y -q curl git unzip firewalld grep sed nginx certbot python3-certbot-nginx socat lsof tar make openvpn wireguard-tools sqlite redis"
fi

show_progress 10 "Updating Repositories..."
run_robust "$UPDATE_CMD" "System Update"

show_progress 20 "Installing Dependencies..."
run_robust "$INSTALL_CMD" "Installing Packages"

# 2. Setup Services
show_progress 30 "Configuring Services..."
$SUDO systemctl enable --now redis-server >/dev/null 2>&1 || $SUDO systemctl enable --now redis >/dev/null 2>&1

# 3. Swap
TOTAL_MEM=$(grep MemTotal /proc/meminfo | awk '{print $2}')
if [ "$TOTAL_MEM" -lt 2000000 ] && [ ! -f /swapfile ]; then
    $SUDO fallocate -l 2G /swapfile
    $SUDO chmod 600 /swapfile
    $SUDO mkswap /swapfile >/dev/null 2>&1
    $SUDO swapon /swapfile
    echo '/swapfile none swap sw 0 0' | $SUDO tee -a /etc/fstab > /dev/null
fi

# 4. Port Cleanup
$SUDO systemctl stop nginx >/dev/null 2>&1 || true
# Kill processes on 80/110/1414
for P in 80 110; do
    PIDS=$($SUDO lsof -t -i:$P || true)
    if [ -n "$PIDS" ]; then $SUDO kill -9 $PIDS || true; fi
done

# 5. SSL
show_progress 40 "Requesting SSL..."
# Certbot usually handles its own retries, but we wrap it just in case DNS flakes
CERT_CMD="$SUDO certbot certonly --standalone --preferred-challenges http --non-interactive --agree-tos -m ${EMAIL} -d ${DOMAIN}"
# Only run if not exists
if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    run_robust "$CERT_CMD" "Generating SSL Certificate"
fi

# 6. Nginx
show_progress 50 "Configuring Nginx..."
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
    location / { try_files \$uri \$uri/ /index.html; }
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

# 7. Node.js
show_progress 60 "Installing Node.js..."
NODE_VERSION="v22.12.0"
if ! command -v node &> /dev/null || [[ $(node -v) != "v22.12.0" ]]; then
    MACHINE_ARCH=$(uname -m)
    if [ "${MACHINE_ARCH}" == "x86_64" ]; then NODE_ARCH="x64"; else NODE_ARCH="arm64"; fi
    
    # Robust download for Node
    DOWNLOAD_NODE_CMD="curl -L https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz -o /tmp/node.tar.xz"
    run_robust "$DOWNLOAD_NODE_CMD" "Downloading Node.js"
    
    $SUDO tar -xf "/tmp/node.tar.xz" -C /usr/local --strip-components=1
fi
# Robust NPM global install
run_robust "$SUDO npm install -g pm2 @angular/cli" "Installing Global NPM Tools"

# 8. Clone & Install App
INSTALL_DIR="/opt/elaheh-project"
CURRENT_USER=$(id -un)
CURRENT_GROUP=$(id -gn)
export GIT_TERMINAL_PROMPT=0

if [ ! -d "$INSTALL_DIR" ]; then
    $SUDO mkdir -p "$INSTALL_DIR"
    $SUDO chown -R $CURRENT_USER:$CURRENT_GROUP "$INSTALL_DIR"
    show_progress 70 "Cloning Repository..."
    run_robust "git clone https://github.com/ehsanking/Elaheh-Project.git $INSTALL_DIR" "Cloning GitHub Repo"
    cd "$INSTALL_DIR"
else
    show_progress 70 "Updating Repository..."
    cd "$INSTALL_DIR"
    run_robust "git reset --hard && git pull origin main" "Updating Git Repo"
fi

show_progress 80 "Installing NPM Packages..."
# NPM install can be flaky, robust wrapper handles pauses/retries
run_robust "npm install --legacy-peer-deps --loglevel error" "NPM Install"
run_robust "npm install @google/genai@latest --legacy-peer-deps --save" "Installing GenAI SDK"

show_progress 90 "Building Application..."
export NODE_OPTIONS="--max-old-space-size=4096"
# Build is local, doesn't need network robust wrapper usually, but good practice
npm run build >/dev/null 2>&1

DIST_PATH="$INSTALL_DIR/dist/project-elaheh/browser"
if [ ! -d "$DIST_PATH" ]; then
    echo -e "${RED}[!] Build Failed! Check memory.${NC}"
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

# 9. Finalize
show_progress 95 "Starting Application..."
$SUDO pm2 delete elaheh-app 2>/dev/null || true
$SUDO pm2 serve "$DIST_PATH" ${APP_PORT} --name "elaheh-app" --spa >/dev/null 2>&1
$SUDO pm2 save --force >/dev/null 2>&1
$SUDO pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# Firewall
if command -v ufw &> /dev/null; then
    for p in 22 80 443 110 1414/udp 8080 2053 2083 2096 8443; do $SUDO ufw allow $p >/dev/null 2>&1; done
    echo "y" | $SUDO ufw enable >/dev/null 2>&1
elif command -v firewall-cmd &> /dev/null; then
    $SUDO systemctl start firewalld
    for p in 22 80 443 110 8080 2096 8443 2053; do $SUDO firewall-cmd --permanent --add-port=$p/tcp >/dev/null 2>&1; done
    $SUDO firewall-cmd --permanent --add-port=1414/udp >/dev/null 2>&1
    $SUDO firewall-cmd --reload >/dev/null 2>&1
fi

INSTALL_SUCCESS=true
show_progress 100 "Installation Complete!"
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   INSTALLATION SUCCESSFUL!${NC}"
echo -e "   Role: ${ROLE^^}"
echo -e "   Panel URL: https://${DOMAIN}"
echo -e "${GREEN}=========================================${NC}"
