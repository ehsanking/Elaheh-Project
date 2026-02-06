
#!/bin/bash

# Project Elaheh Installer
# Version 2.5.0 (SSH Pre-flight Check)
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
FOREIGN_PORT=""
PROXY_PORT="10800"
PROXY_URL="socks5h://127.0.0.1:${PROXY_PORT}"

install_sshpass() {
    (
        if command -v apt-get >/dev/null; then
            $SUDO apt-get update -y -qq && $SUDO apt-get install -y -qq sshpass
        elif command -v dnf >/dev/null; then
            $SUDO dnf install -y -q sshpass
        else
            echo -e "${RED}Error: Could not install sshpass. Unsupported OS.${NC}"
            exit 1
        fi
    ) &
    spinner $! "   > Installing tunnel dependency (sshpass)..."
}

start_tunnel() {
    echo -e "${YELLOW}[!] Sanction Bypass Mode Activated.${NC}"
    
    while true; do
        read -p "Enter Foreign Server IP Address: " FOREIGN_IP
        read -p "Enter Foreign Server SSH Username (e.g., root): " FOREIGN_USER
        read -p "Enter Foreign Server SSH Port [22]: " FOREIGN_PORT
        FOREIGN_PORT=${FOREIGN_PORT:-22}
        read -s -p "Enter Foreign Server SSH Password: " FOREIGN_PASS
        echo

        if [ -z "$FOREIGN_IP" ] || [ -z "$FOREIGN_USER" ] || [ -z "$FOREIGN_PASS" ]; then
            echo -e "${RED}Error: All fields are required.${NC}"
            continue
        fi

        # --- Pre-flight check for credentials ---
        echo -e "${CYAN}   > Testing credentials for ${FOREIGN_USER}@${FOREIGN_IP}...${NC}"
        
        SSH_LOG_FILE=$(mktemp)
        
        if SSHPASS="$FOREIGN_PASS" sshpass -e ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 -o BatchMode=yes -p "${FOREIGN_PORT}" "${FOREIGN_USER}@${FOREIGN_IP}" "echo -n TunnelAuthOK" > "$SSH_LOG_FILE" 2>&1; then
            if grep -q "TunnelAuthOK" "$SSH_LOG_FILE"; then
                echo -e "${GREEN}[✔] Credentials are correct.${NC}"
                rm -f "$SSH_LOG_FILE"
            else
                echo -e "${RED}Error: Connection test was inconclusive (likely a server-side issue).${NC}"
                echo -e "${YELLOW}Server response: $(cat "$SSH_LOG_FILE")${NC}"
                rm -f "$SSH_LOG_FILE"
                read -p "Try again? (y/n): " choice
                [[ "$choice" == "y" || "$choice" == "Y" ]] || exit 1
                continue
            fi
        else
            echo -e "${RED}Error: Authentication failed!${NC}"
            echo -e "${YELLOW}Please double-check your IP, username, port, and especially your password.${NC}"
            SANITIZED_OUTPUT=$(cat "$SSH_LOG_FILE" | sed "s/$FOREIGN_PASS/********/g")
            echo -e "${YELLOW}Server response: $SANITIZED_OUTPUT${NC}"
            rm -f "$SSH_LOG_FILE"
            read -p "Try again? (y/n): " choice
            [[ "$choice" == "y" || "$choice" == "Y" ]] || exit 1
            continue
        fi
        
        # --- End of Pre-flight check ---

        (
            export SSHPASS="$FOREIGN_PASS"
            sshpass -e ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
                -p "${FOREIGN_PORT}" \
                -o ServerAliveInterval=60 -fN -D ${PROXY_PORT} "${FOREIGN_USER}@${FOREIGN_IP}"
        ) > /tmp/elaheh-tunnel.log 2>&1 &
        
        spinner $! "   > Establishing secure tunnel to ${FOREIGN_IP}:${FOREIGN_PORT}..."
        
        sleep 1

        TUNNEL_PID=$(pgrep -f "ssh.*-D ${PROXY_PORT}" || true)
        if [ -z "$TUNNEL_PID" ]; then
            echo -e "${RED}Error: Failed to establish the tunnel process even with correct credentials.${NC}"
            echo -e "${YELLOW}This could be a server-side configuration issue preventing tunnels.${NC}"
            echo -e "${YELLOW}Details: $(cat /tmp/elaheh-tunnel.log)${NC}"
            rm -f /tmp/elaheh-tunnel.log
            read -p "Try again? (y/n): " choice
            [[ "$choice" == "y" || "$choice" == "Y" ]] || exit 1
            continue
        fi

        echo -e "${CYAN}   > Verifying tunnel connectivity...${NC}"
        if curl --proxy "${PROXY_URL}" --connect-timeout 10 -s "https://api.github.com" > /dev/null; then
            echo -e "${GREEN}[✔] Tunnel established and verified successfully (PID: $TUNNEL_PID).${NC}"
            break
        else
            echo -e "${RED}Error: Tunnel connection test failed. Proxy is not responding.${NC}"
            kill "$TUNNEL_PID" >/dev/null 2>&1 || true
            read -p "Try again? (y/n): " choice
            [[ "$choice" == "y" || "$choice" == "Y" ]] || exit 1
        fi
    done
    
    echo -e "${CYAN}   > Routing installation traffic (curl, git, etc.) through the tunnel...${NC}"
    export HTTPS_PROXY="${PROXY_URL}"
    export HTTP_PROXY="${PROXY_URL}"
    export ALL_PROXY="${PROXY_URL}"
}

