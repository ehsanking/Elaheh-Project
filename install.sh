#!/bin/bash

# Project Elaheh - Ultimate Installer (Iran/Sanction Optimized)
# Version 4.0.0 (Stability Release)
# Author: EHSANKiNG

set -e

# --- UI Colors ---
GREEN='\033[1;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# --- Helper Functions ---
spinner() {
    local pid=$1
    local msg=$2
    local delay=0.1
    local spinstr='|/-\'
    printf "${CYAN}%s${NC}" "$msg"
    while ps -p $pid > /dev/null; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "\b\b\b\b\b\b"
    wait $pid
    local exitcode=$?
    if [ $exitcode -eq 0 ]; then
        printf "${GREEN} [✔ Done]${NC}\n"
    else
        printf "${RED} [✖ Failed]${NC}\n"
        # We don't exit here to allow failover logic in main script
    fi
    return $exitcode
}

check_command() {
    command -v "$1" >/dev/null 2>&1
}

# --- Initialization ---
clear
echo -e "${CYAN}"
echo "################################################################"
echo "   Project Elaheh - Anti-Censorship Tunnel Manager"
echo "   Version 4.0.0 (Optimized for Iran Infrastructure)"
echo "   'Breaking the Silence.'"
echo "################################################################"
echo -e "${NC}"

# Root Check
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Please run as root (sudo).${NC}"
    exit 1
fi

# OS Detection
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
else
    echo -e "${RED}Error: Cannot detect OS.${NC}"
    exit 1
fi

# --- User Input ---
echo -e "${YELLOW}Select Server Role:${NC}"
echo "1) Foreign Server (Upstream)"
echo "2) Iran Server (Edge)"
read -p "Select [1 or 2]: " ROLE_CHOICE

if [[ "$ROLE_CHOICE" == *"2"* || "$ROLE_CHOICE" == *"۲"* ]]; then
    ROLE="iran"
    echo -e "${GREEN}>> Role: IRAN (Edge)${NC}"
else
    ROLE="external"
    echo -e "${GREEN}>> Role: FOREIGN (Upstream)${NC}"
fi

