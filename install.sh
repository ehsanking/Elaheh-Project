#!/bin/bash

# Project Elaheh Installer
# Version 2.1.0 (Fix: SSL Bootstrap & CLI)
# Author: EHSANKiNG

set -e

# Colors
GREEN='\033[1;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "################################################################"
echo "   Project Elaheh - Stealth Tunnel Management System"
echo "   Version 2.1.0"
echo "   'اینترنت آزاد برای همه یا هیچکس'"
echo "################################################################"
echo -e "${NC}"

# 1. Check root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: Please run as root (sudo su)${NC}"
  exit 1
fi

# 2. Input Collection (Domain & Ports)
DOMAIN=""
EMAIL=""
EXTRA_PORTS=""

# Parse Args
while [ "$#" -gt 0 ]; do
  case "$1" in
    --domain) DOMAIN="$2"; shift 2;;
    --email) EMAIL="$2"; shift 2;;
    --role) ROLE="$2"; shift 2;;
    --key) KEY="$2"; shift 2;;
    *) shift 1;;
  esac
done

if [ -z "$DOMAIN" ]; then
    echo -e "${YELLOW}Enter your Domain (A record must point to this IP):${NC}"
    read -p "Domain: " DOMAIN
fi

if [ -z "$EMAIL" ]; then
    echo -e "${YELLOW}Enter Email for SSL (Let's Encrypt):${NC}"
    read -p "Email: " EMAIL
fi

echo -e "${YELLOW}Do you want to open extra ports for VLESS/VMess? (Optional, default is 443 only)${NC}"
read -p "Extra Ports (comma separated, e.g. 8080,2053 or leave empty): " EXTRA_PORTS

# 3. Detect OS & Install Dependencies
echo -e "${GREEN}[+] Installing System Dependencies (Nginx, Certbot)...${NC}"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
fi

install_deps() {
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        export DEBIAN_FRONTEND=noninteractive
        # Fix apt locks
        rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock
        apt-get update -y -qq
        apt-get install -y -qq curl git unzip ufw xz-utils grep sed nginx certbot python3-certbot-nginx socat lsof
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        dnf install -y -q curl git unzip firewalld grep sed nginx certbot python3-certbot-nginx socat lsof
    fi
}
install_deps

# 4. Node.js Installation
echo -e "${GREEN}[+] Installing Node.js Environment...${NC}"
NODE_VERSION="v20.15.1"
MACHINE_ARCH=$(uname -m)
if [ "${MACHINE_ARCH}" == "x86_64" ]; then NODE_ARCH="x64"; elif [ "${MACHINE_ARCH}" == "aarch64" ]; then NODE_ARCH="arm64"; else echo -e "${RED}Error: Arch not supported.${NC}"; exit 1; fi

# Check if node is already installed
if ! command -v node &> /dev/null; then
    DOWNLOAD_URL="https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz"
    curl -L "${DOWNLOAD_URL}" -o "/tmp/node.tar.xz"
    tar -xf "/tmp/node.tar.xz" -C /usr/local --strip-components=1
    rm "/tmp/node.tar.xz"
fi

if ! command -v pm2 &> /dev/null; then npm install -g pm2; fi

# 5. Setup Project Files
INSTALL_DIR="/opt/elaheh-project"
REPO_URL="https://github.com/ehsanking/Elaheh-Project.git"

if [ -d "$INSTALL_DIR" ]; then
    echo -e "${GREEN}[+] Updating existing installation...${NC}"
    cd "$INSTALL_DIR"
    git reset --hard
    git pull origin main
else
    echo -e "${GREEN}[+] Cloning repository...${NC}"
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

PROJECT_NAME=$(node -p "require('./package.json').name")
DIST_PATH="$INSTALL_DIR/dist/$PROJECT_NAME/browser"
mkdir -p "$DIST_PATH/assets"

# Save Config
cat <<EOF > "$DIST_PATH/assets/server-config.json"
{
  "role": "${ROLE:-external}",
  "key": "${KEY}",
  "domain": "${DOMAIN}",
  "installedAt": "$(date)"
}
EOF

# 6. Obtain SSL (The FIX: Standalone Mode)
# We must stop Nginx first to free port 80 for Certbot's standalone server
echo -e "${GREEN}[+] Stopping Nginx to obtain SSL certificate...${NC}"
systemctl stop nginx || true

echo -e "${GREEN}[+] Requesting Certificate for ${DOMAIN}...${NC}"
# Use standalone mode. It spins up a temporary webserver on port 80.
certbot certonly --standalone --preferred-challenges http \
    --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}" --force-renewal

# Check if certs exist
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    echo -e "${RED}[!] Critical Error: SSL Certificate could not be obtained.${NC}"
    echo -e "${RED}Please check that your Domain A record points to this server IP and Port 80 is open.${NC}"
    exit 1
