#!/bin/bash

# Project Elaheh - Ultimate Installer (Iran/Sanction Optimized)
# Version 1.1.6 (CLI Verification & Stability)
# Author: EHSANKiNG

# --- UI Colors ---
GREEN='\033[1;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

LOG_FILE="/var/log/elaheh-install.log"
INSTALLER_VERSION="1.1.6"

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
echo "   Version ${INSTALLER_VERSION} (CLI Verification & Stability)"
echo "   'Breaking the Silence.'"
echo "################################################################"
echo -e "${NC}"

# Sudo Check
SUDO_CMD=""
if [ "$EUID" -ne 0 ]; then
    if command -v sudo >/dev/null 2>&1; then SUDO_CMD="sudo"; else echo -e "${RED}Error: This script must be run as root.${NC}"; exit 1; fi
fi

# OS & Arch Detection
if [ -f /etc/os-release ]; then . /etc/os-release; OS=$NAME; else echo -e "${RED}Error: Cannot detect OS.${NC}"; exit 1; fi
ARCH=$(uname -m)

# Set Nginx User based on OS
NGINX_USER="www-data"
if [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Fedora"* ]]; then
    NGINX_USER="nginx"
fi

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
PUBLIC_IP=$(curl -s --max-time 10 https://api.ipify.org || curl -s --max-time 10 icanhazip.com || curl -s --max-time 10 ifconfig.me)
if ! [[ $PUBLIC_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then echo -e "${RED}Error: Could not determine public IP address.${NC}"; exit 1; fi
echo -e "${GREEN}   > Public IP Detected: ${CYAN}${PUBLIC_IP}${NC}"

read -p "Enter your Domain (A record must point to IP): " DOMAIN
if [ -z "$DOMAIN" ]; then DOMAIN="localhost"; fi

log "INFO" "Starting installation v${INSTALLER_VERSION} for $ROLE on $DOMAIN ($OS / $ARCH)"

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
    
    PANEL_VERSION="$INSTALLER_VERSION"
    PANEL_ASSET_NAME="panel-v${PANEL_VERSION}.zip"

    log "INFO" "Targeting panel version ${PANEL_VERSION}"
    RELEASE_URL="https://github.com/ehsanking/Elaheh-Project/releases/download/v${PANEL_VERSION}/${PANEL_ASSET_NAME}"
    FALLBACK_RELEASE_URL="https://mirror.ghproxy.com/${RELEASE_URL}"
    
    echo -e "   > Downloading version: ${CYAN}${PANEL_ASSET_NAME}${NC}"
    cd /tmp

    log "INFO" "Attempting download from Primary URL: ${RELEASE_URL}"
    if ! curl -L --connect-timeout 30 --retry 3 -o "$PANEL_ASSET_NAME" "$RELEASE_URL" >> "$LOG_FILE" 2>&1; then
        log "WARN" "Primary (curl) download failed. Retrying with wget."
        rm -f "$PANEL_ASSET_NAME"
        if ! wget --timeout=30 --tries=3 -O "$PANEL_ASSET_NAME" "$RELEASE_URL" >> "$LOG_FILE" 2>&1; then
            log "WARN" "Primary (wget) download failed. Attempting Fallback URL: ${FALLBACK_RELEASE_URL}"
            rm -f "$PANEL_ASSET_NAME"
            if ! curl -L --connect-timeout 60 --retry 3 -o "$PANEL_ASSET_NAME" "$FALLBACK_RELEASE_URL" >> "$LOG_FILE" 2>&1; then
                 log "ERROR" "All download attempts failed."
                 return 1
            fi
        fi
    fi
    log "SUCCESS" "Download successful."

    if ! $SUDO_CMD unzip -q -o "$PANEL_ASSET_NAME" -d "$INSTALL_DIR" >> "$LOG_FILE" 2>&1; then log "ERROR" "Failed to extract panel asset."; return 1; fi
    log "SUCCESS" "Panel assets extracted to $INSTALL_DIR"
    rm -f "$PANEL_ASSET_NAME"
    
    $SUDO_CMD mkdir -p "$INSTALL_DIR/assets"
    echo "{\"role\": \"${ROLE}\", \"domain\": \"${DOMAIN}\", \"installedAt\": \"$(date)\"}" | $SUDO_CMD tee "$INSTALL_DIR/assets/server-config.json" > /dev/null
    
    $SUDO_CMD chown -R ${NGINX_USER}:${NGINX_USER} "$INSTALL_DIR"
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
    
    root ${INSTALL_DIR}/dist/project-elaheh/browser;
    index index.html;

    location / {
        try_files \$uri /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
EOF

$SUDO_CMD rm -f /etc/nginx/sites-enabled/default
$SUDO_CMD ln -sf /etc/nginx/sites-available/elaheh /etc/nginx/sites-enabled/

($SUDO_CMD nginx -t >> "$LOG_FILE" 2>&1)
($SUDO_CMD systemctl restart nginx) &
spinner $! "   > Configuring and starting Nginx..."

# --- STEP 4: INSTALLING 'elaheh' CLI ---
echo -e "\n${GREEN}--- STEP 4: INSTALLING 'elaheh' CLI ---${NC}"

create_cli() {
    CLI_PATH="/usr/local/bin/elaheh"
    log "INFO" "Creating CLI tool at ${CLI_PATH}"
    cat <<EOF | $SUDO_CMD tee ${CLI_PATH} > /dev/null
#!/bin/bash
# Project Elaheh CLI - v${INSTALLER_VERSION}

# This is a helper utility for managing the Elaheh panel.
# More features like user management will be added in future versions.

show_status() {
    echo "--- Elaheh Service Status ---"
    echo -n "Nginx Web Panel: "
    systemctl is-active --quiet nginx && echo -e "\e[32mActive\e[0m" || echo -e "\e[31mInactive\e[0m"
    
    # Handle both redis and redis-server service names
    if systemctl list-units --type=service | grep -q 'redis-server'; then
        REDIS_SERVICE="redis-server"
    else
        REDIS_SERVICE="redis"
    fi
    echo -n "Redis Cache: "
    systemctl is-active --quiet \${REDIS_SERVICE} && echo -e "\e[32mActive\e[0m" || echo -e "\e[31mInactive\e[0m"
    
    echo "-----------------------------"
    echo "For detailed tunnel and user status, please use the web panel."
}

show_logs() {
    echo "Displaying last 50 lines of install/update log..."
    tail -n 50 /var/log/elaheh-install.log
}

restart_panel() {
    echo "Restarting Nginx web server..."
    if sudo systemctl restart nginx; then
        echo "Nginx restarted successfully."
    else
        echo "Failed to restart Nginx. Check logs with 'journalctl -u nginx'."
    fi
}

show_help() {
    echo "Project Elaheh Command-Line Interface (v${INSTALLER_VERSION})"
    echo "A simple tool to manage your Elaheh installation."
    echo ""
    echo "Usage: elaheh <command>"
    echo ""
    echo "Available Commands:"
    echo "  status       Check the status of core services (Nginx, Redis)."
    echo "  restart      Restart the Nginx web panel."
    echo "  logs         Show the last 50 lines of the installation log."
    echo "  help         Display this help message."
    echo ""
    echo "User management commands will be added in a future release."
}

case "\$1" in
    status)
        show_status
        ;;
    restart)
        restart_panel
        ;;
    logs)
        show_logs
        ;;
    help|--help|-h|*)
        show_help
        ;;
esac
EOF
    $SUDO_CMD chmod +x ${CLI_PATH}
    if ! command -v elaheh >/dev/null; then
        log "ERROR" "CLI tool 'elaheh' was created but is not available in PATH. Please check /usr/local/bin is in your PATH."
        return 1
    fi
    log "SUCCESS" "CLI tool installed. You can now use the 'elaheh' command."
}
(create_cli) &
spinner $! "   > Creating 'elaheh' command-line tool..."

# --- STEP 5: FINALIZING ---
echo -e "\n${GREEN}--- STEP 5: FINALIZING ---${NC}"

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
echo -e "${CYAN}          CLI Tool: Use 'elaheh status' to check services.${NC}"
echo -e "${GREEN}==============================================${NC}"
exit 0