# Get Domain immediately
PUBLIC_IP=$(curl -s --max-time 5 https://api.ipify.org || curl -s --max-time 5 ifconfig.me)
echo -e "\n${YELLOW}Public IP Detected: ${CYAN}${PUBLIC_IP}${NC}"
read -p "Enter your Domain (A record must point to IP): " DOMAIN
if [ -z "$DOMAIN" ]; then DOMAIN="localhost"; fi

# --- STEP 1: Smart Package Installation ---
echo -e "\n${GREEN}--- STEP 1: SYSTEM PACKAGES & DEPENDENCIES ---${NC}"

install_pkg_apt() {
    PKG=$1
    if dpkg -l | grep -q "^ii  $PKG "; then
        echo -e "${GREEN}   > $PKG is already installed. Checking for updates...${NC}"
        # Optional: apt-get install --only-upgrade -y $PKG >/dev/null 2>&1
    else
        echo -e "${CYAN}   > Installing $PKG...${NC}"
        apt-get install -y -qq $PKG >/dev/null 2>&1
    fi
}

install_pkg_dnf() {
    PKG=$1
    if rpm -q $PKG >/dev/null 2>&1; then
        echo -e "${GREEN}   > $PKG is already installed.${NC}"
    else
        echo -e "${CYAN}   > Installing $PKG...${NC}"
        dnf install -y -q $PKG >/dev/null 2>&1
    fi
}

prepare_system() {
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt-get update -y -qq >/dev/null 2>&1
        local DEPS=("curl" "git" "unzip" "ufw" "nginx" "certbot" "python3-certbot-nginx" "socat" "redis-server")
        for dep in "${DEPS[@]}"; do install_pkg_apt "$dep"; done
        systemctl enable --now redis-server >/dev/null 2>&1
    elif [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        dnf check-update >/dev/null 2>&1 || true
        local DEPS=("curl" "git" "unzip" "firewalld" "nginx" "certbot" "python3-certbot-nginx" "socat" "redis")
        for dep in "${DEPS[@]}"; do install_pkg_dnf "$dep"; done
        systemctl enable --now redis >/dev/null 2>&1
    fi
}
(prepare_system) &
spinner $! "   > Verifying and installing base packages..."

# --- STEP 2: Node.js (Sanction Bypass Strategy) ---
echo -e "\n${GREEN}--- STEP 2: NODE.JS & NPM CONFIGURATION ---${NC}"

install_node() {
    # Check if Node exists and version is sufficient (v18+)
    if check_command node; then
        NODE_V=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_V" -ge 18 ]; then
            echo -e "${GREEN}   > Node.js ($NODE_V) is already installed.${NC}"
            return
        fi
    fi

    echo -e "${CYAN}   > Installing Node.js v20 (LTS)...${NC}"
    # Using NodeSource which usually has good mirrors, or fallback to direct binary if apt fails
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
        apt-get install -y nodejs >/dev/null 2>&1
    elif [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
        dnf install -y nodejs >/dev/null 2>&1
    fi
}
(install_node) &
spinner $! "   > Configuring Node.js environment..."

# Configure NPM Mirror to bypass sanctions
echo -e "${CYAN}   > Configuring NPM registry mirror (Anti-Sanction)...${NC}"
npm config set registry https://registry.npmmirror.com >/dev/null 2>&1

install_globals() {
    local TOOLS=("pm2" "@angular/cli")
    for tool in "${TOOLS[@]}"; do
        if ! command -v $tool >/dev/null 2>&1; then
             npm install -g $tool >/dev/null 2>&1
        fi
    done
}
(install_globals) &
spinner $! "   > Checking/Installing global tools (pm2, angular-cli)..."

# --- STEP 3: Project Setup ---
echo -e "\n${GREEN}--- STEP 3: BUILDING APPLICATION ---${NC}"
INSTALL_DIR="/opt/elaheh-project"

setup_project() {
    rm -rf "$INSTALL_DIR"
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    # Clone
    git clone --quiet --depth 1 "https://github.com/ehsanking/Elaheh-Project.git" .
    
    # Install Deps (using the mirror set previously)
    npm install --legacy-peer-deps --loglevel=error
    
    # Build
    npm run build
}
(setup_project) >/dev/null 2>&1 &
spinner $! "   > Cloning and Compiling (this may take a moment)..."

DIST_PATH="$INSTALL_DIR/dist/project-elaheh/browser"
if [ ! -d "$DIST_PATH" ]; then
    echo -e "${RED}Critical Error: Build failed. Check Node/NPM logs.${NC}"
    exit 1
fi

# Server Config Asset
mkdir -p "$DIST_PATH/assets"
echo "{\"role\": \"${ROLE}\", \"domain\": \"${DOMAIN}\", \"installedAt\": \"$(date)\"}" > "$DIST_PATH/assets/server-config.json"

# --- STEP 4: Nginx & SSL (The Critical Part) ---
echo -e "\n${GREEN}--- STEP 4: WEBSERVER & SSL ---${NC}"

# Stop Nginx to free port 80 for Certbot
systemctl stop nginx >/dev/null 2>&1 || true

SSL_KEY=""
SSL_CERT=""
USE_SELF_SIGNED=0

attempt_certbot() {
    echo -e "${CYAN}   > Attempting to obtain valid SSL from Let's Encrypt...${NC}"
    if certbot certonly --standalone --preferred-challenges http --non-interactive --agree-tos -m "admin@${DOMAIN}" -d "${DOMAIN}" >/dev/null 2>&1; then
        SSL_KEY="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"
        SSL_CERT="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
        return 0
    else
        return 1
    fi
}

if attempt_certbot; then
    echo -e "${GREEN}   > Valid SSL Certificate obtained!${NC}"
else
    echo -e "${YELLOW}   > Let's Encrypt failed (likely due to Iran filtering).${NC}"
    echo -e "${CYAN}   > Generating Self-Signed SSL (Fallback Strategy)...${NC}"
    
    SELF_DIR="/etc/nginx/ssl"
    mkdir -p $SELF_DIR
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SELF_DIR/selfsigned.key" \
        -out "$SELF_DIR/selfsigned.crt" \
        -subj "/C=IR/ST=Tehran/L=Tehran/O=Elaheh/OU=IT/CN=${DOMAIN}" >/dev/null 2>&1
    
    SSL_KEY="$SELF_DIR/selfsigned.key"
    SSL_CERT="$SELF_DIR/selfsigned.crt"
    USE_SELF_SIGNED=1
fi

# Write Nginx Config
cat <<EOF > /etc/nginx/sites-available/elaheh
server {
    listen 80;
    server_name ${DOMAIN} ${PUBLIC_IP};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} ${PUBLIC_IP};

    ssl_certificate ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};

    # Hardening
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    root ${DIST_PATH};
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
    
    # API Proxy (Example for future backend)
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }
}
EOF

