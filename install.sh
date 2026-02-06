
#!/bin/bash

# Project Elaheh Installer
# Version 2.0.0 (Sanction Bypass Edition)
# Author: EHSANKiNG

set -e

# --- UI & Helper Functions ---

# Colors
GREEN='\033[1;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Spinner function for background tasks
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
    if [ $? -eq 0 ]; then
        printf "${GREEN} [✔ Done]${NC}\n"
    else
        printf "${RED} [✖ Failed]${NC}\n"
        exit 1
    fi
}

# --- Tunnel & Proxy Management ---
TUNNEL_PID=""
FOREIGN_IP=""
FOREIGN_USER=""
FOREIGN_PASS=""
PROXY_PORT="10800"
PROXY_URL="socks5h://127.0.0.1:${PROXY_PORT}"

start_tunnel() {
    echo -e "${YELLOW}[!] Sanction Bypass Mode Activated.${NC}"
    
    # Get Foreign Server Credentials
    read -p "Enter Foreign Server IP Address: " FOREIGN_IP
    read -p "Enter Foreign Server SSH Username (e.g., root): " FOREIGN_USER
    read -s -p "Enter Foreign Server SSH Password: " FOREIGN_PASS
    echo
    
    if [ -z "$FOREIGN_IP" ] || [ -z "$FOREIGN_USER" ] || [ -z "$FOREIGN_PASS" ]; then
        echo -e "${RED}Error: Foreign server credentials are required for installation in Iran.${NC}"
        exit 1
    fi
    
    # Install sshpass
    echo -e "${CYAN}   > Installing 'sshpass' utility...${NC}"
    if command -v apt-get >/dev/null; then
        $SUDO apt-get update -y -qq && $SUDO apt-get install -y -qq sshpass
    elif command -v dnf >/dev/null; then
        $SUDO dnf install -y -q sshpass
    else
        echo -e "${RED}Error: Could not install sshpass. Unsupported OS package manager.${NC}"
        exit 1
    fi

    # Establish SSH Tunnel
    (
    export SSHPASS="$FOREIGN_PASS"
    sshpass -e ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
        -fN -D ${PROXY_PORT} "${FOREIGN_USER}@${FOREIGN_IP}"
    ) &> /dev/null
    
    # Give it a moment to establish
    sleep 5
    TUNNEL_PID=$(pgrep -f "ssh.*-D ${PROXY_PORT}")

    if [ -z "$TUNNEL_PID" ]; then
        echo -e "${RED}Error: Failed to establish SSH tunnel. Check credentials and server connectivity.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}[+] SSH tunnel established successfully (PID: $TUNNEL_PID).${NC}"
    
    # Configure system tools to use the proxy
    echo -e "${CYAN}   > Routing installation traffic through the tunnel...${NC}"
    export HTTPS_PROXY="${PROXY_URL}"
    export HTTP_PROXY="${PROXY_URL}"
    export ALL_PROXY="${PROXY_URL}"
    $SUDO npm config set proxy "${PROXY_URL}"
    $SUDO npm config set https-proxy "${PROXY_URL}"
    # Git automatically respects HTTPS_PROXY
}

cleanup() {
    # This function is called on script exit to clean up
    if [ -n "$TUNNEL_PID" ]; then
        echo -e "\n${CYAN}[i] Terminating SSH tunnel (PID: $TUNNEL_PID)...${NC}"
        kill "$TUNNEL_PID" || true
    fi
    
    if [[ "$ROLE" == "iran" ]]; then
        echo -e "${CYAN}[i] Cleaning up proxy configurations...${NC}"
        unset HTTPS_PROXY HTTP_PROXY ALL_PROXY
        $SUDO npm config delete proxy >/dev/null 2>&1 || true
        $SUDO npm config delete https-proxy >/dev/null 2>&1 || true
        if command -v apt-get >/dev/null; then
             $SUDO apt-get remove --purge -y -qq sshpass >/dev/null 2>&1 || true
        elif command -v dnf >/dev/null; then
             $SUDO dnf remove -y -q sshpass >/dev/null 2>&1 || true
        fi
        echo -e "${GREEN}[+] Cleanup complete.${NC}"
    fi
}
trap cleanup EXIT

# -----------------------------------------------------------------------------
# Main Installation Logic
# -----------------------------------------------------------------------------

clear
echo -e "${CYAN}"
echo "################################################################"
echo "   Project Elaheh - Stealth Tunnel Management System"
echo "   Version 2.0.0 (Sanction Bypass Edition)"
echo "   'Secure. Fast. Uncensored.'"
echo "################################################################"
echo -e "${NC}"

