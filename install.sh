#!/bin/bash

# Project Elaheh - Ultimate Installer (Iran/Sanction Optimized)
# Version 1.1.0 (Pre-compiled, Enhanced Iran Support)
# Author: EHSANKiNG

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

# --- Initialization ---
clear
echo -e "${CYAN}"
echo "################################################################"
echo "   Project Elaheh - Anti-Censorship Tunnel Manager"
echo "   Version 1.1.0 (Iran-Optimized Release)"
echo "   'Breaking the Silence.'"
echo "################################################################"
echo -e "${NC}"

# Sudo Check
SUDO_CMD=""
if [ "$EUID" -ne 0 ]; then
    if command -v sudo >/dev/null 2>&1; then SUDO_CMD="sudo"; else echo -e "${RED}Error: This script must be run as root.${NC}"; exit 1; fi
fi

# OS Detection
if [ -f /etc/os-release ]; then . /etc/os-release; OS=$NAME; else echo -e "${RED}Error: Cannot detect OS.${NC}"; exit 1; fi

$SUDO_CMD touch "$LOG_FILE"
$SUDO_CMD chmod 666 "$LOG_FILE"

# --- User Input ---
echo -e "${YELLOW}Select Server Role:${NC}"
echo "1) Foreign Server (Upstream)"
echo "2) Iran Server (Edge)"
read -p "Select [1 or 2]: " ROLE_CHOICE

if [[ "$ROLE_CHOICE" == *"2"* || "$ROLE_CHOICE" == *"۲"* ]]; then ROLE="iran"; else ROLE="external"; fi
echo -e "${GREEN}>> Role: ${ROLE^^}${NC}"

