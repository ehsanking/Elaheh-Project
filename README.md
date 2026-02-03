# Project Elaheh - Advanced Tunneling Management System

![Dashboard Preview](https://picsum.photos/800/400?grayscale)

**Version:** 1.0.3  
**Author:** EHSANKiNG

Project Elaheh is a sophisticated, web-based management dashboard designed to facilitate secure, high-performance tunneling between domestic servers (Edge/Iran) and foreign upstream servers. It features advanced camouflage, NAT traversal, and multi-protocol support.

---

## 🇮🇷 فارسی (Persian)

**پروژه الهه** یک سیستم مدیریت تونل پیشرفته برای ایجاد اینترنت آزاد و امن است. این سیستم به شما اجازه می‌دهد تا سرورهای ایران و خارج را به صورت هوشمند به هم متصل کنید.

### امکانات کلیدی
*   **پروتکل‌های مدرن:** پشتیبانی کامل از VLESS Reality, VMess, ShadowTLS.
*   **استتار هوشمند:** شبیه‌سازی ترافیک سایت‌های معتبر (گوگل، خرید آنلاین) برای فریب فایروال.
*   **عبور از NAT:** قابلیت اتصال سرورها بدون نیاز به IP عمومی روی سرور ایران (Reverse Tunnel).
*   **مدیریت کاربران:** سیستم کامل اکانتینگ، محدودیت حجم و زمان، و لینک اشتراک.
*   **داشبورد زیبا:** رابط کاربری مدرن با نمودارهای لحظه‌ای مصرف منابع و ترافیک.
*   **نصب آسان:** ویزارد نصب گرافیکی و اسکریپت نصب خودکار.

### راهنمای نصب
۱. پنل را روی کامپیوتر خود اجرا کنید (`npm start`).
۲. وارد ویزارد نصب شوید و نقش سرور (ایران یا خارج) را انتخاب کنید.
۳. دستور نصب تولید شده را کپی کرده و در ترمینال سرور خود اجرا کنید.

---

## 🇺🇸 English

**Project Elaheh** is a cutting-edge tunneling solution designed to bypass censorship using advanced obfuscation techniques. It acts as a bridge between an Edge node (in a restricted region) and an Upstream node (free internet).

### Key Features
*   **Multi-Protocol Support:** VLESS Reality, VMess over WebSocket/gRPC, and ShadowTLS.
*   **Advanced Camouflage:** Mimics traffic of AI research labs, e-commerce stores, or video streaming to evade DPI.
*   **NAT Traversal:** Connect Edge nodes behind NAT or firewalls to Upstream servers using Reverse Tunneling or STUN/TURN.
*   **User Management:** Create users with traffic quotas, expiry dates, and concurrent connection limits.
*   **Smart Routing:** Optimizes traffic routing based on latency and jitter.
*   **Web Dashboard:** Real-time monitoring of server health, bandwidth, and connected users.

### Installation
1. Start the application locally via `npm start`.
2. Navigate to the **Setup Wizard**.
3. Choose your server role (Edge or Upstream).
4. Copy the generated **Direct Install Command** (Base64 encoded) and paste it into your server's terminal. This avoids any GitHub 404 errors.

---

## 🇨🇳 中文 (Chinese)

**Elaheh 项目** 是一个专为突破网络封锁而设计的高级隧道管理系统。它通过复杂的混淆技术连接受限区域的边缘节点和自由区域的上游节点。

### 主要功能
*   **多协议支持:** VLESS Reality, VMess, ShadowTLS。
*   **智能伪装:** 模拟 AI 训练、电商购物或视频流流量，有效欺骗 DPI 检测。
*   **NAT 穿透:** 通过反向隧道技术，无需公网 IP 即可连接边缘节点。
*   **用户管理:** 完整的流量配额、过期时间和连接数限制管理。
*   **实时监控:** 漂亮的仪表盘，显示服务器负载和流量统计。

### 安装指南
1. 本地运行 `npm start` 启动面板。
2. 进入设置向导 (Setup Wizard)。
3. 选择服务器角色 (伊朗/边缘 或 德国/上游)。
4. 复制生成的**直接安装命令**并在服务器终端运行。

---

## 🇷🇺 Русский (Russian)

**Project Elaheh** — это продвинутая система управления туннелированием для обхода цензуры.

### Основные возможности
*   **Протоколы:** VLESS Reality, VMess, ShadowTLS.
*   **Обфускация:** Имитация трафика обычных сайтов для обхода блокировок.
*   **NAT Traversal:** Работа за NAT без публичного IP.
*   **Управление пользователями:** Лимиты трафика, сроки действия, подписки.
*   **Мониторинг:** Дашборд с графиками в реальном времени.

### Установка
1. Запустите приложение (`npm start`).
2. В мастере установки выберите роль сервера.
3. Скопируйте команду установки и выполните её на сервере.

---

## Manual Installation (Fallback)

If you cannot use the wizard, copy this script to a file named `install.sh` on your server and run it:

```bash
#!/bin/bash
# Install Node.js & Dependencies
if [ -f /etc/os-release ]; then . /etc/os-release; fi
if [[ "$NAME" == *"Ubuntu"* ]]; then apt update && apt install -y curl git unzip nodejs; fi
if [[ "$NAME" == *"CentOS"* ]]; then dnf install -y curl git unzip nodejs; fi

# Clone & Run
git clone https://github.com/EHSANKiNG/project-elaheh.git /opt/project-elaheh
cd /opt/project-elaheh
npm install
npm start
```

## License
MIT License.