# 1. Check for root privileges or sudo
SUDO=""
if [ "$EUID" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    echo -e "${RED}Error: Please run as root.${NC}"
    exit 1
  fi
fi

# 2. Role Selection
echo -e "${YELLOW}Select Server Location/Role:${NC}"
echo "1) Foreign Server (Upstream - Germany, Finland, etc.)"
echo "2) Iran Server (Edge - User Access)"
read -p "Select [1 or 2]: " ROLE_CHOICE

ROLE="external"
if [[ "$ROLE_CHOICE" == *"2"* || "$ROLE_CHOICE" == *"۲"* ]]; then
    ROLE="iran"
    echo -e "${GREEN}>> Role Selected: IRAN Server (Edge).${NC}"
    start_tunnel
else
    echo -e "${GREEN}>> Role Selected: FOREIGN Server (Upstream).${NC}"
fi

# 3. System Preparation
echo -e "\n${GREEN}--- STEP 1: PREPARING SYSTEM & DEPENDENCIES ---${NC}"
if [ -f /etc/os-release ]; then . /etc/os-release; OS=$NAME; fi
export DEBIAN_FRONTEND=noninteractive

install_deps() {
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        ($SUDO apt-get update -y -qq && $SUDO apt-get upgrade -y -qq && $SUDO apt-get install -y -qq curl git unzip ufw nginx certbot python3-certbot-nginx socat redis-server)
    elif [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        ($SUDO dnf upgrade -y --refresh && $SUDO dnf install -y -q curl git unzip firewalld nginx certbot python3-certbot-nginx socat redis)
    fi
}
(install_deps) &
spinner $! "   > Updating and installing base packages..."

$SUDO systemctl enable --now redis-server >/dev/null 2>&1 || $SUDO systemctl enable --now redis >/dev/null 2>&1

# 4. Node.js & PNPM Installation
echo -e "\n${GREEN}--- STEP 2: INSTALLING NODE.JS & PNPM ---${NC}"
NODE_VERSION="v22.12.0"
NODE_DIST="node-${NODE_VERSION}-linux-x64"

(curl -L --retry 3 --retry-delay 5 "https://nodejs.org/dist/${NODE_VERSION}/${NODE_DIST}.tar.xz" | tar -xJ -C /tmp) &
spinner $! "   > Downloading Node.js ${NODE_VERSION}..."

($SUDO rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx && \
 $SUDO cp -R /tmp/${NODE_DIST}/* /usr/local/ && \
 $SUDO rm -rf /tmp/${NODE_DIST}) &
spinner $! "   > Installing Node.js..."

($SUDO npm install -g pnpm) &
spinner $! "   > Installing pnpm package manager..."

($SUDO pnpm add -g pm2 @angular/cli) &
spinner $! "   > Installing global tools (pm2, @angular/cli)..."

# 5. Project Setup
echo -e "\n${GREEN}--- STEP 3: SETTING UP PROJECT ---${NC}"
INSTALL_DIR="/opt/elaheh-project"
$SUDO mkdir -p "$INSTALL_DIR" && $SUDO chown -R $USER:$USER "$INSTALL_DIR"
cd "$INSTALL_DIR"

(git clone --depth 1 "https://github.com/ehsanking/Elaheh-Project.git" .) &
spinner $! "   > Cloning repository from GitHub..."

echo "legacy-peer-deps=true" > .npmrc
(pnpm install) &
spinner $! "   > Installing dependencies with pnpm (this may take a moment)..."

(pnpm run build) &
spinner $! "   > Compiling production-ready application..."

DIST_PATH="$INSTALL_DIR/dist/project-elaheh/browser"
if [ ! -d "$DIST_PATH" ]; then 
    echo -e "${RED}[!] Build Failed! Output directory not found.${NC}"
    exit 1
fi

# 6. Domain & Nginx Configuration
echo -e "\n${GREEN}--- STEP 4: CONFIGURING DOMAIN & NGINX ---${NC}"
PUBLIC_IP=$(curl -s --max-time 10 ifconfig.me || curl -s --max-time 10 ipinfo.io/ip)
echo -e "${YELLOW}Please ensure your domain's A record points to: ${CYAN}${PUBLIC_IP}${NC}\n"
read -p "Enter your Domain: " DOMAIN
EMAIL="admin@${DOMAIN}"

$SUDO mkdir -p "$DIST_PATH/assets"
cat <<EOF | $SUDO tee "$DIST_PATH/assets/server-config.json" > /dev/null
{"role": "${ROLE}", "domain": "${DOMAIN}", "installedAt": "$(date)"}
EOF

($SUDO systemctl stop nginx >/dev/null 2>&1 || true)
($SUDO lsof -t -i:80 -sTCP:LISTEN | xargs -r $SUDO kill -9 || true)

($SUDO certbot certonly --standalone --preferred-challenges http --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}") &
spinner $! "   > Requesting SSL certificate via Certbot..."

cat <<EOF | $SUDO tee /etc/nginx/sites-available/elaheh > /dev/null
server {
    listen 80; server_name ${DOMAIN};
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl http2; server_name ${DOMAIN};
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    root ${DIST_PATH}; index index.html;
    location / { try_files \$uri \$uri/ /index.html; }
}
EOF
$SUDO ln -sf /etc/nginx/sites-available/elaheh /etc/nginx/sites-enabled/
($SUDO crontab -l 2>/dev/null | grep -v "certbot renew") | $SUDO crontab - || true
($SUDO crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --deploy-hook 'systemctl reload nginx'") | $SUDO crontab -
($SUDO systemctl restart nginx) &
spinner $! "   > Configuring Nginx for HTTPS..."

# 7. Finalize
echo -e "\n${GREEN}--- STEP 5: FINALIZING INSTALLATION ---${NC}"
if command -v ufw &> /dev/null; then
    ($SUDO ufw allow 22/tcp >/dev/null 2>&1 && $SUDO ufw allow 80/tcp >/dev/null 2>&1 && $SUDO ufw allow 443/tcp >/dev/null 2>&1 && echo "y" | $SUDO ufw enable >/dev/null 2>&1) &
    spinner $! "   > Configuring firewall (UFW)..."
elif command -v firewall-cmd &> /dev/null; then
    ($SUDO systemctl start firewalld && $SUDO firewall-cmd --permanent --add-service=http >/dev/null 2>&1 && $SUDO firewall-cmd --permanent --add-service=https >/dev/null 2>&1 && $SUDO firewall-cmd --reload >/dev/null 2>&1) &
    spinner $! "   > Configuring firewall (firewalld)..."
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}      INSTALLATION COMPLETE!${NC}"
echo -e "      Role: ${ROLE^^}"
echo -e "      Panel URL: https://${DOMAIN}"
echo -e "${YELLOW}      Default Login: admin / admin${NC}"
echo -e "${GREEN}=========================================${NC}"
# The 'trap' will call the cleanup function automatically on exit.
exit 0
