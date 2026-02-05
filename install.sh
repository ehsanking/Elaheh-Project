
#!/bin/bash

# Project Elaheh Installer
# Version 1.1.0 (Stability Edition)
# Author: EHSANKiNG

set -e

# Colors
GREEN='\033[1;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# -----------------------------------------------------------------------------
# Helper Functions
# -----------------------------------------------------------------------------

# Loading Spinner
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

# Progress Bar
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

# DNS Restoration Logic
restore_dns() {
    if [ -f /etc/resolv.conf.bak ]; then
        echo ""
        echo -e "${YELLOW}[!] Restoring original DNS settings...${NC}"
        
        # Use SUDO if defined
        if [ "$EUID" -ne 0 ] && command -v sudo >/dev/null 2>&1; then
             sudo rm -f /etc/resolv.conf
             sudo mv /etc/resolv.conf.bak /etc/resolv.conf
        else
             rm -f /etc/resolv.conf
             mv /etc/resolv.conf.bak /etc/resolv.conf
        fi
        echo -e "${GREEN}[+] Original DNS restored.${NC}"
    fi
}

# Ensure DNS is restored on exit (success or failure)
trap restore_dns EXIT

# -----------------------------------------------------------------------------
# Initialization
# -----------------------------------------------------------------------------

clear
echo -e "${CYAN}"
echo "################################################################"
echo "   Project Elaheh - Stealth Tunnel Management System"
echo "   Version 1.1.0"
echo "   'Secure. Fast. Uncensored.'"
echo "################################################################"
echo -e "${NC}"

# Check root & Sudo Config
SUDO=""
if [ "$EUID" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    echo -e "${YELLOW}[!] Not running as root. Running commands with 'sudo'...${NC}"
    SUDO="sudo"
  else
    echo -e "${RED}Error: This script requires root privileges. Please run as root or install sudo.${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}[+] Running as root.${NC}"
fi

# Get current user details for file ownership
CURRENT_USER=$(id -un)
CURRENT_GROUP=$(id -gn)

# Fix Hostname Resolution (Prevents "sudo: unable to resolve host" delay)
HOSTNAME=$(hostname)
if ! grep -q "127.0.0.1.*$HOSTNAME" /etc/hosts; then
    echo "127.0.0.1 $HOSTNAME" | $SUDO tee -a /etc/hosts > /dev/null
fi

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------

DOMAIN=""
EMAIL=""
ROLE=""

echo -e "${YELLOW}Select Server Location/Role:${NC}"
echo "1) Foreign Server (Upstream - Germany, Finland, etc.)"
echo "   > Functions: Relay Traffic, Generate Connection Keys."
echo "2) Iran Server (Edge - Storefront, User Access)"
echo "   > Functions: Store, Users, Database, Tunnel Client."
read -p "Select [1 or 2]: " ROLE_CHOICE

if [ "$ROLE_CHOICE" -eq 2 ]; then
    ROLE="iran"
    echo -e "${GREEN}>> Configuring as IRAN (Edge/Main) Server...${NC}"
    
    # -------------------------------------------------------------------------
    # Anti-Sanction DNS Setup (Iran Only)
    # -------------------------------------------------------------------------
    echo -e "${YELLOW}[!] Configuring Anti-Sanction DNS (Shecan/403) for installation...${NC}"
    
    # Backup existing
    if [ -f /etc/resolv.conf ]; then
        $SUDO cp /etc/resolv.conf /etc/resolv.conf.bak
    fi
    
    # Overwrite with specific nameservers requested
    $SUDO rm -f /etc/resolv.conf
    cat <<EOF | $SUDO tee /etc/resolv.conf > /dev/null
nameserver 178.22.122.100
nameserver 185.51.200.2
nameserver 172.29.2.100
nameserver 172.29.0.100
options timeout:2 attempts:1
EOF
    echo -e "${GREEN}[+] Temporary DNS applied successfully.${NC}"

else
    ROLE="external"
    echo -e "${GREEN}>> Configuring as FOREIGN (Upstream) Server...${NC}"
fi

while [ "$#" -gt 0 ]; do
  case "$1" in
    --domain) DOMAIN="$2"; shift 2;;
    --email) EMAIL="$2"; shift 2;;
    --key) KEY="$2"; shift 2;;
    *) shift 1;;
  esac
done

