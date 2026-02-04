#!/bin/bash

# Project Elaheh Installer
# Version 2.3.1 (Hotfix: Port Detection & PM2)
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
echo "   Version 2.3.1"
echo "   'اینترنت آزاد برای همه یا هیچکس'"
echo "################################################################"
echo -e "${NC}"

# 1. Check root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: Please run as root (sudo su)${NC}"
  exit 1
fi

# 2. Input Collection
DOMAIN=""
EMAIL=""
EXTRA_PORTS=""

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
    EMAIL="admin@${DOMAIN}"
fi

# 3. Detect OS & Install Dependencies
echo -e "${GREEN}[+] Installing System Dependencies...${NC}"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
fi

install_deps() {
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        export DEBIAN_FRONTEND=noninteractive
        rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock
        apt-get update -y -qq
        apt-get install -y -qq curl git unzip ufw xz-utils grep sed nginx certbot python3-certbot-nginx socat lsof
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        dnf install -y -q curl git unzip firewalld grep sed nginx certbot python3-certbot-nginx socat lsof
    fi
}
install_deps

# 4. Cleanup Previous Failed Installs
echo -e "${GREEN}[+] Cleaning up potential conflicts...${NC}"
systemctl stop nginx || true
rm -f /etc/nginx/sites-enabled/elaheh
rm -f /etc/nginx/sites-available/elaheh
rm -f /etc/nginx/sites-enabled/default

# Kill any process hogging port 80
if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}[!] Port 80 is busy. Cleaning up...${NC}"
    kill -9 $(lsof -t -i:80) || true
fi

# 5. Obtain SSL (Smart Standalone Mode)
echo -e "${GREEN}[+] Checking SSL Certificates for ${DOMAIN}...${NC}"

if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo -e "${YELLOW}[i] Certificate already exists. Skipping request.${NC}"
else
    echo -e "${YELLOW}[i] Attempting to secure ${DOMAIN} and www.${DOMAIN}...${NC}"
    if certbot certonly --standalone --preferred-challenges http \
        --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}" -d "www.${DOMAIN}"; then
        echo -e "${GREEN}[✓] Certificate obtained for domain and subdomains.${NC}"
    else
        echo -e "${YELLOW}[!] Failed to get cert for www subdomain. Retrying for root domain only...${NC}"
        certbot certonly --standalone --preferred-challenges http \
            --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}"
    fi
fi

if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    echo -e "${RED}[!] CRITICAL ERROR: SSL Certificate could not be obtained.${NC}"
    echo -e "${RED}[!] Please ensure your Domain A record points to $(curl -s ifconfig.me) and Port 80 is open.${NC}"
    exit 1
fi

# 6. Configure Nginx
echo -e "${GREEN}[+] Configuring Nginx Reverse Proxy...${NC}"

