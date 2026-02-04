#!/bin/bash

# Project Elaheh Installer
# Version 2.0.0 (Production Grade - Nginx/SSL/Port 443)
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
echo "   Version 2.0.0"
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

# 3. Detect OS & Install Dependencies (Nginx + Certbot)
echo -e "${GREEN}[+] Installing System Dependencies (Nginx, Certbot)...${NC}"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
fi

install_deps() {
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        export DEBIAN_FRONTEND=noninteractive
        apt-get update -y -qq
        apt-get install -y -qq curl git unzip ufw xz-utils grep sed nginx certbot python3-certbot-nginx socat
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        dnf install -y -q curl git unzip firewalld grep sed nginx certbot python3-certbot-nginx socat
    fi
}
install_deps

# 4. Node.js Installation
echo -e "${GREEN}[+] Installing Node.js Environment...${NC}"
NODE_VERSION="v20.15.1"
MACHINE_ARCH=$(uname -m)
if [ "${MACHINE_ARCH}" == "x86_64" ]; then NODE_ARCH="x64"; elif [ "${MACHINE_ARCH}" == "aarch64" ]; then NODE_ARCH="arm64"; else echo -e "${RED}Error: Arch not supported.${NC}"; exit 1; fi
DOWNLOAD_URL="https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz"
curl -L "${DOWNLOAD_URL}" -o "/tmp/node.tar.xz"
tar -xf "/tmp/node.tar.xz" -C /usr/local --strip-components=1
rm "/tmp/node.tar.xz"
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

# 6. Configure Nginx (Reverse Proxy & Port Sharing)
echo -e "${GREEN}[+] Configuring Nginx for ${DOMAIN}...${NC}"

# Internal App Port (Not exposed to internet)
APP_PORT=3000

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

    root ${DIST_PATH};
    index index.html;

    # SSL Config (Placeholders - Certbot will update)
    # ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    # 1. Main Application (The Camouflage Site / Panel)
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
    # Traffic to /vless or /vmess is forwarded to the Xray core port (e.g., 10000)
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
        # Show real IP in logs
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Enable Site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/elaheh /etc/nginx/sites-enabled/
systemctl stop nginx

# 7. Obtain SSL
echo -e "${GREEN}[+] Obtaining SSL Certificate...${NC}"
certbot --nginx --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}" --redirect || true

systemctl start nginx

# 8. Firewall Configuration (Standard Ports)
SSH_PORT="22"
if [ -f /etc/ssh/sshd_config ]; then
    DETECTED_PORT=$(grep "^Port" /etc/ssh/sshd_config | awk '{print $2}' | head -n 1)
    [ ! -z "$DETECTED_PORT" ] && SSH_PORT=$DETECTED_PORT
fi

echo -e "${GREEN}[+] Configuring Firewall (Ports: 80, 443, ${SSH_PORT})...${NC}"

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

# 9. Start Application (Local Port)
echo -e "${GREEN}[+] Starting Application on internal port ${APP_PORT}...${NC}"
pm2 stop elaheh-app 2>/dev/null || true
pm2 delete elaheh-app 2>/dev/null || true
# Note: We bind to localhost only if possible, but serving on 0.0.0.0:3000 is blocked by firewall anyway
pm2 serve "$DIST_PATH" ${APP_PORT} --name "elaheh-app" --spa
pm2 save --force
pm2 startup | tail -n 1 | bash || true

# 10. CLI Tool
cat <<EOF > /usr/local/bin/elaheh
#!/bin/bash
INSTALL_DIR="/opt/elaheh-project"
update_app() {
    cd "\$INSTALL_DIR" && git pull origin main
    pm2 restart elaheh-app
    echo "Updated."
}
echo "Elaheh Management Tool"
echo "1. Update App"
echo "2. Restart Nginx"
echo "3. Renew SSL"
read -p "Select: " choice
case "\$choice" in
  1) update_app ;;
  2) systemctl restart nginx; echo "Nginx Restarted." ;;
  3) certbot renew --force-renewal; echo "SSL Renewed." ;;
esac
EOF
chmod +x /usr/local/bin/elaheh

# 11. Final Output
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   INSTALLATION COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "   Website:  https://${DOMAIN}"
echo -e "   Panel:    Log in via the 'Client Portal' button on the site."
echo -e "   VLESS:    Port 443 (TLS enabled)"
echo -e "   Camouflage: Active (Corporate Landing Page)"
echo ""