fi

# 7. Configure Nginx (With Valid SSL Paths)
echo -e "${GREEN}[+] Configuring Nginx...${NC}"

APP_PORT=3000

# Write configuration now that certs exist
cat <<EOF > /etc/nginx/sites-available/elaheh
server {
    listen 80;
    server_name ${DOMAIN};
    # Force HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    # Modern SSL Config
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root ${DIST_PATH};
    index index.html;

    # 1. Main Application (Panel / Landing)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 2. API Proxy (Internal)
    location /api {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # 3. VLESS/VMess WebSocket Path (Stealth Mode)
    # Forward to Xray/SingBox core (default 10000)
    location /ws {
        if (\$http_upgrade != "websocket") {
            return 404;
        }
        proxy_redirect off;
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

# Enable Site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/elaheh /etc/nginx/sites-enabled/

# 8. Firewall Configuration
SSH_PORT="22"
if [ -f /etc/ssh/sshd_config ]; then
    DETECTED_PORT=$(grep "^Port" /etc/ssh/sshd_config | awk '{print $2}' | head -n 1)
    [ ! -z "$DETECTED_PORT" ] && SSH_PORT=$DETECTED_PORT
fi

echo -e "${GREEN}[+] Configuring Firewall...${NC}"

if command -v ufw &> /dev/null; then
    ufw allow ${SSH_PORT}/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    if [ ! -z "$EXTRA_PORTS" ]; then
        IFS=',' read -ra ADDR <<< "$EXTRA_PORTS"
        for i in "${ADDR[@]}"; do ufw allow "$i"/tcp; done
    fi
    echo "y" | ufw enable
elif command -v firewall-cmd &> /dev/null; then
    systemctl start firewalld
    firewall-cmd --permanent --add-port=${SSH_PORT}/tcp
    firewall-cmd --permanent --add-port=80/tcp
    firewall-cmd --permanent --add-port=443/tcp
    if [ ! -z "$EXTRA_PORTS" ]; then
        IFS=',' read -ra ADDR <<< "$EXTRA_PORTS"
        for i in "${ADDR[@]}"; do firewall-cmd --permanent --add-port="$i"/tcp; done
    fi
    firewall-cmd --reload
fi

# Start Nginx
systemctl start nginx

# 9. Start Application (Local Port)
echo -e "${GREEN}[+] Starting Application on internal port ${APP_PORT}...${NC}"

# Check for port conflict on internal app port
if lsof -Pi :${APP_PORT} -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}[!] Internal port ${APP_PORT} is busy. Cleaning up...${NC}"
    kill -9 $(lsof -t -i:${APP_PORT}) || true
fi

pm2 stop elaheh-app 2>/dev/null || true
pm2 delete elaheh-app 2>/dev/null || true
pm2 serve "$DIST_PATH" ${APP_PORT} --name "elaheh-app" --spa
pm2 save --force
pm2 startup | tail -n 1 | bash || true

# 10. CLI Tool (Creating it BEFORE final success message)
echo -e "${GREEN}[+] Installing 'elaheh' CLI tool...${NC}"
cat <<EOF > /usr/local/bin/elaheh
#!/bin/bash
INSTALL_DIR="/opt/elaheh-project"
update_app() {
    echo "Updating..."
    cd "\$INSTALL_DIR" && git pull origin main
    pm2 restart elaheh-app
    echo "Update Complete."
}
renew_ssl() {
    echo "Stopping Nginx for standalone renewal..."
    systemctl stop nginx
    certbot renew
    systemctl start nginx
    echo "SSL Renewed."
}
echo "--------------------------"
echo " Elaheh Management Tool"
echo "--------------------------"
echo "1. Update Application"
echo "2. Restart Nginx"
echo "3. Renew SSL Certificates"
echo "4. View Application Logs"
echo "5. Exit"
read -p "Select option: " choice
case "\$choice" in
  1) update_app ;;
  2) systemctl restart nginx; echo "Nginx Restarted." ;;
  3) renew_ssl ;;
  4) pm2 logs elaheh-app ;;
  5) exit 0 ;;
  *) echo "Invalid option" ;;
esac
EOF
chmod +x /usr/local/bin/elaheh

# 11. Final Output
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   INSTALLATION COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "   Website:  https://${DOMAIN}"
echo -e "   Panel:    Log in via the 'Client Portal' button."
echo -e "   VLESS:    Port 443 (TLS enabled)"
echo -e "   CLI:      Type 'elaheh' to manage."
echo ""
echo -e "${YELLOW}Note: If 'elaheh' command is not found immediately, type: source ~/.bashrc or re-login.${NC}"