if [ -z "$DOMAIN" ]; then
    echo -e "${YELLOW}Enter your Domain (A record must point to this IP):${NC}"
    read -p "Domain: " DOMAIN
fi

if [ -z "$EMAIL" ]; then
    EMAIL="admin@${DOMAIN}"
fi

echo ""
echo -e "${CYAN}Starting Installation Process...${NC}"
show_progress 5 "Detecting OS..."

# -----------------------------------------------------------------------------
# System Preparation
# -----------------------------------------------------------------------------

if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
fi

install_deps() {
    export DEBIAN_FRONTEND=noninteractive
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        $SUDO rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock
        $SUDO apt-get update -y -qq >/dev/null 2>&1
        $SUDO apt-get install -y -qq curl git unzip ufw xz-utils grep sed nginx certbot python3-certbot-nginx socat lsof build-essential openvpn wireguard sqlite3 redis-server >/dev/null 2>&1
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"Fedora"* ]] || [[ "$OS" == *"AlmaLinux"* ]]; then
        $SUDO dnf upgrade -y --refresh >/dev/null 2>&1
        # Enable EPEL for Rocky/CentOS if needed
        if ! rpm -q epel-release >/dev/null 2>&1; then
             $SUDO dnf install -y epel-release >/dev/null 2>&1
        fi
        $SUDO dnf install -y -q curl git unzip firewalld grep sed nginx certbot python3-certbot-nginx socat lsof tar make openvpn wireguard-tools sqlite redis >/dev/null 2>&1
    else
        echo -e "${RED}Unsupported OS: $OS${NC}"
        exit 1
    fi
}

show_progress 10 "Updating System & Installing Dependencies..."
install_deps & 
spinner $!

# Enable Redis
show_progress 20 "Starting Services..."
$SUDO systemctl enable --now redis-server >/dev/null 2>&1 || $SUDO systemctl enable --now redis >/dev/null 2>&1

# Swap Setup
show_progress 25 "Checking Memory..."
TOTAL_MEM=$(grep MemTotal /proc/meminfo | awk '{print $2}')
if [ "$TOTAL_MEM" -lt 2000000 ]; then
    if [ ! -f /swapfile ]; then
        $SUDO fallocate -l 2G /swapfile
        $SUDO chmod 600 /swapfile
        $SUDO mkswap /swapfile >/dev/null 2>&1
        $SUDO swapon /swapfile
        echo '/swapfile none swap sw 0 0' | $SUDO tee -a /etc/fstab > /dev/null
    fi
fi

# Cleanup Ports (Fixed lsof syntax)
show_progress 30 "Releasing Ports..."
$SUDO systemctl stop nginx >/dev/null 2>&1 || true
for PORT in 80 110; do
    # Simply check for usage without specific state flags to be compatible with older lsof
    PIDS=$($SUDO lsof -t -i:$PORT || true)
    if [ -n "$PIDS" ]; then $SUDO kill -9 $PIDS || true; fi
done
PIDS_UDP=$($SUDO lsof -t -i:1414 || true)
if [ -n "$PIDS_UDP" ]; then $SUDO kill -9 $PIDS_UDP || true; fi

# SSL
show_progress 40 "Configuring SSL (Certbot)..."
if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    $SUDO certbot certonly --standalone --preferred-challenges http --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}" >/dev/null 2>&1 || true
fi

# Nginx Config
show_progress 50 "Configuring Nginx..."
APP_PORT=3000
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
show_progress 60 "Installing Node.js..."
NODE_VERSION="v22.12.0"
if ! command -v node &> /dev/null || [[ $(node -v) != "v22.12.0" ]]; then
    MACHINE_ARCH=$(uname -m)
    if [ "${MACHINE_ARCH}" == "x86_64" ]; then NODE_ARCH="x64"; else NODE_ARCH="arm64"; fi
    curl -L "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" -o "/tmp/node.tar.xz" >/dev/null 2>&1
    $SUDO tar -xf "/tmp/node.tar.xz" -C /usr/local --strip-components=1
fi
$SUDO npm install -g pm2 @angular/cli >/dev/null 2>&1 || true

# -----------------------------------------------------------------------------
# Project Setup
# -----------------------------------------------------------------------------

INSTALL_DIR="/opt/elaheh-project"
show_progress 70 "Cloning Repository..."

# Prevent Git from asking for credentials
export GIT_TERMINAL_PROMPT=0