# Link and Restart
ln -sf /etc/nginx/sites-available/elaheh /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx
echo -e "${GREEN}   > Nginx configured and started.${NC}"

# --- STEP 5: Firewall & PM2 ---
echo -e "\n${GREEN}--- STEP 5: FINALIZING ---${NC}"

setup_firewall() {
    if command -v ufw >/dev/null 2>&1; then
        ufw allow 22/tcp >/dev/null 2>&1
        ufw allow 80/tcp >/dev/null 2>&1
        ufw allow 443/tcp >/dev/null 2>&1
        # Tunnel Ports
        ufw allow 110/tcp >/dev/null 2>&1
        ufw allow 510/tcp >/dev/null 2>&1
        ufw allow 1414/udp >/dev/null 2>&1
        ufw allow 53133/udp >/dev/null 2>&1
        echo "y" | ufw enable >/dev/null 2>&1
    elif command -v firewall-cmd >/dev/null 2>&1; then
        systemctl start firewalld
        firewall-cmd --permanent --add-service=http >/dev/null 2>&1
        firewall-cmd --permanent --add-service=https >/dev/null 2>&1
        firewall-cmd --permanent --add-port=110/tcp >/dev/null 2>&1
        firewall-cmd --permanent --add-port=510/tcp >/dev/null 2>&1
        firewall-cmd --permanent --add-port=1414/udp >/dev/null 2>&1
        firewall-cmd --permanent --add-port=53133/udp >/dev/null 2>&1
        firewall-cmd --reload >/dev/null 2>&1
    fi
}
(setup_firewall) &
spinner $! "   > Configuring Firewall (UFW/Firewalld)..."

# Serve using Nginx is enough for static build, 
# But if we had a node backend, we would start it here with PM2.
# Ensuring PM2 startup for future backend modules
pm2 startup >/dev/null 2>&1 || true
pm2 save >/dev/null 2>&1 || true

echo ""
echo -e "${GREEN}==============================================${NC}"
echo -e "${GREEN}          INSTALLATION SUCCESSFUL!${NC}"
echo -e "          Role: ${ROLE^^}"
echo -e "          Panel Address: https://${DOMAIN}"
if [ "$USE_SELF_SIGNED" -eq 1 ]; then
    echo -e "${YELLOW}          [!] Note: Using Self-Signed SSL.${NC}"
    echo -e "${YELLOW}          Your browser will show a security warning.${NC}"
    echo -e "${YELLOW}          Click 'Advanced' -> 'Proceed to ${DOMAIN}' to access.${NC}"
fi
echo -e "${YELLOW}          Login: admin / admin${NC}"
echo -e "${GREEN}==============================================${NC}"
exit 0