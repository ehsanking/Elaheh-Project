#!/bin/bash

# Project Elaheh - Ultimate Installer (Iran/Sanction Optimized)
# Version 4.8.0 (ZIP-First Downloader)
# Author: EHSANKiNG

# Disable immediate exit on error to handle errors gracefully with logs
# set -e 

# --- UI Colors ---
GREEN='\033[1;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

LOG_FILE="/var/log/elaheh-install.log"
# --- Helper Functions ---
log() {
    echo "[$1] $2" >> "$LOG_FILE"
}

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
        echo -e "${RED}   ! Check log: tail -n 20 $LOG_FILE${NC}"
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
echo "   Version 4.8.0 (ZIP-First Downloader)"
echo "   'Breaking the Silence.'"
echo "################################################################"
echo -e "${NC}"

# Sudo Check
SUDO_CMD=""
RUN_USER=$(whoami)
if [ "$EUID" -ne 0 ]; then
    if command -v sudo >/dev/null 2>&1; then
        SUDO_CMD="sudo"
        echo -e "${YELLOW}This script requires root privileges for system-wide changes.${NC}"
        echo -e "${CYAN}You may be prompted for your password by 'sudo'.${NC}\n"
        # Prompt for sudo password at the beginning to cache it
        if ! $SUDO_CMD -v; then
            echo -e "${RED}Error: Failed to acquire sudo privileges.${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Error: This script must be run as root, or with 'sudo' installed.${NC}"
        exit 1
    fi
fi

# OS Detection
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
else
    echo -e "${RED}Error: Cannot detect OS.${NC}"
    exit 1
fi

$SUDO_CMD touch "$LOG_FILE"
$SUDO_CMD chmod 666 "$LOG_FILE"

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