# Retry loop for git clone
clone_repo() {
    local max_retries=3
    local count=0
    local success=false
    
    if [ ! -d "$INSTALL_DIR" ]; then
        $SUDO mkdir -p "$INSTALL_DIR"
        $SUDO chown -R $CURRENT_USER:$CURRENT_GROUP "$INSTALL_DIR"
        cd "$INSTALL_DIR"
        
        while [ $count -lt $max_retries ]; do
            echo "   > Attempting clone ($((count+1))/$max_retries)..."
            if git clone "https://github.com/ehsanking/Elaheh-Project.git" . >/dev/null 2>&1; then
                success=true
                break
            fi
            count=$((count+1))
            sleep 2
        done
    else
        $SUDO chown -R $CURRENT_USER:$CURRENT_GROUP "$INSTALL_DIR"
        cd "$INSTALL_DIR"
        git reset --hard >/dev/null 2>&1
        
        while [ $count -lt $max_retries ]; do
            echo "   > Attempting pull ($((count+1))/$max_retries)..."
            if git pull origin main >/dev/null 2>&1; then
                success=true
                break
            fi
            count=$((count+1))
            sleep 2
        done
    fi
    
    if [ "$success" = false ]; then
        echo -e "${RED}Error: Failed to clone/update repository after $max_retries attempts. Check network.${NC}"
        exit 1
    fi
}

clone_repo

show_progress 80 "Installing NPM Packages..."
# Retry loop for npm install
install_npm() {
    local max_retries=3
    local count=0
    
    while [ $count -lt $max_retries ]; do
        if npm install --legacy-peer-deps --loglevel error >/dev/null 2>&1; then
            return 0
        fi
        echo "   > NPM Install failed, retrying..."
        count=$((count+1))
        sleep 2
    done
    return 1
}

install_npm &
spinner $!

# Install GenAI SDK if missing
npm install @google/genai@latest --legacy-peer-deps --save >/dev/null 2>&1

show_progress 90 "Building Application..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build >/dev/null 2>&1 &
spinner $!

DIST_PATH="$INSTALL_DIR/dist/project-elaheh/browser"
if [ ! -d "$DIST_PATH" ]; then
    echo -e "${RED}[!] Build Failed! Check memory or logs.${NC}"
    exit 1
fi

mkdir -p "$DIST_PATH/assets"
cat <<EOF > "$DIST_PATH/assets/server-config.json"
{
  "role": "${ROLE}",
  "key": "${KEY}",
  "domain": "${DOMAIN}",
  "installedAt": "$(date)"
}
EOF

# Finalize
show_progress 95 "Starting PM2 Processes..."
$SUDO pm2 delete elaheh-app 2>/dev/null || true
$SUDO pm2 serve "$DIST_PATH" ${APP_PORT} --name "elaheh-app" --spa >/dev/null 2>&1
$SUDO pm2 save --force >/dev/null 2>&1
$SUDO pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# Firewall
show_progress 98 "Configuring Firewall..."
if command -v ufw &> /dev/null; then
    $SUDO ufw allow 22/tcp >/dev/null 2>&1
    $SUDO ufw allow 80/tcp >/dev/null 2>&1
    $SUDO ufw allow 443/tcp >/dev/null 2>&1
    $SUDO ufw allow 110/tcp >/dev/null 2>&1
    $SUDO ufw allow 1414/udp >/dev/null 2>&1
    # Cloudflare Ports
    for p in 8080 8000 8880 2053 2083 2096 8443; do $SUDO ufw allow $p/tcp >/dev/null 2>&1; done
    echo "y" | $SUDO ufw enable >/dev/null 2>&1
elif command -v firewall-cmd &> /dev/null; then
    $SUDO systemctl start firewalld
    for p in 22 80 443 110 8080 2096 8443 2053; do $SUDO firewall-cmd --permanent --add-port=$p/tcp >/dev/null 2>&1; done
    $SUDO firewall-cmd --permanent --add-port=1414/udp >/dev/null 2>&1
    $SUDO firewall-cmd --reload >/dev/null 2>&1
fi

show_progress 100 "Installation Complete!"
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   INSTALLATION SUCCESSFUL!${NC}"
echo -e "   Role: ${ROLE^^}"
echo -e "   Panel URL: https://${DOMAIN}"
echo -e "${GREEN}=========================================${NC}"
