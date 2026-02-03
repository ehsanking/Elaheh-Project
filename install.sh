#!/bin/bash

# Project Elaheh Installer
# Version 1.2.1 (Robust PM2 & CLI)
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
echo "   Project Elaheh - Tunnel Management System"
echo "   Version 1.2.1"
echo "   'اینترنت آزاد برای همه یا هیچکس'"
echo "################################################################"
echo -e "${NC}"

# 1. Check root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: Please run as root (sudo su)${NC}"
  exit 1
fi

# 2. Detect OS & Install Basic Dependencies
echo -e "${GREEN}[+] Detecting OS and installing basics...${NC}"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
fi

if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get install -y -qq curl git unzip ufw
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"Fedora"* ]]; then
    dnf install -y -q curl git unzip firewalld
fi

# 3. Install Node.js 20 & NPM
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo -e "${GREEN}[+] Node.js/NPM missing. Installing Node.js 20 LTS...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt-get install -y -qq nodejs
    else
        dnf install -y -q nodejs
    fi
else
    echo -e "${GREEN}[+] Node.js ($(node -v)) and NPM ($(npm -v)) are already installed.${NC}"
fi

# 4. Install PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${GREEN}[+] Installing PM2 process manager...${NC}"
    npm install -g pm2
fi

# 5. Setup Directory & Clone
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

# 6. Install Project Dependencies
echo -e "${GREEN}[+] Installing NPM packages...${NC}"
npm install --silent --unsafe-perm

# 7. Parse Arguments & Save Configuration
ROLE="unknown"
KEY=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    --role) ROLE="$2"; shift 2;;
    --key) KEY="$2"; shift 2;;
    *) shift 1;;
  esac
done

mkdir -p src/assets
echo -e "${GREEN}[+] Saving configuration...${NC}"
cat <<EOF > src/assets/server-config.json
{
  "role": "$ROLE",
  "key": "$KEY",
  "installedAt": "$(date)"
}
EOF

# 8. Set Initial Port & Configure Firewall
PANEL_PORT=4200
CONF_FILE="$INSTALL_DIR/elaheh.conf"
echo "PORT=$PANEL_PORT" > "$CONF_FILE"

echo -e "${GREEN}[+] Configuring firewall to allow port ${PANEL_PORT}...${NC}"
if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    if command -v ufw &> /dev/null; then
        ufw allow ${PANEL_PORT}/tcp > /dev/null
        yes | ufw enable > /dev/null
    fi
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"Fedora"* ]]; then
    if command -v firewall-cmd &> /dev/null; then
        systemctl start firewalld &> /dev/null
        systemctl enable firewalld &> /dev/null
        firewall-cmd --permanent --add-port=${PANEL_PORT}/tcp > /dev/null
        firewall-cmd --reload > /dev/null
    fi
fi

# 9. Start Application with PM2
echo -e "${GREEN}[+] Starting application on port ${PANEL_PORT}...${NC}"
pm2 stop elaheh-app 2>/dev/null || true
pm2 delete elaheh-app 2>/dev/null || true
NG_PATH="$INSTALL_DIR/node_modules/.bin/ng"
pm2 start "$NG_PATH" --name "elaheh-app" -- serve --host 0.0.0.0 --disable-host-check --port ${PANEL_PORT}
pm2 save --force
pm2 startup | grep "sudo" | bash || true

# 10. Create 'elaheh' CLI tool
echo -e "${GREEN}[+] Creating 'elaheh' management tool...${NC}"
cat <<'EOF' > /usr/local/bin/elaheh
#!/bin/bash

# Colors
GREEN='\033[1;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

INSTALL_DIR="/opt/elaheh-project"
CONF_FILE="$INSTALL_DIR/elaheh.conf"
OS_NAME=""

if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_NAME=$NAME
fi

update_app() {
    echo -e "${GREEN}Updating Project Elaheh...${NC}"
    cd "$INSTALL_DIR"
    git reset --hard
    git pull origin main
    npm install --silent --unsafe-perm
    pm2 restart elaheh-app
    echo -e "${GREEN}Update complete!${NC}"
}

uninstall_app() {
    echo -e "${YELLOW}Are you sure you want to uninstall Project Elaheh? This is irreversible. (y/N)${NC}"
    read -r confirm
    if [[ "$confirm" =~ ^[yY]$ ]]; then
        echo -e "${RED}Uninstalling...${NC}"
        pm2 stop elaheh-app 2>/dev/null || true
        pm2 delete elaheh-app 2>/dev/null || true
        pm2 unstartup > /dev/null
        pm2 save --force
        rm -rf "$INSTALL_DIR"
        rm -f /usr/local/bin/elaheh
        echo -e "${RED}Project Elaheh has been uninstalled.${NC}"
    else
        echo "Uninstall cancelled."
    fi
}

