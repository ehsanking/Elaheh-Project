# Project Elaheh - Advanced Tunneling Management System

> **"اینترنت آزاد برای همه یا هیچکس"**  
> **"Free Internet for everyone or no one."**

**Version:** 1.0.1  
**Creator:** EHSANKiNG

Project Elaheh is a sophisticated, web-based management dashboard designed to facilitate secure, high-performance tunneling between domestic servers (Edge/Iran) and foreign upstream servers. It leverages modern obfuscation techniques, automated routing optimization, and a user-friendly interface to manage VLESS, VMess, and SSH/IAP connections.

![Dashboard Preview](https://picsum.photos/800/400?grayscale)

## Key Features

### 1. Dual-Node Architecture
- **Upstream Node (Foreign):** Handles the actual internet traffic.
- **Edge Node (Domestic):** Acts as a bridge (relay) to bypass censorship.
- **Auto-Discovery:** Automatically detects network topography and latency.

### 2. Protocol Support
- **VLESS:** Reality (gRPC/TCP/Vision), TLS.
- **VMess:** WebSocket (CDN), TCP (Relay).
- **ShadowTLS:** Advanced handshake obfuscation.
- **SSH Tunneling:** Dynamic (SOCKS), Local, Remote forwarding management.
- **Google IAP:** Tunneling via Google Cloud infrastructure.
- **UDP Support:** Full UDP forwarding support across generated configs.

### 3. Smart Routing & Optimization
- **Auto-Pilot Mode:** Continuously monitors connection quality (every 10 minutes) across multiple providers (Cloudflare, AWS, Hetzner, Blockchain relays) and switches to the lowest latency route.
- **Camouflage Traffic:** Simulates realistic traffic patterns (AI Training, E-Commerce, Media Streaming) to mask tunnel activity.

## Installation

**Note:** This repository must be **Public** for the easy install script to work without authentication.

### One-Line Install (Recommended)

Run this command on your VPS (Debian/Ubuntu/Rocky Linux):

```bash
bash <(curl -Ls https://raw.githubusercontent.com/EHSANKiNG/project-elaheh/main/install.sh)
```

### Manual Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/EHSANKiNG/project-elaheh.git
    cd project-elaheh
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run Development Server:**
    ```bash
    npm start
    ```
    Access the panel at `http://localhost:4200`.

## Server Deployment

Use the built-in **Setup Wizard** on the first run. It will guide you through:
1.  Selecting Server Role (Iran vs. External).
2.  System checks.
3.  Generating the final installation command.

## Usage Guide

### Initial Setup
1.  Open the web panel.
2.  Follow the **Setup Wizard**.
3.  Copy the final SSH command and run it on your server to bind the panel to the system.

### Creating Users
1.  Go to **Users** tab.
2.  Click **Add User**.
3.  **Auto Mode:** Enter username and quota. The system generates VLESS/VMess/ShadowTLS links automatically.
4.  **Manual Mode:** Select specific transport/security settings.
5.  Share the **Subscription Link** with the user.

### Tunnels
1.  Go to **Settings > Advanced > Tunnel Opt**.
2.  Enable **Auto Pilot** for automatic path selection.
3.  Or manually activate a specific provider (CDN, Relay, etc.).

## Security
- **AEAD Encryption:** Internal communication uses ChaCha20-Poly1305.
- **Key Rotation:** Session keys rotate automatically after 1k packets.
- **Obfuscation:** Traffic is disguised as HTTPS/TLS.

## License
MIT License. Created by **EHSANKiNG**.
