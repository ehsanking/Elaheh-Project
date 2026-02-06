
#!/bin/bash

# Project Elaheh Installer
# Version 3.2.0 (Manual DNS Selector)
# Author: EHSANKiNG

set -e

# --- UI & Helper Functions ---

# Colors
GREEN='\033[1;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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
    fi
}

# --- DNS & Cleanup Management ---
ROLE="" 
SUDO=""

cleanup() {
    if [[ "$ROLE" == "iran" ]]; then
        echo -e "\n${CYAN}[i] Cleaning up temporary DNS configurations...${NC}"
        RESOLVED_BACKUP="/tmp/resolved.conf.bak"
        RESOLV_BACKUP="/tmp/resolv.conf.bak"

        if [[ -f "$RESOLVED_BACKUP" ]]; then
            ($SUDO mv "$RESOLVED_BACKUP" "/etc/systemd/resolved.conf" && $SUDO systemctl restart systemd-resolved) &> /dev/null &
            spinner $! "   > Restoring original DNS settings (systemd)..."
        fi

        if [[ -f "$RESOLV_BACKUP" ]]; then
            if lsattr "/etc/resolv.conf" 2>/dev/null | grep -q "i"; then
                $SUDO chattr -i "/etc/resolv.conf"
            fi
            ($SUDO mv "$RESOLV_BACKUP" "/etc/resolv.conf") &> /dev/null &
            spinner $! "   > Restoring original DNS settings (resolv.conf)..."
        fi
        echo -e "${GREEN}[+] Cleanup complete.${NC}"
    fi
}
trap cleanup EXIT INT TERM

