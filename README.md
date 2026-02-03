# Project Elaheh - Advanced Tunneling Management System

> **"اینترنت آزاد برای همه یا هیچکس"**  
> **"Free Internet for everyone or no one."**

**Version:** 1.0.3  
**Creator:** EHSANKiNG

Project Elaheh is a sophisticated, web-based management dashboard designed to facilitate secure, high-performance tunneling between domestic servers (Edge/Iran) and foreign upstream servers.

![Dashboard Preview](https://picsum.photos/800/400?grayscale)

## Installation Guide

### Method 1: The Wizard (Recommended)
1. Run the app locally or on your PC (`npm start`).
2. Go to the **Setup Wizard**.
3. At the final step, copy the **Direct Install Command**.
4. Paste it into your VPS terminal. This method avoids all GitHub 404 errors by creating the script directly on your server.

### Method 2: Manual "One-Liner" (If Repo is Public)
If you have pushed the code to a public repository:
```bash
bash <(curl -Ls https://raw.githubusercontent.com/EHSANKiNG/project-elaheh/main/install.sh)
```

### Method 3: Emergency Fallback (Fix for 404 Error)
If `curl` fails with a 404 error, copy and paste this entire block into your server terminal to create the installer manually:

```bash
cat << 'EOF' > install.sh
#!/bin/bash
# Project Elaheh Installer v1.0.3
set -e
GREEN='\033[0;32m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then echo "Please run as root"; exit 1; fi

if [ -f /etc/os-release ]; then . /etc/os-release; OS=$NAME; fi
echo -e "${GREEN}[+] Detected OS: $OS${NC}"

echo -e "${GREEN}[+] Installing dependencies...${NC}"
if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq && apt-get install -y -qq curl git unzip
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]]; then
    dnf install -y -q curl git unzip
fi

if ! command -v node &> /dev/null; then
    echo -e "${GREEN}[+] Installing Node.js 20...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then apt-get install -y -qq nodejs; else dnf install -y -q nodejs; fi
fi

INSTALL_DIR="/opt/project-elaheh"
REPO_URL="https://github.com/EHSANKiNG/project-elaheh.git"

if [ -d "$INSTALL_DIR" ]; then
    cd "$INSTALL_DIR" && git pull origin main
else
    git clone "$REPO_URL" "$INSTALL_DIR" && cd "$INSTALL_DIR"
fi

npm install --silent

ROLE="unknown"
KEY=""
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --role) ROLE="$2"; shift ;;
        --key) KEY="$2"; shift ;;
        *) shift ;;
    esac
done

mkdir -p src/assets
cat <<EOF > src/assets/server-config.json
{ "role": "$ROLE", "key": "$KEY", "installedAt": "$(date)" }
EOF

echo -e "${GREEN}Installation Complete! Role: $ROLE${NC}"
npm start
EOF

chmod +x install.sh
./install.sh
```

## Usage
1. Open the panel at `http://<YOUR_SERVER_IP>:4200`.
2. Login with `admin` / `admin`.
3. Configure your users and tunnels.

## License
MIT License. Created by **EHSANKiNG**.
