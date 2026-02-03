# Project Elaheh - Advanced Tunneling Management System

<div align="center">
  <img src="https://picsum.photos/800/400?grayscale" alt="Dashboard Preview" width="800">
  <br><br>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
  [![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/EHSANKiNG/project-elaheh)
  
  **Internet Freedom for Everyone or No One**
</div>

---

### 🌐 Select Language / انتخاب زبان / 选择语言 / Выберите язык

| [🇺🇸 English](#-english) | [🇮🇷 فارسی (Persian)](#-فارسی-persian) | [🇨🇳 中文 (Chinese)](#-中文-chinese) | [🇷🇺 Русский (Russian)](#-русский-russian) |
| :---: | :---: | :---: | :---: |

---

## 🇺🇸 English

### ⚖️ Legal Disclaimer & Liability
**Important Notice:**
This software, "Project Elaheh," is developed strictly for **educational purposes** and to ensure **business continuity** for legitimate online businesses operating in regions with unstable internet connectivity. 

1.  **No Illegal Use:** The developers of this project do not endorse, encourage, or support the use of this software for any illegal activities, including but not limited to hacking, bypassing lawful restrictions, or accessing prohibited content in your jurisdiction.
2.  **User Responsibility:** You, the user, are solely responsible for compliance with all local, state, and federal laws regarding the use of VPNs, tunneling protocols, and encryption software.
3.  **Liability Waiver:** The authors and contributors of Project Elaheh shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from the use, misuse, or inability to use this software.
4.  **Business Focus:** Features such as traffic obfuscation are designed to prevent commercial espionage and ensure stable connections for remote work and digital commerce.

### System Requirements
To run the panel and traffic relay efficiently, your server must meet these minimums:

*   **CPU:** 1 Core (2 Cores recommended for high concurrency)
*   **RAM:** 1GB (2GB recommended if running database locally)
*   **Disk:** 2GB Free SSD Space (for logs and database)
*   **OS:** Ubuntu 20.04+, Debian 11+, Rocky Linux 9, CentOS Stream 9.

### Installation (Professional Method)

To avoid GitHub caching issues (404 errors) and ensure a clean install with a progress bar, copy and paste this **entire block** into your terminal. This method creates the installer locally:

```bash
cat << 'EOF' > install.sh
#!/bin/bash
set -e
echo "Initializing Project Elaheh Installer..."
if [ -f /etc/os-release ]; then . /etc/os-release; fi

# Detect OS and Install Pre-reqs
if [[ "$NAME" == *"Ubuntu"* ]] || [[ "$NAME" == *"Debian"* ]]; then
    apt-get update -qq && apt-get install -y curl git unzip nodejs sqlite3
elif [[ "$NAME" == *"CentOS"* ]] || [[ "$NAME" == *"Rocky"* ]]; then
    dnf install -y curl git unzip nodejs sqlite3
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

---

## 🇮🇷 فارسی (Persian)

### ⚖️ سلب مسئولیت قانونی
**توجه مهم:**
پروژه "الهه" صرفاً با اهداف **آموزشی** و به منظور **تداوم کسب‌وکارهای آنلاین** طراحی شده است.

۱. **استفاده قانونی:** توسعه‌دهندگان هیچگونه مسئولیتی در قبال استفاده نادرست، غیرقانونی یا خلاف مقررات جاری کشور ندارند. هدف ما کمک به فریلنسرها و شرکت‌های تجاری برای دسترسی پایدار به ابزارهای کار است.
۲. **مسئولیت کاربر:** مسئولیت رعایت قوانین مربوط به استفاده از ابزارهای رمزنگاری و تونلینگ بر عهده کاربر نهایی است.
۳. **عدم ضمانت:** هیچ تضمینی برای پایداری ۱۰۰٪ وجود ندارد و توسعه‌دهندگان مسئولیتی در قبال خسارات احتمالی ناشی از قطع سرویس ندارند.

### سیستم مورد نیاز
*   **پردازنده:** ۱ هسته
*   **رم:** ۱ گیگابایت (۲ گیگابایت برای تعداد کاربر بالا)
*   **هارد:** ۲ گیگابایت فضای خالی SSD

### نصب تضمینی (رفع خطای ۴۰۴)
برای نصب صحیح و مشاهده مراحل نصب، لطفا **دستور زیر را به طور کامل** کپی کرده و در ترمینال اجرا کنید:

```bash
cat << 'EOF' > install.sh
#!/bin/bash
set -e
echo "Installing Project Elaheh..."
if [ -f /etc/os-release ]; then . /etc/os-release; fi
if [[ "$NAME" == *"Ubuntu"* ]] || [[ "$NAME" == *"Debian"* ]]; then
    apt-get update -qq && apt-get install -y curl git unzip nodejs sqlite3
elif [[ "$NAME" == *"CentOS"* ]] || [[ "$NAME" == *"Rocky"* ]]; then
    dnf install -y curl git unzip nodejs sqlite3
fi

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

---

**License:** MIT  
**Author:** EHSANKiNG