configure_iran_dns() {
    local dns1=$1
    local dns2=$2

    echo -e "\n${CYAN}[i] Applying selected DNS configuration...${NC}"

    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        RESOLVED_CONF="/etc/systemd/resolved.conf"
        RESOLVED_BACKUP="/tmp/resolved.conf.bak"
        $SUDO cp "$RESOLVED_CONF" "$RESOLVED_BACKUP"
        if grep -q "^#*DNS=" "$RESOLVED_CONF"; then $SUDO sed -i "s/^#*DNS=.*/DNS=$dns1 $dns2/" "$RESOLVED_CONF"; else echo "DNS=$dns1 $dns2" | $SUDO tee -a "$RESOLVED_CONF" > /dev/null; fi
        ($SUDO systemctl restart systemd-resolved) &
        spinner $! "   > Applying DNS settings for Debian/Ubuntu..."
    elif [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        RESOLV_CONF="/etc/resolv.conf"
        RESOLV_BACKUP="/tmp/resolv.conf.bak"
        $SUDO cp "$RESOLV_CONF" "$RESOLV_BACKUP"
        if lsattr "$RESOLV_CONF" 2>/dev/null | grep -q "i"; then $SUDO chattr -i "$RESOLV_CONF"; fi
        ( echo "nameserver $dns1" | $SUDO tee "$RESOLV_CONF" > /dev/null; echo "nameserver $dns2" | $SUDO tee -a "$RESOLV_CONF" > /dev/null ) &
        spinner $! "   > Applying DNS settings for RPM-based OS..."
        $SUDO chattr +i "$RESOLV_CONF"
    else
        echo -e "${RED}Error: Unsupported OS for automatic DNS configuration.${NC}"; exit 1;
    fi
    
    # Final check is now soft (warning only)
    echo -e "${YELLOW}   > Verifying connectivity to GitHub...${NC}"
    if curl -s --max-time 5 "https://api.github.com" > /dev/null; then
        echo -e "${GREEN}   > Connection Verified!${NC}"
    else
        echo -e "${RED}   > Warning: Could not connect to GitHub. Installation might fail if DNS is blocked.${NC}"
        read -p "   > Continue anyway? (y/n): " CONT
        if [[ "$CONT" != "y" ]]; then exit 1; fi
    fi
}

select_and_configure_dns() {
    # Define Providers: Name | IP1 | IP2
    PROVIDERS=(
        "Shecan|178.22.122.100|185.51.200.2"
        "403.online|10.202.10.202|10.202.10.102"
        "RadarGame|185.55.226.26|185.55.225.25"
        "Begzar|5.202.100.100|5.202.100.101"
        "Electroteam|94.103.125.157|94.103.125.158"
        "Google (Standard)|8.8.8.8|8.8.4.4"
    )

    echo -e "\n${YELLOW}[!] Sanction Bypass DNS Selector${NC}"
    echo "    Please select a DNS provider to temporarily bypass restrictions during installation."
    echo "    Pinging providers to check latency..."
    echo ""
    
    printf "    %-4s %-15s %-18s %s\n" "ID" "Provider" "Primary IP" "Latency"
    printf "    %-4s %-15s %-18s %s\n" "--" "--------" "----------" "-------"

    i=1
    declare -a IP_MAP
    
    for p in "${PROVIDERS[@]}"; do
        IFS='|' read -r name ip1 ip2 <<< "$p"
        
        latency="N/A"
        if command -v ping > /dev/null 2>&1; then
            # Ping 2 times, wait max 1 sec
            ping_res=$(ping -c 2 -W 1 "$ip1" 2>/dev/null | tail -1 | awk -F '/' '{print $5}')
            if [[ ! -z "$ping_res" ]]; then
                latency="${ping_res} ms"
            else
                latency="${RED}Timeout${NC}"
            fi
        fi

        printf "    ${CYAN}%-4s${NC} %-15s %-18s %b\n" "$i)" "$name" "$ip1" "$latency"
        IP_MAP[$i]="$ip1 $ip2"
        i=$((i+1))
    done

    echo ""
    read -p "   > Enter ID [1-${#PROVIDERS[@]}]: " DNS_CHOICE
    
    if [[ -z "${IP_MAP[$DNS_CHOICE]}" ]]; then
        echo -e "${RED}Invalid selection. Defaulting to Shecan.${NC}"
        DNS_CHOICE=1
    fi
    
    SELECTED_IPS=(${IP_MAP[$DNS_CHOICE]})
    configure_iran_dns "${SELECTED_IPS[0]}" "${SELECTED_IPS[1]}"
}


# -----------------------------------------------------------------------------
# Main Installation Logic
# -----------------------------------------------------------------------------

clear
echo -e "${CYAN}"
echo "################################################################"
echo "   Project Elaheh - Stealth Tunnel Management System"
echo "   Version 3.2.0 (Manual DNS Selector)"
echo "   'Secure. Fast. Uncensored.'"
echo "################################################################"
echo -e "${NC}"

if [ "$EUID" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then SUDO="sudo"; else echo -e "${RED}Error: Please run as root.${NC}"; exit 1; fi
fi
if [ -f /etc/os-release ]; then . /etc/os-release; OS=$NAME; fi
export DEBIAN_FRONTEND=noninteractive

echo -e "${YELLOW}Select Server Location/Role:${NC}"
echo "1) Foreign Server (Upstream - Germany, Finland, etc.)"
echo "2) Iran Server (Edge - User Access)"
read -p "Select [1 or 2]: " ROLE_CHOICE

if [[ "$ROLE_CHOICE" == *"2"* || "$ROLE_CHOICE" == *"۲"* ]]; then
    ROLE="iran"
    echo -e "${GREEN}>> Role Selected: IRAN Server (Edge).${NC}"
    select_and_configure_dns
else
    ROLE="external"
    echo -e "${GREEN}>> Role Selected: FOREIGN Server (Upstream).${NC}"
fi

echo -e "\n${GREEN}--- STEP 1: PREPARING SYSTEM & DEPENDENCIES ---${NC}"
install_deps() {
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        ($SUDO apt-get update -y -qq && $SUDO apt-get upgrade -y -qq && $SUDO apt-get install -y -qq curl git unzip ufw nginx certbot python3-certbot-nginx socat redis-server pingutils)
    elif [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        ($SUDO dnf upgrade -y --refresh && $SUDO dnf install -y -q curl git unzip firewalld nginx certbot python3-certbot-nginx socat redis iputils)
    fi
}
(install_deps) >/dev/null 2>&1 &
spinner $! "   > Updating and installing base packages..."

$SUDO systemctl enable --now redis-server >/dev/null 2>&1 || $SUDO systemctl enable --now redis >/dev/null 2>&1

echo -e "\n${GREEN}--- STEP 2: INSTALLING NODE.JS & NPM ---${NC}"
NODE_VERSION="v22.12.0"
NODE_DIST="node-${NODE_VERSION}-linux-x64"

(curl -sL --retry 3 --retry-delay 5 "https://nodejs.org/dist/${NODE_VERSION}/${NODE_DIST}.tar.xz" | tar -xJ -C /tmp) >/dev/null 2>&1 &
spinner $! "   > Downloading Node.js ${NODE_VERSION}..."

($SUDO rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx && \
 $SUDO cp -R /tmp/${NODE_DIST}/* /usr/local/ && \
 $SUDO rm -rf /tmp/${NODE_DIST}) >/dev/null 2>&1 &
spinner $! "   > Installing Node.js..."

(npm install -g pm2 @angular/cli) >/dev/null 2>&1 &
spinner $! "   > Installing global tools (pm2, @angular/cli)..."

echo -e "\n${GREEN}--- STEP 3: SETTING UP PROJECT ---${NC}"
INSTALL_DIR="/opt/elaheh-project"
$SUDO rm -rf "$INSTALL_DIR"
$SUDO mkdir -p "$INSTALL_DIR" && $SUDO chown -R $USER:$USER "$INSTALL_DIR"
cd "$INSTALL_DIR"

(git clone --quiet --depth 1 "https://github.com/ehsanking/Elaheh-Project.git" .) >/dev/null 2>&1 &
spinner $! "   > Cloning repository from GitHub..."

(npm install --legacy-peer-deps) >/dev/null 2>&1 &
spinner $! "   > Installing dependencies with npm..."

(npm run build) >/dev/null 2>&1 &
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

($SUDO certbot certonly --standalone --preferred-challenges http --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}") >/dev/null 2>&1 &
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
($SUDO systemctl restart nginx) >/dev/null 2>&1 &
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