change_port() {
    source "$CONF_FILE"
    CURRENT_PORT=$PORT
    echo -e "${YELLOW}The current panel port is ${CURRENT_PORT}.${NC}"
    echo -e "${YELLOW}Enter the new port number (1-65535):${NC}"
    read -r new_port
    if ! [[ "$new_port" =~ ^[0-9]+$ ]] || [ "$new_port" -lt 1 ] || [ "$new_port" -gt 65535 ]; then
        echo -e "${RED}Invalid port number.${NC}"
        return
    fi

    echo -e "${GREEN}Changing port to ${new_port}...${NC}"

    # Update firewall
    if [[ "$OS_NAME" == *"Ubuntu"* ]] || [[ "$OS_NAME" == *"Debian"* ]]; then
        ufw delete allow ${CURRENT_PORT}/tcp > /dev/null
        ufw allow ${new_port}/tcp > /dev/null
    elif [[ "$OS_NAME" == *"CentOS"* ]] || [[ "$OS_NAME" == *"Rocky"* ]]; then
        firewall-cmd --permanent --remove-port=${CURRENT_PORT}/tcp > /dev/null
        firewall-cmd --permanent --add-port=${new_port}/tcp > /dev/null
        firewall-cmd --reload > /dev/null
    fi
    
    # Update config file
    echo "PORT=$new_port" > "$CONF_FILE"

    # Restart app with new port
    pm2 stop elaheh-app 2>/dev/null || true
    pm2 delete elaheh-app 2>/dev/null || true
    cd "$INSTALL_DIR"
    NG_PATH="$INSTALL_DIR/node_modules/.bin/ng"
    pm2 start "$NG_PATH" --name "elaheh-app" -- serve --host 0.0.0.0 --disable-host-check --port ${new_port}
    pm2 save --force
    
    PUBLIC_IP=$(curl -s https://api.ipify.org || curl -s https://ifconfig.me || echo "YOUR_SERVER_IP")
    echo -e "${GREEN}Port changed successfully!${NC}"
    echo -e "${GREEN}New Panel URL: http://${PUBLIC_IP}:${new_port}${NC}"
}

install_bbr() {
    echo -e "${GREEN}Installing BBR...${NC}"
    if sysctl net.ipv4.tcp_congestion_control | grep -q "bbr"; then
        echo -e "${GREEN}BBR is already enabled.${NC}"
        return
    fi
    
    echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
    sysctl -p
    
    if sysctl net.ipv4.tcp_congestion_control | grep -q "bbr"; then
        echo -e "${GREEN}BBR has been enabled successfully! A reboot is recommended.${NC}"
    else
        echo -e "${RED}Failed to enable BBR.${NC}"
    fi
}

show_menu() {
    echo -e "${CYAN}====================================${NC}"
    echo -e "${CYAN}   Project Elaheh Management Tool   ${NC}"
    echo -e "${CYAN}====================================${NC}"
    echo "1. Update Project"
    echo "2. Uninstall Project"
    echo "3. Change Panel Port"
    echo "4. Install BBR"
    echo "5. Exit"
    echo -e "------------------------------------"
    echo -n "Enter your choice: "
}

while true; do
    show_menu
    read -r choice
    case "$choice" in
        1) update_app; break ;;
        2) uninstall_app; break ;;
        3) change_port; break ;;
        4) install_bbr; break ;;
        5) break ;;
        *) echo -e "${RED}Invalid option. Please try again.${NC}";;
    esac
done
EOF

chmod +x /usr/local/bin/elaheh

# 11. Verify CLI tool creation
if [ -s /usr/local/bin/elaheh ]; then
    echo -e "${GREEN}[+] 'elaheh' management tool created successfully.${NC}"
else
    echo -e "${RED}[!] WARNING: Failed to create the 'elaheh' management tool. Manual intervention may be required.${NC}"
fi

# 12. Final Output
PUBLIC_IP=$(curl -s https://api.ipify.org || curl -s https://ifconfig.me || echo "YOUR_SERVER_IP")

echo ""
echo -e "${CYAN}================================================================${NC}"
echo -e "${GREEN}   INSTALLATION COMPLETED SUCCESSFULLY! ${NC}"
echo -e "${CYAN}================================================================${NC}"
echo ""
echo -e "   Access your Dashboard at:"
echo -e "   ${GREEN}👉 http://$PUBLIC_IP:${PANEL_PORT} 👈${NC}"
echo ""
echo -e "   ----------------------------------------"
echo -e "   To manage your installation, simply type:"
echo -e "   ${YELLOW}elaheh${NC}"
echo -e "   ----------------------------------------"
echo ""
echo -e "   To check logs run: ${YELLOW}pm2 logs elaheh-app${NC}"
echo -e "${CYAN}================================================================${NC}"