# Get Domain & IP
echo -e "\n${YELLOW}Detecting Public IP...${NC}"
PUBLIC_IP=$(curl -s --max-time 5 https://api.ipify.org || curl -s --max-time 5 icanhazip.com || curl -s --max-time 5 ifconfig.me)
if ! [[ $PUBLIC_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then echo -e "${RED}Error: Could not determine public IP address.${NC}"; exit 1; fi
echo -e "${GREEN}   > Public IP Detected: ${CYAN}${PUBLIC_IP}${NC}"

read -p "Enter your Domain (A record must point to IP): " DOMAIN
if [ -z "$DOMAIN" ]; then DOMAIN="localhost"; fi

log "INFO" "Starting installation v1.1.0 for $ROLE on $DOMAIN ($OS)"

# --- STEP 1: Smart Package Installation ---
echo -e "\n${GREEN}--- STEP 1: SYSTEM PACKAGES & DEPENDENCIES ---${NC}"

install_pkg_apt() {
    PKG=$1
    if ! dpkg -l | grep -q "^ii  $PKG "; then log "INFO" "Installing $PKG..."; $SUDO_CMD apt-get install -y -qq $PKG >> "$LOG_FILE" 2>&1; fi
}
install_pkg_dnf() {
    PKG=$1
    if ! rpm -q $PKG >/dev/null 2>&1; then log "INFO" "Installing $PKG..."; $SUDO_CMD dnf install -y -q $PKG >> "$LOG_FILE" 2>&1; fi
}
prepare_system() {
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        $SUDO_CMD apt-get update -y -qq >> "$LOG_FILE" 2>&1
        local DEPS=("curl" "wget" "unzip" "ufw" "nginx" "certbot" "python3-certbot-nginx" "socat" "redis-server")
        for dep in "${DEPS[@]}"; do install_pkg_apt "$dep"; done
        $SUDO_CMD systemctl enable --now redis-server >> "$LOG_FILE" 2>&1
    elif [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        $SUDO_CMD dnf check-update >> "$LOG_FILE" 2>&1 || true
        local DEPS=("curl" "wget" "unzip" "firewalld" "nginx" "certbot" "python3-certbot-nginx" "socat" "redis")
        for dep in "${DEPS[@]}"; do install_pkg_dnf "$dep"; done
        $SUDO_CMD systemctl enable --now redis >> "$LOG_FILE" 2>&1
    fi
}
(prepare_system) &
spinner $! "   > Verifying and installing base packages..."
if [ $? -ne 0 ]; then echo -e "${RED}Error: Failed to install system dependencies.${NC}"; exit 1; fi

# --- STEP 2: DOWNLOAD & INSTALL PRE-COMPILED PANEL ---
echo -e "\n${GREEN}--- STEP 2: INSTALLING ELAHEH PANEL ---${NC}"
INSTALL_DIR="/opt/elaheh-project"

download_and_install_panel() {
    log "INFO" "Cleaning install directory $INSTALL_DIR"
    $SUDO_CMD rm -rf "$INSTALL_DIR"
    $SUDO_CMD mkdir -p "$INSTALL_DIR"
    
    log "INFO" "Fetching latest pre-compiled release URL from GitHub..."
    
    # Try multiple methods to fetch release URL (Iran-friendly alternatives)
    RELEASE_URL=""
    
    # Method 1: Direct GitHub API (may be blocked in Iran)
    RELEASE_URL=$(curl -s https://api.github.com/repos/ehsanking/Elaheh-Project/releases/latest 2>/dev/null | grep "browser_download_url" | grep "panel-v.*.zip" | cut -d '"' -f 4)
    
    # Method 2: Try GitHub via mirror (if method 1 fails)
    if [ -z "$RELEASE_URL" ]; then
        log "WARN" "GitHub API failed, trying alternative mirror..."
        RELEASE_URL=$(curl -s https://hub.fgit.ml/ehsanking/Elaheh-Project/releases/latest 2>/dev/null | grep -o 'href="[^"]*panel-v[^"]*\.zip"' | sed 's/href="//;s/"$//' | head -1)
        if [ -n "$RELEASE_URL" ] && [[ ! "$RELEASE_URL" =~ ^https?:// ]]; then
            RELEASE_URL="https://github.com${RELEASE_URL}"
        fi
    fi
    
    # Method 3: Fallback to known version if all else fails
    if [ -z "$RELEASE_URL" ]; then
        log "WARN" "Could not fetch latest release, using fallback URL..."
        RELEASE_URL="https://github.com/ehsanking/Elaheh-Project/releases/download/v1.1.0/panel-v1.1.0.zip"
    fi

    if [ -z "$RELEASE_URL" ]; then 
        log "ERROR" "Failed to find pre-compiled panel asset."
        echo -e "${RED}Error: Could not determine download URL. Please check your internet connection.${NC}"
        return 1
    fi
    
    log "INFO" "Latest release URL: $RELEASE_URL"
    PANEL_ASSET_NAME=$(basename "$RELEASE_URL")
    
    echo -e "   > Found latest version: ${CYAN}${PANEL_ASSET_NAME}${NC}"

    cd /tmp
    log "INFO" "Downloading pre-compiled panel from GitHub: ${RELEASE_URL}"
    
    # Try multiple download methods for Iran compatibility
    DOWNLOAD_SUCCESS=0
    
    # Method 1: curl with retry
    if curl -L -o "$PANEL_ASSET_NAME" --connect-timeout 30 --max-time 300 --retry 3 --retry-delay 5 "$RELEASE_URL" >> "$LOG_FILE" 2>&1; then
        DOWNLOAD_SUCCESS=1
    # Method 2: wget fallback
    elif command -v wget >/dev/null 2>&1 && wget -O "$PANEL_ASSET_NAME" --timeout=30 --tries=3 "$RELEASE_URL" >> "$LOG_FILE" 2>&1; then
        DOWNLOAD_SUCCESS=1
    fi
    
    if [ $DOWNLOAD_SUCCESS -eq 0 ]; then
        log "ERROR" "Download failed with both curl and wget."
        echo -e "${RED}Error: Failed to download panel. Please check your internet connection.${NC}"
        return 1
    fi

    if ! $SUDO_CMD unzip -q -o "$PANEL_ASSET_NAME" -d "$INSTALL_DIR" >> "$LOG_FILE" 2>&1; then 
        log "ERROR" "Failed to extract panel asset."
        return 1
    fi
    log "SUCCESS" "Panel assets extracted to $INSTALL_DIR"
    
    rm -f "$PANEL_ASSET_NAME"
    
    # Place config in the assets folder of the application
    $SUDO_CMD mkdir -p "$INSTALL_DIR/assets"
    echo "{\"role\": \"${ROLE}\", \"domain\": \"${DOMAIN}\", \"installedAt\": \"$(date)\"}" | $SUDO_CMD tee "$INSTALL_DIR/assets/server-config.json" > /dev/null
    
    $SUDO_CMD chown -R root:root "$INSTALL_DIR"
    $SUDO_CMD chmod -R 755 "$INSTALL_DIR"

    return 0
}
(download_and_install_panel) &
spinner $! "   > Downloading and extracting pre-compiled panel..."
if [ $? -ne 0 ]; then echo -e "${RED}Error: Failed to install the panel.${NC}"; exit 1; fi

# --- STEP 3: Nginx & SSL ---
echo -e "\n${GREEN}--- STEP 3: WEBSERVER & SSL ---${NC}"

($SUDO_CMD systemctl stop nginx >> "$LOG_FILE" 2>&1)

SSL_KEY=""
SSL_CERT=""
USE_SELF_SIGNED=0

attempt_certbot() {
    log "INFO" "Requesting Certbot SSL for $DOMAIN"
    if $SUDO_CMD certbot certonly --standalone --preferred-challenges http --non-interactive --agree-tos -m "admin@${DOMAIN}" -d "${DOMAIN}" >> "$LOG_FILE" 2>&1; then
        SSL_KEY="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"; SSL_CERT="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"; return 0;
    else log "ERROR" "Certbot failed."; return 1; fi
}

if [ "$DOMAIN" != "localhost" ]; then
    if attempt_certbot; then echo -e "${GREEN}   > Valid SSL Certificate obtained!${NC}"; else echo -e "${YELLOW}   > Let's Encrypt failed. Using Self-Signed SSL.${NC}"; USE_SELF_SIGNED=1; fi
else echo -e "${YELLOW}   > Skipping Let's Encrypt for localhost.${NC}"; USE_SELF_SIGNED=1; fi

if [ "$USE_SELF_SIGNED" -eq 1 ]; then
    log "INFO" "Generating Self-Signed SSL"; SELF_DIR="/etc/nginx/ssl"; $SUDO_CMD mkdir -p $SELF_DIR
    $SUDO_CMD openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout "$SELF_DIR/selfsigned.key" -out "$SELF_DIR/selfsigned.crt" -subj "/C=IR/ST=Tehran/L=Tehran/O=Elaheh/OU=IT/CN=${DOMAIN}" >> "$LOG_FILE" 2>&1
    SSL_KEY="$SELF_DIR/selfsigned.key"; SSL_CERT="$SELF_DIR/selfsigned.crt"
fi

cat <<EOF | $SUDO_CMD tee /etc/nginx/sites-available/elaheh > /dev/null
server {
    listen 80;
    server_name ${DOMAIN} ${PUBLIC_IP};
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 301 https://\$host\$request_uri; }
}
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN} ${PUBLIC_IP};

    ssl_certificate ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    root ${INSTALL_DIR};
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
EOF

$SUDO_CMD rm -f /etc/nginx/sites-enabled/default
$SUDO_CMD ln -sf /etc/nginx/sites-available/elaheh /etc/nginx/sites-enabled/

($SUDO_CMD nginx -t >> "$LOG_FILE" 2>&1)
($SUDO_CMD systemctl restart nginx) &
spinner $! "   > Configuring and starting Nginx..."

# --- STEP 4: Firewall ---
echo -e "\n${GREEN}--- STEP 4: FINALIZING ---${NC}"

setup_firewall() {
    log "INFO" "Configuring Firewall"
    if command -v ufw >> "$LOG_FILE" 2>&1; then
        $SUDO_CMD ufw allow 22/tcp >> "$LOG_FILE" 2>&1; $SUDO_CMD ufw allow 80/tcp >> "$LOG_FILE" 2>&1; $SUDO_CMD ufw allow 443/tcp >> "$LOG_FILE" 2>&1
        $SUDO_CMD ufw allow 110/tcp >> "$LOG_FILE" 2>&1; $SUDO_CMD ufw allow 510/tcp >> "$LOG_FILE" 2>&1
        $SUDO_CMD ufw allow 1414/udp >> "$LOG_FILE" 2>&1; $SUDO_CMD ufw allow 53133/udp >> "$LOG_FILE" 2>&1
        echo "y" | $SUDO_CMD ufw enable >> "$LOG_FILE" 2>&1
    elif command -v firewall-cmd >> "$LOG_FILE" 2>&1; then
        $SUDO_CMD systemctl start firewalld
        $SUDO_CMD firewall-cmd --permanent --add-service=http --add-service=https >> "$LOG_FILE" 2>&1
        $SUDO_CMD firewall-cmd --permanent --add-port=110/tcp --add-port=510/tcp >> "$LOG_FILE" 2>&1
        $SUDO_CMD firewall-cmd --permanent --add-port=1414/udp --add-port=53133/udp >> "$LOG_FILE" 2>&1
        $SUDO_CMD firewall-cmd --reload >> "$LOG_FILE" 2>&1
    fi
}
(setup_firewall) &
spinner $! "   > Configuring Firewall (UFW/Firewalld)..."

echo ""
echo -e "${GREEN}==============================================${NC}"
echo -e "${GREEN}          INSTALLATION SUCCESSFUL!${NC}"
echo -e "          Installation Time: < 30 Seconds"
echo -e "          Role: ${ROLE^^}"
echo -e "          Panel Address: https://${DOMAIN}"
if [ "$USE_SELF_SIGNED" -eq 1 ]; then
    echo -e "${YELLOW}          [!] Note: Using Self-Signed SSL.${NC}"
    echo -e "${YELLOW}          Your browser will show a security warning.${NC}"
fi
echo -e "${YELLOW}          Login: admin / admin${NC}"
echo -e "${GREEN}==============================================${NC}"
exit 0