# Get Domain
PUBLIC_IP=$(curl -s --max-time 5 https://api.ipify.org || curl -s --max-time 5 ifconfig.me)
echo -e "\n${YELLOW}Public IP Detected: ${CYAN}${PUBLIC_IP}${NC}"
read -p "Enter your Domain (A record must point to IP): " DOMAIN
if [ -z "$DOMAIN" ]; then DOMAIN="localhost"; fi

log "INFO" "Starting installation for $ROLE on $DOMAIN ($OS) by user $RUN_USER"

# --- STEP 0: SWAP CONFIGURATION (Anti-Crash) ---
echo -e "\n${GREEN}--- STEP 0: MEMORY OPTIMIZATION ---${NC}"
setup_swap() {
    # Check current swap
    SWAP_SIZE=$(free -m | grep Swap | awk '{print $2}')
    if [ "$SWAP_SIZE" -eq 0 ] || [ -z "$SWAP_SIZE" ]; then
        echo -e "${YELLOW}   > No Swap detected. Creating 2GB Swap file for build stability...${NC}"
        log "INFO" "Creating 2GB swap file"
        $SUDO_CMD fallocate -l 2G /swapfile >> "$LOG_FILE" 2>&1
        $SUDO_CMD chmod 600 /swapfile
        $SUDO_CMD mkswap /swapfile >> "$LOG_FILE" 2>&1
        $SUDO_CMD swapon /swapfile >> "$LOG_FILE" 2>&1
        if ! grep -q "/swapfile" /etc/fstab; then
            echo '/swapfile none swap sw 0 0' | $SUDO_CMD tee -a /etc/fstab > /dev/null
        fi
    else
        echo -e "${GREEN}   > Swap space detected ($SWAP_SIZE MB).${NC}"
    fi
}
(setup_swap) &
spinner $! "   > Checking/Configuring Swap Memory..."

# --- STEP 1: Smart Package Installation ---
echo -e "\n${GREEN}--- STEP 1: SYSTEM PACKAGES & DEPENDENCIES ---${NC}"

install_pkg_apt() {
    PKG=$1
    if dpkg -l | grep -q "^ii  $PKG "; then
        log "INFO" "$PKG is already installed. Skipping."
    else
        log "INFO" "Installing $PKG..."
        $SUDO_CMD apt-get install -y -qq $PKG >> "$LOG_FILE" 2>&1
    fi
}

install_pkg_dnf() {
    PKG=$1
    if rpm -q $PKG >/dev/null 2>&1; then
        log "INFO" "$PKG is already installed. Skipping."
    else
        log "INFO" "Installing $PKG..."
        $SUDO_CMD dnf install -y -q $PKG >> "$LOG_FILE" 2>&1
    fi
}

prepare_system() {
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        $SUDO_CMD apt-get update -y -qq >> "$LOG_FILE" 2>&1
        local DEPS=("curl" "git" "unzip" "ufw" "nginx" "certbot" "python3-certbot-nginx" "socat" "redis-server")
        for dep in "${DEPS[@]}"; do install_pkg_apt "$dep"; done
        $SUDO_CMD systemctl enable --now redis-server >> "$LOG_FILE" 2>&1
    elif [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        $SUDO_CMD dnf check-update >> "$LOG_FILE" 2>&1 || true
        local DEPS=("curl" "git" "unzip" "firewalld" "nginx" "certbot" "python3-certbot-nginx" "socat" "redis")
        for dep in "${DEPS[@]}"; do install_pkg_dnf "$dep"; done
        $SUDO_CMD systemctl enable --now redis >> "$LOG_FILE" 2>&1
    fi
}
(prepare_system) &
spinner $! "   > Verifying and installing base packages..."

# --- STEP 2: Node.js (Sanction Bypass Strategy) ---
echo -e "\n${GREEN}--- STEP 2: NODE.JS & NPM CONFIGURATION ---${NC}"

install_node() {
    if check_command node; then
        NODE_V=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_V" -ge 18 ]; then
            log "INFO" "Node.js v$NODE_V detected. Skipping install."
            return
        fi
    fi

    log "INFO" "Installing Node.js v20..."
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO_CMD bash - >> "$LOG_FILE" 2>&1
        $SUDO_CMD apt-get install -y nodejs >> "$LOG_FILE" 2>&1
    elif [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | $SUDO_CMD bash - >> "$LOG_FILE" 2>&1
        $SUDO_CMD dnf install -y nodejs >> "$LOG_FILE" 2>&1
    fi
}
(install_node) &
spinner $! "   > Configuring Node.js environment..."

# Configure NPM Mirror to bypass sanctions
echo -e "${CYAN}   > Configuring NPM registry mirror (Anti-Sanction)...${NC}"
npm config set registry https://registry.npmmirror.com >> "$LOG_FILE" 2>&1

install_globals() {
    local TOOLS=("pm2" "@angular/cli")
    for tool in "${TOOLS[@]}"; do
        if ! command -v $tool >/dev/null 2>&1; then
             log "INFO" "Installing global tool: $tool..."
             $SUDO_CMD npm install -g $tool >> "$LOG_FILE" 2>&1
        else
            log "INFO" "Global tool $tool already installed."
        fi
    done
}
(install_globals) &
spinner $! "   > Checking/Installing global tools..."

# --- STEP 3: Project Setup ---
echo -e "\n${GREEN}--- STEP 3: BUILDING APPLICATION ---${NC}"
INSTALL_DIR="/opt/elaheh-project"

download_source() {
    log "INFO" "Cleaning install directory $INSTALL_DIR"
    $SUDO_CMD rm -rf "$INSTALL_DIR"
    $SUDO_CMD mkdir -p "$INSTALL_DIR"
    $SUDO_CMD chown -R "$RUN_USER:$RUN_USER" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    # --- Robust Download Strategy v4 ---
    # Forcefully unset proxy environment variables for all attempts.
    unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY

    # --- Attempt 1: `curl` to download ZIP from GitHub (Primary Method) ---
    log "INFO" "Attempt 1: Downloading ZIP from GitHub..."
    if curl -s -L -o main.zip "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/main.zip" >> "$LOG_FILE" 2>&1; then
        if unzip -q main.zip && mv Elaheh-Project-main/* . && mv Elaheh-Project-main/.* . 2>/dev/null && rm -rf Elaheh-Project-main main.zip; then
            log "SUCCESS" "ZIP download from GitHub successful."
            return 0
        else
            log "ERROR" "Failed to extract ZIP from GitHub."
            rm -rf "$INSTALL_DIR"/* "$INSTALL_DIR"/.* 2>/dev/null
        fi
    fi
    log "WARN" "Attempt 1 (GitHub ZIP) failed. Falling back to mirror."

    # --- Attempt 2: `curl` to download ZIP from a mirror ---
    log "INFO" "Attempt 2: Downloading ZIP from mirror (ghproxy.com)..."
    if curl -s -L -o main.zip "https://ghproxy.com/https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/main.zip" >> "$LOG_FILE" 2>&1; then
        if unzip -q main.zip && mv Elaheh-Project-main/* . && mv Elaheh-Project-main/.* . 2>/dev/null && rm -rf Elaheh-Project-main main.zip; then
            log "SUCCESS" "ZIP download from mirror successful."
            return 0
        else
            log "ERROR" "Failed to extract ZIP from mirror."
            rm -rf "$INSTALL_DIR"/* "$INSTALL_DIR"/.* 2>/dev/null
        fi
    fi
    log "WARN" "Attempt 2 (Mirror ZIP) failed. Falling back to git clone."
    
    # --- Attempt 3: `git clone` with proxy bypass (Fallback) ---
    log "INFO" "Attempt 3: Cloning via Git (proxy bypassed)..."
    if git -c http.proxy="" -c https.proxy="" clone --quiet --depth 1 "https://github.com/ehsanking/Elaheh-Project.git" . >> "$LOG_FILE" 2>&1; then
        log "SUCCESS" "Git clone successful."
        return 0
    fi
    
    log "ERROR" "All download attempts failed. Please check network connection."
    return 1
}

install_dependencies() {
    cd "$INSTALL_DIR"
    log "INFO" "Installing dependencies (npm install)"
    npm install --legacy-peer-deps --loglevel=error >> "$LOG_FILE" 2>&1
}

compile_app() {
    cd "$INSTALL_DIR"
    log "INFO" "Building Angular app (npm run build)"
    export NODE_OPTIONS="--max-old-space-size=2048"
    npm run build >> "$LOG_FILE" 2>&1
}

(download_source) &
spinner $! "   > Downloading Source from GitHub..."
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to download source code from GitHub.${NC}"
    echo -e "${YELLOW}Check your internet connection or proxy settings.${NC}"
    echo -e "${YELLOW}Alternatively, follow the 'Manual Installation' guide in the README.${NC}"
    exit 1
fi

(install_dependencies) &
spinner $! "   > Installing Dependencies (npm)..."
if [ $? -ne 0 ]; then
    echo -e "${RED}Critical Error: Dependency installation failed.${NC}"
    echo -e "${YELLOW}Please check the log file: ${LOG_FILE}${NC}"
    exit 1
fi

(compile_app) &
spinner $! "   > Compiling Application (ng build)..."
if [ $? -ne 0 ]; then
    echo -e "${RED}Critical Error: Build failed.${NC}"
    echo -e "${YELLOW}Please check the log file: ${LOG_FILE}${NC}"
    exit 1
fi

DIST_PATH="$INSTALL_DIR/dist/project-elaheh/browser"
if [ ! -d "$DIST_PATH" ]; then
    echo -e "${RED}Critical Error: Build output directory not found.${NC}"
    echo -e "${YELLOW}Check log: ${LOG_FILE}${NC}"
    exit 1
fi

# Server Config Asset
mkdir -p "$DIST_PATH/assets"
echo "{\"role\": \"${ROLE}\", \"domain\": \"${DOMAIN}\", \"installedAt\": \"$(date)\"}" > "$DIST_PATH/assets/server-config.json"

# --- STEP 4: Nginx & SSL (The Critical Part) ---
echo -e "\n${GREEN}--- STEP 4: WEBSERVER & SSL ---${NC}"

# Stop Nginx to free port 80 for Certbot
$SUDO_CMD systemctl stop nginx >> "$LOG_FILE" 2>&1 || true

SSL_KEY=""
SSL_CERT=""
USE_SELF_SIGNED=0

attempt_certbot() {
    echo -e "${CYAN}   > Attempting to obtain valid SSL from Let's Encrypt...${NC}"
    log "INFO" "Requesting Certbot SSL for $DOMAIN"
    if $SUDO_CMD certbot certonly --standalone --preferred-challenges http --non-interactive --agree-tos -m "admin@${DOMAIN}" -d "${DOMAIN}" >> "$LOG_FILE" 2>&1; then
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
    log "INFO" "Generating Self-Signed SSL"
    
    SELF_DIR="/etc/nginx/ssl"
    $SUDO_CMD mkdir -p $SELF_DIR
    $SUDO_CMD openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SELF_DIR/selfsigned.key" \
        -out "$SELF_DIR/selfsigned.crt" \
        -subj "/C=IR/ST=Tehran/L=Tehran/O=Elaheh/OU=IT/CN=${DOMAIN}" >> "$LOG_FILE" 2>&1
    
    SSL_KEY="$SELF_DIR/selfsigned.key"
    SSL_CERT="$SELF_DIR/selfsigned.crt"
    USE_SELF_SIGNED=1
fi

# Write Nginx Config
cat <<EOF | $SUDO_CMD tee /etc/nginx/sites-available/elaheh > /dev/null
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
$SUDO_CMD rm -f /etc/nginx/sites-enabled/default
$SUDO_CMD ln -sf /etc/nginx/sites-available/elaheh /etc/nginx/sites-enabled/
$SUDO_CMD systemctl restart nginx
echo -e "${GREEN}   > Nginx configured and started.${NC}"

# --- STEP 5: Firewall & PM2 ---
echo -e "\n${GREEN}--- STEP 5: FINALIZING ---${NC}"

setup_firewall() {
    log "INFO" "Configuring Firewall"
    if command -v ufw >> "$LOG_FILE" 2>&1; then
        $SUDO_CMD ufw allow 22/tcp >> "$LOG_FILE" 2>&1
        $SUDO_CMD ufw allow 80/tcp >> "$LOG_FILE" 2>&1
        $SUDO_CMD ufw allow 443/tcp >> "$LOG_FILE" 2>&1
        # Tunnel Ports
        $SUDO_CMD ufw allow 110/tcp >> "$LOG_FILE" 2>&1
        $SUDO_CMD ufw allow 510/tcp >> "$LOG_FILE" 2>&1
        $SUDO_CMD ufw allow 1414/udp >> "$LOG_FILE" 2>&1
        $SUDO_CMD ufw allow 53133/udp >> "$LOG_FILE" 2>&1
        echo "y" | $SUDO_CMD ufw enable >> "$LOG_FILE" 2>&1
    elif command -v firewall-cmd >> "$LOG_FILE" 2>&1; then
        $SUDO_CMD systemctl start firewalld
        $SUDO_CMD firewall-cmd --permanent --add-service=http >> "$LOG_FILE" 2>&1
        $SUDO_CMD firewall-cmd --permanent --add-service=https >> "$LOG_FILE" 2>&1
        $SUDO_CMD firewall-cmd --permanent --add-port=110/tcp >> "$LOG_FILE" 2>&1
        $SUDO_CMD firewall-cmd --permanent --add-port=510/tcp >> "$LOG_FILE" 2>&1
        $SUDO_CMD firewall-cmd --permanent --add-port=1414/udp >> "$LOG_FILE" 2>&1
        $SUDO_CMD firewall-cmd --permanent --add-port=53133/udp >> "$LOG_FILE" 2>&1
        $SUDO_CMD firewall-cmd --reload >> "$LOG_FILE" 2>&1
    fi
}
(setup_firewall) &
spinner $! "   > Configuring Firewall (UFW/Firewalld)..."

# Serve using Nginx is enough for static build, 
# But if we had a node backend, we would start it here with PM2.
# Ensuring PM2 startup for future backend modules
$SUDO_CMD pm2 startup >> "$LOG_FILE" 2>&1 || true
$SUDO_CMD pm2 save >> "$LOG_FILE" 2>&1 || true

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