cleanup() {
    if [ -n "$TUNNEL_PID" ]; then
        echo -e "\n${CYAN}[i] Terminating SSH tunnel (PID: $TUNNEL_PID)...${NC}"
        kill "$TUNNEL_PID" >/dev/null 2>&1 || true
    fi
    
    if [[ "$ROLE" == "iran" ]]; then
        echo -e "${CYAN}[i] Cleaning up proxy configurations and temporary files...${NC}"
        unset HTTPS_PROXY HTTP_PROXY ALL_PROXY
        
        pnpm config delete proxy >/dev/null 2>&1 || true
        pnpm config delete https-proxy >/dev/null 2>&1 || true
        pnpm config delete registry >/dev/null 2>&1 || true
        
        rm -f /tmp/elaheh-tunnel.log

        if command -v apt-get >/dev/null; then
             ($SUDO apt-get remove --purge -y -qq sshpass >/dev/null 2>&1) &
             spinner $! "   > Uninstalling tunnel dependency..."
        elif command -v dnf >/dev/null; then
             ($SUDO dnf remove -y -q sshpass >/dev/null 2>&1) &
             spinner $! "   > Uninstalling tunnel dependency..."
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
echo "   Version 2.5.0 (SSH Pre-flight Check)"
echo "   'Secure. Fast. Uncensored.'"
echo "################################################################"
echo -e "${NC}"

SUDO=""
if [ "$EUID" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    echo -e "${RED}Error: Please run as root.${NC}"
    exit 1
  fi
fi

echo -e "${YELLOW}Select Server Location/Role:${NC}"
echo "1) Foreign Server (Upstream - Germany, Finland, etc.)"
echo "2) Iran Server (Edge - User Access)"
read -p "Select [1 or 2]: " ROLE_CHOICE

if [[ "$ROLE_CHOICE" == *"2"* || "$ROLE_CHOICE" == *"۲"* ]]; then
    ROLE="iran"
    echo -e "${GREEN}>> Role Selected: IRAN Server (Edge).${NC}"
    install_sshpass
    start_tunnel
else
    ROLE="external"
    echo -e "${GREEN}>> Role Selected: FOREIGN Server (Upstream).${NC}"
fi

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

echo -e "\n${GREEN}--- STEP 2: INSTALLING NODE.JS & PNPM ---${NC}"
NODE_VERSION="v22.12.0"
NODE_DIST="node-${NODE_VERSION}-linux-x64"

(curl -L --retry 3 --retry-delay 5 "https://nodejs.org/dist/${NODE_VERSION}/${NODE_DIST}.tar.xz" | tar -xJ -C /tmp) &
spinner $! "   > Downloading Node.js ${NODE_VERSION}..."

($SUDO rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx && \
 $SUDO cp -R /tmp/${NODE_DIST}/* /usr/local/ && \
 $SUDO rm -rf /tmp/${NODE_DIST}) &
spinner $! "   > Installing Node.js..."

# Install pnpm using its official script
(curl -fsSL https://get.pnpm.io/install.sh | sh -) &
spinner $! "   > Installing pnpm package manager..."
export PNPM_HOME="/root/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

# Configure pnpm AFTER installation, only for Iran servers
if [[ "$ROLE" == "iran" ]]; then
    echo -e "${CYAN}   > Configuring pnpm for sanction bypass...${NC}"
    (pnpm config set proxy "${PROXY_URL}" && \
     pnpm config set https-proxy "${PROXY_URL}" && \
     pnpm config set registry "https://registry.npmjs.org/") &> /dev/null
fi

(pnpm add -g pm2 @angular/cli) &
spinner $! "   > Installing global tools (pm2, @angular/cli)..."

echo -e "\n${GREEN}--- STEP 3: SETTING UP PROJECT ---${NC}"
INSTALL_DIR="/opt/elaheh-project"
$SUDO rm -rf "$INSTALL_DIR"
$SUDO mkdir -p "$INSTALL_DIR" && $SUDO chown -R $USER:$USER "$INSTALL_DIR"
cd "$INSTALL_DIR"

(git clone --depth 1 "https://github.com/ehsanking/Elaheh-Project.git" .) &
spinner $! "   > Cloning repository from GitHub..."

echo "legacy-peer-deps=true" > .npmrc
(pnpm install) &
spinner $! "   > Installing dependencies with pnpm..."

(pnpm run build) &
spinner $! "   > Compiling production-ready application..."

DIST_PATH="$INSTALL_DIR/dist/project-elaheh/browser"
if [ ! -d "$DIST_PATH" ]; then 
    echo -e "${RED}[!] Build Failed! Output directory not found.${NC}"
    exit 1
fi

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
exit 0