APP_PORT=3000
cat <<EOF > /etc/nginx/sites-available/elaheh
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
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /opt/elaheh-project/dist/project-elaheh/browser;
    index index.html;

    # 1. Main Application
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 2. API Proxy
    location /api {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # 3. VLESS/VMess WebSocket Path
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

ln -sf /etc/nginx/sites-available/elaheh /etc/nginx/sites-enabled/
systemctl restart nginx

# 7. Node.js & Project Setup
echo -e "${GREEN}[+] Setting up Application Core...${NC}"
NODE_VERSION="v20.15.1"
if ! command -v node &> /dev/null; then
    MACHINE_ARCH=$(uname -m)
    if [ "${MACHINE_ARCH}" == "x86_64" ]; then NODE_ARCH="x64"; else NODE_ARCH="arm64"; fi
    curl -L "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" -o "/tmp/node.tar.xz"
    tar -xf "/tmp/node.tar.xz" -C /usr/local --strip-components=1
fi
if ! command -v pm2 &> /dev/null; then npm install -g pm2; fi

INSTALL_DIR="/opt/elaheh-project"
if [ -d "$INSTALL_DIR" ]; then
    cd "$INSTALL_DIR"
    git reset --hard
    git pull origin main
else
    git clone "https://github.com/ehsanking/Elaheh-Project.git" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

PROJECT_NAME=$(node -p "require('./package.json').name")
DIST_PATH="$INSTALL_DIR/dist/$PROJECT_NAME/browser"
mkdir -p "$DIST_PATH/assets"

cat <<EOF > "$DIST_PATH/assets/server-config.json"
{
  "role": "${ROLE:-external}",
  "key": "${KEY}",
  "domain": "${DOMAIN}",
  "installedAt": "$(date)"
}
EOF

# 8. Start PM2
echo -e "${GREEN}[+] Starting Backend Services...${NC}"
pm2 stop elaheh-app 2>/dev/null || true
pm2 delete elaheh-app 2>/dev/null || true
pm2 serve "$DIST_PATH" ${APP_PORT} --name "elaheh-app" --spa
pm2 save --force
# Fixed: Explicitly set up startup instead of relying on pipe output parsing which was failing
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# 9. Firewall (FIXED: Robust Port Detection)
echo -e "${GREEN}[+] Securing Ports...${NC}"
# Use a more robust way to default to 22 if grep returns nothing
DETECTED_SSH=$(grep "^Port" /etc/ssh/sshd_config 2>/dev/null | awk '{print $2}' | head -n 1)
SSH_PORT=${DETECTED_SSH:-22}

if command -v ufw &> /dev/null; then
    ufw allow ${SSH_PORT}/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    # Force enable without prompt
    echo "y" | ufw enable
elif command -v firewall-cmd &> /dev/null; then
    systemctl start firewalld
    firewall-cmd --permanent --add-port=${SSH_PORT}/tcp
    firewall-cmd --permanent --add-port=80/tcp
    firewall-cmd --permanent --add-port=443/tcp
    firewall-cmd --reload
fi

# 10. CLI Tool (Guaranteed Installation)
echo -e "${GREEN}[+] Installing 'elaheh' Command Line Tool...${NC}"
CLI_SCRIPT="#!/bin/bash
INSTALL_DIR=\"/opt/elaheh-project\"
RED='\033[0;31m'
GREEN='\033[1;32m'
NC='\033[0m'

update_app() {
    echo \"Updating...\"
    cd \"\$INSTALL_DIR\" && git pull origin main
    pm2 restart elaheh-app
    echo -e \"\${GREEN}Update Complete.\${NC}\"
}

renew_ssl() {
    echo \"Stopping Nginx...\"
    systemctl stop nginx
    certbot renew
    systemctl start nginx
    echo -e \"\${GREEN}SSL Renewed.\${NC}\"
}

clear
echo -e \"\${GREEN} Elaheh Management Console\${NC}\"
echo \"1. Update Panel & Core\"
echo \"2. Restart Services\"
echo \"3. Renew SSL Certificates\"
echo \"4. View Logs\"
echo \"5. Exit\"
read -p \"Select option: \" choice
case \"\$choice\" in
  1) update_app ;;
  2) systemctl restart nginx; pm2 restart elaheh-app; echo \"Services Restarted.\" ;;
  3) renew_ssl ;;
  4) pm2 logs elaheh-app --lines 50 ;;
  5) exit 0 ;;
  *) echo \"Invalid option\" ;;
esac"

echo "$CLI_SCRIPT" > /usr/local/bin/elaheh
chmod +x /usr/local/bin/elaheh
# Also create in /usr/bin to ensure it's in PATH immediately
cp /usr/local/bin/elaheh /usr/bin/elaheh

# 11. Final Output
PUBLIC_IP=$(curl -s ifconfig.me)
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   INSTALLATION SUCCESSFUL!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "   Panel URL: https://${DOMAIN}"
echo -e "   Admin Access: Click 'Client Portal' on the site."
echo -e "   Management: Type 'elaheh' in terminal."
echo ""
