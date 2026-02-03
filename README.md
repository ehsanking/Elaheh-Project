# Project Elaheh - Advanced Tunneling Management System

<div align="center">
  <img src="https://picsum.photos/800/400?grayscale" alt="Dashboard Preview" width="800">
  <br><br>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
  [![Version](https://img.shields.io/badge/version-1.0.3-blue.svg)](https://github.com/EHSANKiNG/project-elaheh)
  
  **Internet Freedom for Everyone or No One**
</div>

---

### 🌐 Select Language / انتخاب زبان / 选择语言 / Выберите язык

| [🇺🇸 English](#-english) | [🇮🇷 فارسی (Persian)](#-فارسی-persian) | [🇨🇳 中文 (Chinese)](#-中文-chinese) | [🇷🇺 Русский (Russian)](#-русский-russian) |
| :---: | :---: | :---: | :---: |

---

## 🇺🇸 English

### Introduction
**Project Elaheh** is a state-of-the-art tunneling and traffic obfuscation management system designed to bypass sophisticated censorship firewalls (GFW, Filternet). It creates a secure, encrypted bridge between an **Edge Node** (located in a restricted region, e.g., Iran/China) and an **Upstream Node** (located in a free region, e.g., Germany/USA).

Unlike traditional VPNs, Elaheh focuses on **Camouflage**. It generates cover traffic mimicking realistic user behavior (video streaming, e-commerce browsing, AI dataset synchronization) to blend in with normal network noise.

### Core Features

*   **Multi-Protocol Support:**
    *   **VLESS Reality:** The current gold standard for bypassing DPI. Supports uTLS fingerpriting.
    *   **VMess (WebSocket/gRPC):** Legacy support for older clients, compatible with CDN workers (Cloudflare/Arvan).
    *   **ShadowTLS:** Advanced handshake masking.
*   **Smart Routing:** Automatically selects the best route based on real-time latency and jitter analysis.
*   **NAT Traversal:** Connect Edge nodes without requiring a public IP address using Reverse Tunneling.
*   **User Management:** Complete accounting system with traffic quotas, expiration dates, and concurrent connection limits.
*   **Subscription System:** Auto-generated subscription links compatible with V2RayNG, V2Box, Streisand, and Sing-Box.
*   **Visual Dashboard:** Real-time monitoring of CPU, RAM, Disk, and Network Throughput.

### System Architecture

The system consists of two main components:

1.  **The Panel (Core):** Hosted on the Upstream server. Manages users, database, and configurations.
2.  **The Edge (Relay):** Hosted on the restricted server. Forwards encrypted traffic to the Core.

### Prerequisites

*   **OS:** Ubuntu 20.04+, Debian 11+, Rocky Linux 9, CentOS Stream 9.
*   **Resources:** Min 1GB RAM, 1 CPU Core.
*   **Ports:** Port `4200` (Dashboard), Ports `80/443` (Traffic).

### Installation (Standard One-Liner)

Use this command to install Project Elaheh on your server. It detects your OS, installs dependencies (Node.js, Git, etc.), and sets up the dashboard.

```bash
bash <(curl -Ls https://raw.githubusercontent.com/EHSANKiNG/project-elaheh/main/install.sh)
```

*Note: If the repository is private or the file is not yet pushed, use the **Manual Install** block below.*

#### Manual Install (If One-Liner Fails)
Copy and paste this entire block into your terminal:

```bash
cat << 'EOF' > install.sh
#!/bin/bash
set -e
echo "Installing Project Elaheh..."
if [ -f /etc/os-release ]; then . /etc/os-release; fi
if [[ "$NAME" == *"Ubuntu"* ]] || [[ "$NAME" == *"Debian"* ]]; then
    apt-get update -qq && apt-get install -y curl git unzip nodejs
elif [[ "$NAME" == *"CentOS"* ]] || [[ "$NAME" == *"Rocky"* ]]; then
    dnf install -y curl git unzip nodejs
fi

# Clone or Update
INSTALL_DIR="/opt/project-elaheh"
if [ -d "$INSTALL_DIR" ]; then
    cd "$INSTALL_DIR" && git pull origin main
else
    git clone https://github.com/EHSANKiNG/project-elaheh.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

npm install --silent
echo "Installation Complete. Starting Dashboard..."
npm start
EOF
chmod +x install.sh
./install.sh
```

### Post-Installation
1.  Open your browser and navigate to `http://<YOUR_SERVER_IP>:4200`.
2.  Follow the **Setup Wizard** to configure your node role (Edge or Upstream).
3.  Login with default credentials:
    *   **User:** `admin`
    *   **Password:** `admin`

---

## 🇮🇷 فارسی (Persian)

### معرفی
**پروژه الهه** یک سیستم مدیریت تونل پیشرفته برای ایجاد اینترنت آزاد است. این سیستم با استفاده از تکنیک‌های استتار ترافیک، فایروال‌های پیشرفته را دور می‌زند.

### امکانات
*   **پروتکل‌های مدرن:** پشتیبانی کامل از VLESS Reality, VMess, ShadowTLS.
*   **عبور از NAT:** امکان اتصال سرور ایران به خارج بدون نیاز به IP پابلیک (تانل معکوس).
*   **مدیریت کاربران:** محدودیت حجم، زمان و تعداد کاربر همزمان.
*   **لینک اشتراک:** سازگار با V2RayNG، V2Box و Sing-Box.

### نصب آسان (تک خطی)
دستور زیر را در ترمینال سرور خود کپی و اجرا کنید:

```bash
bash <(curl -Ls https://raw.githubusercontent.com/EHSANKiNG/project-elaheh/main/install.sh)
```

اگر دستور بالا کار نکرد (خطای ۴۰۴)، از روش "نصب دستی" که در بخش انگلیسی آمده استفاده کنید یا دستور تولید شده در **ویزارد نصب** برنامه را کپی کنید.

---

## 🇨🇳 中文 (Chinese)

### 简介
**Elaheh 项目** 是一个专为突破网络封锁而设计的高级隧道管理系统。它通过复杂的混淆技术连接受限区域的边缘节点和自由区域的上游节点。

### 主要功能
*   **多协议支持:** VLESS Reality, VMess, ShadowTLS。
*   **智能伪装:** 模拟 AI 训练、电商购物流量，有效欺骗 DPI 检测。
*   **NAT 穿透:** 无需公网 IP 即可连接边缘节点。
*   **用户管理:** 完整的流量配额和过期管理。

### 安装 (一行命令)

```bash
bash <(curl -Ls https://raw.githubusercontent.com/EHSANKiNG/project-elaheh/main/install.sh)
```

---

## 🇷🇺 Русский (Russian)

### Введение
**Project Elaheh** — это продвинутая система управления туннелированием для обхода цензуры.

### Возможности
*   **Протоколы:** VLESS Reality, VMess, ShadowTLS.
*   **Обфускация:** Имитация трафика обычных сайтов.
*   **NAT Traversal:** Работа за NAT без публичного IP.
*   **Мониторинг:** Дашборд в реальном времени.

### Установка

```bash
bash <(curl -Ls https://raw.githubusercontent.com/EHSANKiNG/project-elaheh/main/install.sh)
```

---

**License:** MIT  
**Author:** EHSANKiNG
