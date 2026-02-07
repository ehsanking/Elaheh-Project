# Project Elaheh (پروژه الهه) - Advanced Tunneling Management System

<div align="center">
  <img src="https://picsum.photos/800/400?grayscale" alt="Dashboard Preview" width="800">
  <br><br>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
  [![Version](https://img.shields.io/badge/version-1.0.9-blue.svg)](https://github.com/ehsanking/Elaheh-Project)
  
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
This script installs the **pre-compiled** version and completes in **under 30 seconds**.
```bash
bash <(curl -Ls https://raw.githubusercontent.com/ehsanking/Elaheh-Project/main/install.sh)
```

### Manual Installation
If the automated script fails, the new manual process is much simpler.

**1. Install Dependencies**
*   **For Debian / Ubuntu:**
    ```bash
    sudo apt-get update
    sudo apt-get install -y wget unzip nginx certbot python3-certbot-nginx redis-server
    ```
*   **For Rocky / CentOS / Fedora:**
    ```bash
    sudo dnf check-update
    sudo dnf install -y wget unzip nginx certbot python3-certbot-nginx redis
    ```

**2. Download and Extract Panel**
Go to the project's [**Releases page**](https://github.com/ehsanking/Elaheh-Project/releases) and copy the download link for the latest `panel-vX.X.X.zip` file.
```bash
# Define install directory and paste the copied URL
INSTALL_DIR="/opt/elaheh-project"
RELEASE_URL="PASTE_THE_COPIED_PANEL_ASSET_URL_HERE"

# Download and extract
sudo mkdir -p $INSTALL_DIR
sudo wget -O /tmp/panel.zip $RELEASE_URL
sudo unzip -q -o /tmp/panel.zip -d $INSTALL_DIR
sudo rm /tmp/panel.zip
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
The final step is to configure Nginx to serve files from `/opt/elaheh-project` and set up an SSL certificate. The automated script handles this part.

### 🌍 Donate a Server
Help bypass censorship by donating a server (VPS).
1. Install this project on a VPS outside censorship zones (e.g., Germany, Netherlands).
2. Select **"Foreign Server"** during installation.
3. In the dashboard, click **"Donate This Server"**.
4. Share the **Donation Key** with users or admins in restricted regions.

**Security & Safety:**
*   **Encrypted Relay:** All traffic is encrypted using TLS 1.3 / XTLS. You (the donor) cannot see the content of the traffic.
*   **No Logs:** The system is designed to forward packets without logging user activity.
*   **Reverse Tunneling:** The connection is initiated from the restricted side, making it harder for firewalls to detect and block your server.

### System Requirements
*   **CPU:** 1 Core
*   **RAM:** 512MB
*   **Disk:** 500MB Free SSD
*   **OS:** Ubuntu 20.04+, Debian 11+, Rocky 9

---

## 🇮🇷 فارسی (Persian)

### نصب خودکار
این اسکریپت نسخه **آماده و کامپایل‌شده** را نصب کرده و در کمتر از **۳۰ ثانیه** انجام می‌شود.
```bash
bash <(curl -Ls https://raw.githubusercontent.com/ehsanking/Elaheh-Project/main/install.sh)
```

### نصب دستی
اگر اسکریپت خودکار با خطا مواجه شد، نصب دستی جدید بسیار ساده‌تر شده است.

**۱. نصب پیش‌نیازها**
*   **برای Debian / Ubuntu:**
    ```bash
    sudo apt-get update
    sudo apt-get install -y wget unzip nginx certbot python3-certbot-nginx redis-server
    ```
*   **برای Rocky / CentOS / Fedora:**
    ```bash
    sudo dnf check-update
    sudo dnf install -y wget unzip nginx certbot python3-certbot-nginx redis
    ```

**۲. دانلود و استخراج پنل**
به صفحه [**ریلیزهای پروژه**](https://github.com/ehsanking/Elaheh-Project/releases) بروید و لینک دانلود آخرین فایل `panel-vX.X.X.zip` را کپی کنید.
```bash
# پوشه نصب را تعریف کرده و لینک کپی شده را جای‌گذاری کنید
INSTALL_DIR="/opt/elaheh-project"
RELEASE_URL="آدرس کپی شده پنل را اینجا جای‌گذاری کنید"

# دانلود و استخراج
sudo mkdir -p $INSTALL_DIR
sudo wget -O /tmp/panel.zip $RELEASE_URL
sudo unzip -q -o /tmp/panel.zip -d $INSTALL_DIR
sudo rm /tmp/panel.zip
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

### 🌍 اهدای سرور (کمک به گردش آزاد اطلاعات)
اگر در خارج از ایران هستید، می‌توانید با تهیه یک سرور و نصب این پروژه، کلید اتصال را به دوستان خود در ایران بدهید.
۱. پروژه را روی سرور خارج نصب کنید و نقش **Foreign Server** را انتخاب کنید.
۲. در پنل مدیریت، روی گزینه **Donate This Server** کلیک کنید.
۳. کد نمایش داده شده را برای ادمین سرور ایران بفرستید.

**امنیت شما تضمین شده است:**
*   **رمزنگاری کامل:** ترافیک عبوری کاملا رمزنگاری شده است و شما به عنوان صاحب سرور، هیچ دیدی نسبت به محتوای آن ندارید.
*   **بدون لاگ:** هیچ گزارشی از فعالیت کاربران ذخیره نمی‌شود.

---

## 🇨🇳 中文 (Chinese)

### 自动安装
此脚本安装预编译版本，可在30秒内完成。
```bash
bash <(curl -Ls https://raw.githubusercontent.com/ehsanking/Elaheh-Project/main/install.sh)
```
...

---

## 🇷🇺 Русский (Russian)

### Автоматическая установка
Этот скрипт устанавливает предварительно скомпилированную версию и завершается менее чем за 30 секунд.
```bash
bash <(curl -Ls https://raw.githubusercontent.com/ehsanking/Elaheh-Project/main/install.sh)
```
...

---

**License:** MIT  
**Author:** EHSANKiNG