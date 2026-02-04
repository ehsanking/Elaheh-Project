
#!/bin/bash

# Project Elaheh Installer
# Version 1.0.0 (Stable Release - Freedom Edition)
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
echo "   Version 1.0.0 (Stable)"
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

# 3. Detect OS & System Prep
echo -e "${GREEN}[+] Preparing System...${NC}"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
fi

install_deps() {
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        export DEBIAN_FRONTEND=noninteractive
        rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock
        apt-get update -y -qq
        apt-get install -y -qq curl git unzip ufw xz-utils grep sed nginx certbot python3-certbot-nginx socat lsof build-essential
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        dnf upgrade -y --refresh
        dnf install -y -q curl git unzip firewalld grep sed nginx certbot python3-certbot-nginx socat lsof tar make
    fi
}
install_deps

# 4. Swap Setup
TOTAL_MEM=$(grep MemTotal /proc/meminfo | awk '{print $2}')
if [ "$TOTAL_MEM" -lt 2000000 ]; then
    if [ ! -f /swapfile ]; then
        echo -e "${YELLOW}[i] Low RAM detected. Creating Swap...${NC}"
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
fi

# 5. Cleanup Ports
systemctl stop nginx || true
if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null ; then kill -9 $(lsof -t -i:80) || true; fi

# 6. SSL
if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo -e "${GREEN}[+] Requesting SSL...${NC}"
    certbot certonly --standalone --preferred-challenges http --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}" || true
fi

# 7. Nginx Config
echo -e "${GREEN}[+] Configuring Nginx...${NC}"
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
    
    root /opt/elaheh-project/dist/project-elaheh/browser;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /ws {
        if (\$http_upgrade != "websocket") { return 404; }
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

# 8. Node.js
NODE_VERSION="v22.12.0"
if ! command -v node &> /dev/null || [[ $(node -v) != "v22.12.0" ]]; then
    echo -e "${YELLOW}[i] Installing Node.js ${NODE_VERSION}...${NC}"
    MACHINE_ARCH=$(uname -m)
    if [ "${MACHINE_ARCH}" == "x86_64" ]; then NODE_ARCH="x64"; else NODE_ARCH="arm64"; fi
    curl -L "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" -o "/tmp/node.tar.xz"
    tar -xf "/tmp/node.tar.xz" -C /usr/local --strip-components=1
fi
npm install -g pm2 @angular/cli || true

INSTALL_DIR="/opt/elaheh-project"
if [ -d "$INSTALL_DIR" ]; then
    cd "$INSTALL_DIR"
    git reset --hard
    git pull origin main
else
    git clone "https://github.com/ehsanking/Elaheh-Project.git" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# 9. Project Configuration
echo -e "${GREEN}[+] Configuring Project...${NC}"

# 9.1 Clean Slate
rm -rf node_modules package-lock.json dist

# 9.2 Package.json (Angular 19 + Zone.js)
cat <<EOF > package.json
{
  "name": "project-elaheh",
  "version": "1.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build"
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "^19.0.0",
    "@angular/common": "^19.0.0",
    "@angular/compiler": "^19.0.0",
    "@angular/core": "^19.0.0",
    "@angular/forms": "^19.0.0",
    "@angular/platform-browser": "^19.0.0",
    "@angular/router": "^19.0.0",
    "@google/genai": "*",
    "chart.js": "^4.4.1",
    "qrcode": "^1.5.3",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.15.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^19.0.0",
    "@angular/cli": "^19.0.0",
    "@angular/compiler-cli": "^19.0.0",
    "@types/node": "^18.18.0",
    "@types/qrcode": "^1.5.5",
    "typescript": "~5.6.2"
  }
}
EOF

# 9.3 Angular JSON (With Zone.js)
cat <<EOF > angular.json
{
  "\$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "project-elaheh": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/project-elaheh/browser",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.css"],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                { "type": "initial", "maximumWarning": "4mb", "maximumError": "6mb" }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        }
      }
    }
  }
}
EOF

# 9.4 TSConfigs
cat <<EOF > tsconfig.json
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"],
    "skipLibCheck": true
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
EOF

cat <<EOF > tsconfig.app.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "types": ["node"]
  },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"]
}
EOF

# 9.5 Main.ts (Reverted to Zone.js for stability)
cat <<EOF > src/main.ts
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZoneChangeDetection } from '@angular/core';
import { AppComponent } from './app.component';

// Type shim
declare var process: any;

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true })
  ]
}).catch((err) => console.error(err));
EOF

# 10. Build
echo -e "${GREEN}[+] Installing Dependencies (Clean Install)...${NC}"
npm install --legacy-peer-deps --loglevel error

echo -e "${GREEN}[+] Building Application...${NC}"
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

DIST_PATH="$INSTALL_DIR/dist/project-elaheh/browser"
if [ ! -d "$DIST_PATH" ]; then
    echo -e "${RED}[!] Build Failed!${NC}"
    exit 1
fi

mkdir -p "$DIST_PATH/assets"
cat <<EOF > "$DIST_PATH/assets/server-config.json"
{
  "role": "${ROLE:-external}",
  "key": "${KEY}",
  "domain": "${DOMAIN}",
  "installedAt": "$(date)"
}
EOF

# 11. Finalize
echo -e "${GREEN}[+] Starting Services...${NC}"
pm2 delete elaheh-app 2>/dev/null || true
pm2 serve "$DIST_PATH" ${APP_PORT} --name "elaheh-app" --spa
pm2 save --force
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# 12. Firewall
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp; ufw allow 80/tcp; ufw allow 443/tcp; echo "y" | ufw enable
elif command -v firewall-cmd &> /dev/null; then
    systemctl start firewalld
    firewall-cmd --permanent --add-port=22/tcp
    firewall-cmd --permanent --add-port=80/tcp
    firewall-cmd --permanent --add-port=443/tcp
    firewall-cmd --reload
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   INSTALLATION SUCCESSFUL!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "   Panel URL: https://${DOMAIN}"
echo ""
