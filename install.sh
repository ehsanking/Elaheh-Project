
#!/bin/bash

# Project Elaheh Installer
# Version 2.3.3 (Foolproof Domain & SSL)
# Author: EHSANKiNG

set -e

# --- UI & Helper Functions ---

# Colors
GREEN='\033[1;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

TOTAL_STEPS=8
CURRENT_STEP=0

# Spinner function
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

# Progress update function
update_progress() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    local percentage=$((CURRENT_STEP * 100 / TOTAL_STEPS))
    echo -e "\n${GREEN}Progress: [${CURRENT_STEP}/${TOTAL_STEPS}] ${percentage}%% complete.${NC}"
}

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
    
    echo -e "${GREEN}[+] NPM Environment Optimized for Iran.${NC}"
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
echo "   Version 2.3.3 (Foolproof Domain & SSL)"
echo "   'Secure. Fast. Uncensored.'"
echo "################################################################"
echo -e "${NC}"

SUDO=""
if [ "$EUID" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    echo -e "${RED}Error: Root privileges required. Please run as root.${NC}"
    exit 1
  fi
fi

# --- Role Selection ---
echo -e "${YELLOW}Select Server Location/Role:${NC}"
echo "1) Foreign Server (Upstream)"
echo "2) Iran Server (Edge - User Access)"
read -p "Select [1 or 2]: " ROLE_CHOICE

ROLE="external"
REGISTRY_FLAG=""
SELECTED_REGISTRY=""
if [[ "$ROLE_CHOICE" == *"2"* || "$ROLE_CHOICE" == *"۲"* ]]; then
    ROLE="iran"
    echo -e "${GREEN}>> Role Selected: IRAN Server (Edge).${NC}"
    find_working_mirror
    REGISTRY_FLAG="--registry=${SELECTED_REGISTRY}"
else
    echo -e "${GREEN}>> Role Selected: FOREIGN Server (Upstream).${NC}"
fi

# --- System Preparation ---
update_progress
echo -e "${CYAN}--- STEP 1: PREPARING SYSTEM & DEPENDENCIES ---${NC}"

if [ -f /etc/os-release ]; then . /etc/os-release; OS=$NAME; OS_ID=$ID; fi
export DEBIAN_FRONTEND=noninteractive

if [[ "$OS_ID" == "ubuntu" ]] || [[ "$OS_ID" == "debian" ]]; then
    (repair_apt_system && $SUDO apt-get update -y -qq && $SUDO apt-get upgrade -y -qq && $SUDO apt-get install -y -qq -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" curl git unzip ufw nginx certbot python3-certbot-nginx socat redis-server cron) &
    spinner $! "   > Updating and installing base packages (APT)..."
elif [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Fedora"* ]]; then
    ($SUDO dnf upgrade -y --refresh && $SUDO dnf install -y -q curl git unzip firewalld nginx certbot python3-certbot-nginx socat redis cronie) &
    spinner $! "   > Updating and installing base packages (DNF)..."
else
    echo -e "${RED}Unsupported OS. This script is designed for Debian/Ubuntu and Rocky/Fedora-based systems.${NC}"
    exit 1
fi
$SUDO systemctl enable --now redis >/dev/null 2>&1

# --- Node.js & PNPM Installation ---
update_progress
echo -e "${CYAN}--- STEP 2: INSTALLING NODE.JS & PNPM ---${NC}"
NODE_VERSION="v22.12.0"
NODE_DIST="node-${NODE_VERSION}-linux-x64"
NODE_URL="https://nodejs.org/dist/${NODE_VERSION}/${NODE_DIST}.tar.xz"
if [[ "$ROLE" == "iran" ]]; then NODE_URL="https://npmmirror.com/mirrors/node/${NODE_VERSION}/${NODE_DIST}.tar.xz"; fi

(curl -L --retry 3 --retry-delay 5 -o node.tar.xz "$NODE_URL" && \
tar -xf node.tar.xz && \
$SUDO rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx && \
$SUDO cp -R ${NODE_DIST}/* /usr/local/ && \
rm -rf node.tar.xz ${NODE_DIST}) &
spinner $! "   > Downloading and installing Node.js ${NODE_VERSION}..."

if [[ "$ROLE" == "iran" ]]; then configure_iran_npm_environment; fi

($SUDO npm install -g pnpm ${REGISTRY_FLAG}) &
spinner $! "   > Installing pnpm package manager..."

($SUDO pnpm add -g pm2 @angular/cli ${REGISTRY_FLAG}) &
spinner $! "   > Installing global tools (pm2, @angular/cli)..."

# --- Project Setup ---
update_progress
echo -e "${CYAN}--- STEP 3: DOWNLOADING PROJECT SOURCE CODE ---${NC}"
INSTALL_DIR="/opt/elaheh-project"
$SUDO mkdir -p "$INSTALL_DIR" && $SUDO chown -R $USER:$USER "$INSTALL_DIR"
cd "$INSTALL_DIR"

(if ! git clone --depth 1 "https://github.com/ehsanking/Elaheh-Project.git" . >/dev/null 2>&1; then
    echo -e "${YELLOW}\n   > Git clone failed. Trying direct ZIP download...${NC}" >&2
    curl -L "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/main.zip" -o repo.zip
    unzip -q repo.zip
    mv Elaheh-Project-main/* . && mv Elaheh-Project-main/.* . 2>/dev/null || true
    rm -rf Elaheh-Project-main repo.zip
fi) &
spinner $! "   > Cloning repository from GitHub..."

# --- Dependency Installation ---
update_progress
echo -e "${CYAN}--- STEP 4: INSTALLING PROJECT DEPENDENCIES ---${NC}"
echo "legacy-peer-deps=true" > .npmrc
if [[ "$ROLE" == "iran" ]]; then echo "registry=${SELECTED_REGISTRY}" >> .npmrc; fi
(pnpm install ${REGISTRY_FLAG}) &
spinner $! "   > Installing dependencies with pnpm (this may take a moment)..."

# --- Build Project ---
update_progress
echo -e "${CYAN}--- STEP 5: BUILDING ANGULAR APPLICATION ---${NC}"
(pnpm run build) &
spinner $! "   > Compiling production-ready application..."
DIST_PATH="$INSTALL_DIR/dist/project-elaheh/browser"
if [ ! -d "$DIST_PATH" ]; then echo -e "${RED}[!] Build Failed! Check logs.${NC}"; exit 1; fi

# --- Domain & SSL Configuration ---
update_progress
echo -e "${CYAN}--- STEP 6: CONFIGURING DOMAIN & NGINX ---${NC}"
echo -e "${YELLOW}Detecting server's public IP address...${NC}"
PUBLIC_IP=$(curl -s --max-time 10 ifconfig.me || curl -s --max-time 10 ipinfo.io/ip)

if [ -z "$PUBLIC_IP" ]; then
    echo -e "${RED}Could not automatically detect the public IP address.${NC}"
    echo -e "${YELLOW}Please find it manually and ensure your domain's A record points to it.${NC}\n"
else
    echo -e "${YELLOW}Please ensure your domain's A record points to: ${CYAN}${PUBLIC_IP}${NC}\n"
fi

DOMAIN=""
DEFAULT_DOMAIN=""
if [ -n "$PUBLIC_IP" ]; then
    PUBLIC_IP=$(echo "$PUBLIC_IP" | tr -d '[:space:]' | grep -oE "\b([0-9]{1,3}\.){3}[0-9]{1,3}\b" | head -n 1 || true)
    if [ -n "$PUBLIC_IP" ]; then
        DEFAULT_DOMAIN="${PUBLIC_IP}.sslip.io"
    fi
fi

while true; do
    if [ -n "$DEFAULT_DOMAIN" ]; then
        read -p "Enter your Domain (or press Enter for default: ${DEFAULT_DOMAIN}): " DOMAIN
        if [ -z "$DOMAIN" ]; then
            DOMAIN="$DEFAULT_DOMAIN"
        fi
    else
        read -p "Enter your Domain (required): " DOMAIN
    fi

    if [[ "$DOMAIN" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        echo -e "${GREEN}   > Using domain: ${DOMAIN}${NC}"
        break
    else
        echo -e "${RED}Error: Invalid or empty domain provided. Please try again.${NC}"
        DOMAIN=""
    fi
done

EMAIL="admin@${DOMAIN}"

mkdir -p "$DIST_PATH/assets"
cat <<EOF > "$DIST_PATH/assets/server-config.json"
{"role": "${ROLE}", "domain": "${DOMAIN}", "installedAt": "$(date)"}
EOF

(
$SUDO systemctl stop nginx >/dev/null 2>&1 || true
$SUDO lsof -t -i:80 -sTCP:LISTEN | xargs -r $SUDO kill -9 || true
cat <<EOF | $SUDO tee /etc/nginx/sites-available/elaheh > /dev/null
server { listen 80; server_name ${DOMAIN}; root ${DIST_PATH}; location / { try_files \$uri \$uri/ /index.html; } }
EOF
$SUDO ln -sf /etc/nginx/sites-available/elaheh /etc/nginx/sites-enabled/
$SUDO systemctl start nginx
) &
spinner $! "   > Configuring Nginx for HTTP..."

if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    ($SUDO certbot --nginx --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}") &
    spinner $! "   > Requesting SSL certificate via Certbot..."
fi

(
cat <<EOF | $SUDO tee /etc/nginx/sites-available/elaheh > /dev/null
server { listen 80; server_name ${DOMAIN}; return 301 https://\$host\$request_uri; }
server {
    listen 443 ssl http2; server_name ${DOMAIN};
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem; ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    root ${DIST_PATH}; index index.html;
    location / { try_files \$uri \$uri/ /index.html; }
}
EOF
$SUDO systemctl restart nginx
($SUDO crontab -l 2>/dev/null | grep -v "certbot renew") | $SUDO crontab - || true
($SUDO crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --deploy-hook 'systemctl reload nginx'") | $SUDO crontab -
) &
spinner $! "   > Configuring Nginx for HTTPS and setting up auto-renewal..."

# --- Finalize ---
update_progress
echo -e "${CYAN}--- STEP 7: CONFIGURING FIREWALL & STARTUP SERVICE ---${NC}"
($SUDO pm2 delete elaheh-app 2>/dev/null || true && \
$SUDO pm2 serve "$DIST_PATH" 3000 --name "elaheh-app" --spa && \
$SUDO pm2 save --force && \
$SUDO pm2 startup systemd -u root --hp /root >/dev/null 2>&1) &
spinner $! "   > Setting up application to run with PM2..."

if command -v ufw &> /dev/null; then
    ($SUDO ufw allow 22/tcp >/dev/null 2>&1 && $SUDO ufw allow 80/tcp >/dev/null 2>&1 && $SUDO ufw allow 443/tcp >/dev/null 2>&1 && echo "y" | $SUDO ufw enable >/dev/null 2>&1) &
    spinner $! "   > Configuring firewall (UFW)..."
elif command -v firewall-cmd &> /dev/null; then
    ($SUDO systemctl start firewalld && $SUDO firewall-cmd --permanent --add-service=http >/dev/null 2>&1 && $SUDO firewall-cmd --permanent --add-service=https >/dev/null 2>&1 && $SUDO firewall-cmd --reload >/dev/null 2>&1) &
    spinner $! "   > Configuring firewall (firewalld)..."
fi

update_progress
echo -e "${CYAN}--- STEP 8: FINALIZING INSTALLATION ---${NC}"
sleep 2

echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}      INSTALLATION COMPLETE!${NC}"
echo -e "      Role: ${ROLE^^}"
if [ -n "$DOMAIN" ]; then
    echo -e "      Panel URL: https://${DOMAIN}"
else
    echo -e "${RED}      WARNING: Domain was not set. Panel URL is unknown.${NC}"
    echo -e "${YELLOW}      Please check /etc/nginx/sites-available/elaheh to configure manually.${NC}"
fi
echo -e "${YELLOW}      Default Login: admin / admin${NC}"
echo -e "${GREEN}=========================================${NC}"
