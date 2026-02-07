# Project Elaheh (پروژه الهه) - Advanced Tunneling Management System

<div align="center">
  <img src="https://picsum.photos/800/400?grayscale" alt="Dashboard Preview" width="800">
  <br><br>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/ehsanking/Elaheh-Project)
  
  **Internet Freedom for Everyone or No One**
</div>

---

### 🌐 Select Language / انتخاب زبان / 选择语言 / Выберите язык

| [🇺🇸 English](#-english) | [🇮🇷 فارسی (Persian)](#-فارسی-persian) | [🇨🇳 中文 (Chinese)](#-中文-chinese) | [🇷🇺 Русский (Russian)](#-русский-russian) |
| :---: | :---: | :---: | :---: |

**Default Credentials / نام کاربری پیش‌فرض:**
*   Username: `admin`
*   Password: `admin`

---

## 🇺🇸 English

### Installation (Automated)
Installation is fast and typically completes in under 2 minutes.
```bash
bash <(curl -Ls https://raw.githubusercontent.com/ehsanking/Elaheh-Project/main/install.sh)
```

### Manual Installation
If the automated script fails, you can install the panel manually. Log into your server as root or a user with `sudo` privileges.

**1. Install Dependencies**
*   **For Debian / Ubuntu:**
    ```bash
    sudo apt-get update
    sudo apt-get install -y curl wget tar nginx certbot python3-certbot-nginx redis-server
    ```
*   **For Rocky / CentOS / Fedora:**
    ```bash
    sudo dnf check-update
    sudo dnf install -y curl wget tar nginx certbot python3-certbot-nginx redis
    ```

**2. Download and Extract Panel**
```bash
# Define install directory
INSTALL_DIR="/opt/elaheh-project"
sudo mkdir -p $INSTALL_DIR

# Download the v1.0.0 pre-compiled release
RELEASE_URL="https://github.com/ehsanking/Elaheh-Project/releases/download/v1.0.0/panel.tar.gz"
sudo wget -O /tmp/panel.tar.gz $RELEASE_URL

# Extract the panel
sudo tar -xzf /tmp/panel.tar.gz -C $INSTALL_DIR
sudo rm /tmp/panel.tar.gz
```

**3. Configure Panel**
Create a server configuration file.
```bash
# Replace YOUR_DOMAIN_HERE with your domain and "iran" with "external" if needed
sudo bash -c 'cat > /opt/elaheh-project/assets/server-config.json <<EOF
{
  "role": "iran",
  "domain": "YOUR_DOMAIN_HERE",
  "installedAt": "$(date)"
}
EOF'
```

**4. Configure Web Server**
The final step is to configure Nginx to serve files from `/opt/elaheh-project` and set up an SSL certificate. The automated script handles this, but you would need to create an Nginx config file pointing to the `root /opt/elaheh-project;` and then run `sudo certbot --nginx`.

### 🌍 Donate a Server
Help bypass censorship by donating a server (VPS).
1. Install this project on a VPS outside censorship zones (e.g., Germany, Netherlands).
2. Select **"Foreign Server"** during installation.
3. In the dashboard, click **"Donate This Server"**.
4. Share the **Donation Key** with users or admins in restricted regions.

**Security & Safety:**
*   **Encrypted Relay:** All traffic is encrypted using TLS 1.3 / XTLS. You (the donor) cannot see the content of the traffic (websites visited, messages sent).
*   **No Logs:** The system is designed to forward packets without logging user activity, protecting you from liability.
*   **Reverse Tunneling:** The connection is initiated from the restricted side, making it harder for firewalls to detect and block your server.

### System Requirements
*   **CPU:** 1 Core
*   **RAM:** 512MB (1GB Recommended)
*   **Disk:** 500MB Free SSD
*   **OS:** Ubuntu 20.04+, Debian 11+, Rocky 9

---

## 🇮🇷 فارسی (Persian)

### نصب خودکار
نصب سریع و معمولا در کمتر از ۲ دقیقه انجام می‌شود.
```bash
bash <(curl -Ls https://raw.githubusercontent.com/ehsanking/Elaheh-Project/main/install.sh)
```

### نصب دستی
اگر اسکریپت خودکار با خطا مواجه شد، می‌توانید پنل را به صورت دستی نصب کنید. با کاربر root یا کاربری که دسترسی `sudo` دارد وارد سرور شوید.

**۱. نصب پیش‌نیازها**
*   **برای Debian / Ubuntu:**
    ```bash
    sudo apt-get update
    sudo apt-get install -y curl wget tar nginx certbot python3-certbot-nginx redis-server
    ```
*   **برای Rocky / CentOS / Fedora:**
    ```bash
    sudo dnf check-update
    sudo dnf install -y curl wget tar nginx certbot python3-certbot-nginx redis
    ```

**۲. دانلود و استخراج پنل**
```bash
# تعریف پوشه نصب
INSTALL_DIR="/opt/elaheh-project"
sudo mkdir -p $INSTALL_DIR

# دانلود نسخه v1.0.0 از پیش کامپایل شده
RELEASE_URL="https://github.com/ehsanking/Elaheh-Project/releases/download/v1.0.0/panel.tar.gz"
sudo wget -O /tmp/panel.tar.gz $RELEASE_URL

# استخراج پنل
sudo tar -xzf /tmp/panel.tar.gz -C $INSTALL_DIR
sudo rm /tmp/panel.tar.gz
```

**۳. تنظیمات پنل**
یک فایل کانفیگ برای سرور ایجاد کنید.
```bash
# YOUR_DOMAIN_HERE را با دامنه خود و در صورت نیاز "iran" را با "external" جایگزین کنید
sudo bash -c 'cat > /opt/elaheh-project/assets/server-config.json <<EOF
{
  "role": "iran",
  "domain": "YOUR_DOMAIN_HERE",
  "installedAt": "$(date)"
}
EOF'
```

**۴. تنظیم وب سرور**
مرحله آخر، تنظیم Nginx برای ارائه فایل‌ها از مسیر `/opt/elaheh-project` و نصب گواهی SSL است. اسکریپت خودکار این مرحله را انجام می‌دهد، اما به صورت دستی باید یک فایل کانفیگ Nginx با `root /opt/elaheh-project;` ساخته و سپس `sudo certbot --nginx` را اجرا کنید.

### 🌍 اهدای سرور (کمک به گردش آزاد اطلاعات)
اگر در خارج از ایران هستید، می‌توانید با تهیه یک سرور و نصب این پروژه، کلید اتصال را به دوستان خود در ایران بدهید.
۱. پروژه را روی سرور خارج نصب کنید و نقش **Foreign Server** را انتخاب کنید.
۲. در پنل مدیریت، روی گزینه **Donate This Server** کلیک کنید.
۳. کد نمایش داده شده را برای ادمین سرور ایران بفرستید.

**امنیت شما تضمین شده است:**
*   **رمزنگاری کامل:** ترافیک عبوری کاملا رمزنگاری شده است و شما به عنوان صاحب سرور، هیچ دیدی نسبت به محتوای آن ندارید.
*   **بدون لاگ:** هیچ گزارشی از فعالیت کاربران ذخیره نمی‌شود.
*   **مولتی سرور:** پنل ایران قابلیت اتصال همزمان به چندین سرور اهدایی را دارد تا در صورت مسدود شدن یکی، بقیه فعال بمانند.

---

## 🇨🇳 中文 (Chinese)

### 自动安装
安装速度快，通常在2分钟内完成。
```bash
bash <(curl -Ls https://raw.githubusercontent.com/ehsanking/Elaheh-Project/main/install.sh)
```

### 手动安装
如果自动脚本失败，您可以手动安装面板。

**1. 安装依赖项**
*   **对于 Debian / Ubuntu:**
    ```bash
    sudo apt-get update && sudo apt-get install -y curl wget tar nginx certbot python3-certbot-nginx redis-server
    ```
*   **对于 Rocky / CentOS / Fedora:**
    ```bash
    sudo dnf install -y curl wget tar nginx certbot python3-certbot-nginx redis
    ```

**2. 下载并解压面板**
```bash
INSTALL_DIR="/opt/elaheh-project"
sudo mkdir -p $INSTALL_DIR
RELEASE_URL="https://github.com/ehsanking/Elaheh-Project/releases/download/v1.0.0/panel.tar.gz"
sudo wget -O /tmp/panel.tar.gz $RELEASE_URL
sudo tar -xzf /tmp/panel.tar.gz -C $INSTALL_DIR && sudo rm /tmp/panel.tar.gz
```

**3. 配置面板**
```bash
sudo bash -c 'cat > /opt/elaheh-project/assets/server-config.json <<EOF
{
  "role": "iran",
  "domain": "YOUR_DOMAIN_HERE",
  "installedAt": "$(date)"
}
EOF'
```

---

## 🇷🇺 Русский (Russian)

### Автоматическая установка
Установка быстрая и обычно занимает менее 2 минут.
```bash
bash <(curl -Ls https://raw.githubusercontent.com/ehsanking/Elaheh-Project/main/install.sh)
```

### Ручная установка
Если автоматический скрипт не сработал, вы можете установить панель вручную.

**1. Установка зависимостей**
*   **Для Debian / Ubuntu:**
    ```bash
    sudo apt-get update && sudo apt-get install -y curl wget tar nginx certbot python3-certbot-nginx redis-server
    ```
*   **Для Rocky / CentOS / Fedora:**
    ```bash
    sudo dnf install -y curl wget tar nginx certbot python3-certbot-nginx redis
    ```

**2. Скачивание и извлечение панели**
```bash
INSTALL_DIR="/opt/elaheh-project"
sudo mkdir -p $INSTALL_DIR
RELEASE_URL="https://github.com/ehsanking/Elaheh-Project/releases/download/v1.0.0/panel.tar.gz"
sudo wget -O /tmp/panel.tar.gz $RELEASE_URL
sudo tar -xzf /tmp/panel.tar.gz -C $INSTALL_DIR && sudo rm /tmp/panel.tar.gz
```

**3. Настройка панели**
```bash
sudo bash -c 'cat > /opt/elaheh-project/assets/server-config.json <<EOF
{
  "role": "iran",
  "domain": "YOUR_DOMAIN_HERE",
  "installedAt": "$(date)"
}
EOF'
```

---

**License:** MIT  
**Author:** EHSANKiNG