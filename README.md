# Project Elaheh - Advanced Tunneling Management System

<div align="center">
  <img src="https://picsum.photos/800/400?grayscale" alt="Dashboard Preview" width="800">
  <br><br>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
  [![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)](https://github.com/ehsanking/Elaheh-Project)
  
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
This software is developed strictly for **educational purposes** and to ensure **business continuity** for legitimate online businesses.

1.  **No Illegal Use:** The developers do not support the use of this software for any illegal activities.
2.  **User Responsibility:** You are solely responsible for compliance with local laws regarding encryption software.
3.  **Liability Waiver:** The authors shall not be held liable for any damages resulting from the use of this software.

### System Requirements
*   **CPU:** 1 Core
*   **RAM:** 1GB
*   **Disk:** 2GB Free SSD
*   **OS:** Ubuntu 20.04+, Debian 11+, Rocky 9

### Installation (Standard One-Liner)

This script automatically handles dependencies and avoids GitHub credential prompts by using robust fallback strategies.

```bash
cat << 'EOF' > install.sh
#!/bin/bash
set -e
echo "Initializing Project Elaheh Installer..."
# OS Detection
if [ -f /etc/os-release ]; then . /etc/os-release; fi
if [[ "$NAME" == *"Ubuntu"* ]] || [[ "$NAME" == *"Debian"* ]]; then
    apt-get update -qq && apt-get install -y curl unzip nodejs sqlite3
elif [[ "$NAME" == *"CentOS"* ]] || [[ "$NAME" == *"Rocky"* ]]; then
    dnf install -y curl unzip nodejs sqlite3
fi

INSTALL_DIR="/opt/project-elaheh"
rm -rf "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

download_and_extract() {
    URL="$1"
    echo "Trying $URL..."
    HTTP_CODE=$(curl -L -w "%{http_code}" -o /tmp/elaheh.zip "$URL")
    if [ "$HTTP_CODE" -eq 200 ] && [ $(wc -c < /tmp/elaheh.zip) -gt 1000 ]; then
        unzip -o -q /tmp/elaheh.zip -d /tmp/elaheh-extract
        mv /tmp/elaheh-extract/*/* "$INSTALL_DIR/" 2>/dev/null || mv /tmp/elaheh-extract/* "$INSTALL_DIR/"
        rm -rf /tmp/elaheh.zip /tmp/elaheh-extract
        return 0
    fi
    return 1
}

# Try Release Tag -> Main -> Master
if ! download_and_extract "https://github.com/ehsanking/Elaheh-Project/archive/refs/tags/v2.2.0.zip"; then
    if ! download_and_extract "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/main.zip"; then
        download_and_extract "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/master.zip"
    fi
fi

cd "$INSTALL_DIR"
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
پروژه "الهه" صرفاً با اهداف **آموزشی** و برای **تداوم کسب‌وکارهای آنلاین** طراحی شده است.

۱. **استفاده قانونی:** توسعه‌دهندگان هیچگونه مسئولیتی در قبال استفاده نادرست ندارند.
۲. **مسئولیت کاربر:** مسئولیت رعایت قوانین بر عهده کاربر نهایی است.
۳. **عدم ضمانت:** هیچ تضمینی برای پایداری ۱۰۰٪ وجود ندارد.

### نصب آسان (تک خطی)
این دستور مشکل درخواست نام کاربری گیت‌هاب را حل می‌کند و فایل‌ها را با اولویت نسخه Release دانلود می‌کند:

```bash
cat << 'EOF' > install.sh
#!/bin/bash
set -e
echo "Initializing Project Elaheh Installer..."
if [ -f /etc/os-release ]; then . /etc/os-release; fi
if [[ "$NAME" == *"Ubuntu"* ]] || [[ "$NAME" == *"Debian"* ]]; then
    apt-get update -qq && apt-get install -y curl unzip nodejs sqlite3
elif [[ "$NAME" == *"CentOS"* ]] || [[ "$NAME" == *"Rocky"* ]]; then
    dnf install -y curl unzip nodejs sqlite3
fi

INSTALL_DIR="/opt/project-elaheh"
rm -rf "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

download_and_extract() {
    URL="$1"
    echo "Trying $URL..."
    HTTP_CODE=$(curl -L -w "%{http_code}" -o /tmp/elaheh.zip "$URL")
    if [ "$HTTP_CODE" -eq 200 ] && [ $(wc -c < /tmp/elaheh.zip) -gt 1000 ]; then
        unzip -o -q /tmp/elaheh.zip -d /tmp/elaheh-extract
        mv /tmp/elaheh-extract/*/* "$INSTALL_DIR/" 2>/dev/null || mv /tmp/elaheh-extract/* "$INSTALL_DIR/"
        rm -rf /tmp/elaheh.zip /tmp/elaheh-extract
        return 0
    fi
    return 1
}

# Priority: Tag v2.2.0 -> Main -> Master
if ! download_and_extract "https://github.com/ehsanking/Elaheh-Project/archive/refs/tags/v2.2.0.zip"; then
    if ! download_and_extract "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/main.zip"; then
        download_and_extract "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/master.zip"
    fi
fi

cd "$INSTALL_DIR"
npm install --silent
echo "Installation Complete. Starting Dashboard..."
npm start
EOF
chmod +x install.sh
./install.sh
```

---

## 🇨🇳 中文 (Chinese)

### ⚖️ 法律免责声明
**重要通知：**
本项目（"Project Elaheh"）仅供**教育用途**，旨在保障合法在线业务的**业务连续性**。

1.  **禁止非法使用：** 开发者不支持将本软件用于任何非法活动。
2.  **用户责任：** 用户需自行承担遵守当地关于加密软件法律法规的责任。
3.  **免责条款：** 作者不对因使用本软件造成的任何直接或间接损失负责。

### 系统要求
*   **CPU:** 1 核
*   **内存:** 1GB
*   **硬盘:** 2GB 可用空间
*   **系统:** Ubuntu 20.04+, Debian 11+, Rocky Linux 9

### 安装 (一键脚本)
请复制以下代码块并在终端运行。此脚本已修复 GitHub 密码提示问题，优先下载 Release 版本：

```bash
cat << 'EOF' > install.sh
#!/bin/bash
set -e
echo "Initializing Project Elaheh Installer..."
if [ -f /etc/os-release ]; then . /etc/os-release; fi
if [[ "$NAME" == *"Ubuntu"* ]] || [[ "$NAME" == *"Debian"* ]]; then
    apt-get update -qq && apt-get install -y curl unzip nodejs sqlite3
elif [[ "$NAME" == *"CentOS"* ]] || [[ "$NAME" == *"Rocky"* ]]; then
    dnf install -y curl unzip nodejs sqlite3
fi

INSTALL_DIR="/opt/project-elaheh"
rm -rf "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

download_and_extract() {
    URL="$1"
    echo "Trying $URL..."
    HTTP_CODE=$(curl -L -w "%{http_code}" -o /tmp/elaheh.zip "$URL")
    if [ "$HTTP_CODE" -eq 200 ] && [ $(wc -c < /tmp/elaheh.zip) -gt 1000 ]; then
        unzip -o -q /tmp/elaheh.zip -d /tmp/elaheh-extract
        mv /tmp/elaheh-extract/*/* "$INSTALL_DIR/" 2>/dev/null || mv /tmp/elaheh-extract/* "$INSTALL_DIR/"
        rm -rf /tmp/elaheh.zip /tmp/elaheh-extract
        return 0
    fi
    return 1
}

if ! download_and_extract "https://github.com/ehsanking/Elaheh-Project/archive/refs/tags/v2.2.0.zip"; then
    if ! download_and_extract "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/main.zip"; then
        download_and_extract "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/master.zip"
    fi
fi

cd "$INSTALL_DIR"
npm install --silent
echo "Installation Complete. Starting Dashboard..."
npm start
EOF
chmod +x install.sh
./install.sh
```

---

## 🇷🇺 Русский (Russian)

### ⚖️ Юридический отказ от ответственности
**Важное уведомление:**
Это программное обеспечение ("Project Elaheh") разработано исключительно в **образовательных целях** и для обеспечения **непрерывности бизнеса**.

1.  **Нет незаконному использованию:** Разработчики не поддерживают использование этого ПО для незаконной деятельности.
2.  **Ответственность пользователя:** Вы несете единоличную ответственность за соблюдение местных законов.
3.  **Отказ от ответственности:** Авторы не несут ответственности за любой ущерб, возникший в результате использования этого ПО.

### Системные требования
*   **CPU:** 1 ядро
*   **RAM:** 1 ГБ
*   **Диск:** 2 ГБ свободного места
*   **ОС:** Ubuntu 20.04+, Debian 11+, Rocky Linux 9

### Установка (Одной строкой)
Скопируйте и запустите этот блок. Он автоматически скачивает ZIP-архив с проверкой целостности:

```bash
cat << 'EOF' > install.sh
#!/bin/bash
set -e
echo "Initializing Project Elaheh Installer..."
if [ -f /etc/os-release ]; then . /etc/os-release; fi
if [[ "$NAME" == *"Ubuntu"* ]] || [[ "$NAME" == *"Debian"* ]]; then
    apt-get update -qq && apt-get install -y curl unzip nodejs sqlite3
elif [[ "$NAME" == *"CentOS"* ]] || [[ "$NAME" == *"Rocky"* ]]; then
    dnf install -y curl unzip nodejs sqlite3
fi

INSTALL_DIR="/opt/project-elaheh"
rm -rf "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

download_and_extract() {
    URL="$1"
    echo "Trying $URL..."
    HTTP_CODE=$(curl -L -w "%{http_code}" -o /tmp/elaheh.zip "$URL")
    if [ "$HTTP_CODE" -eq 200 ] && [ $(wc -c < /tmp/elaheh.zip) -gt 1000 ]; then
        unzip -o -q /tmp/elaheh.zip -d /tmp/elaheh-extract
        mv /tmp/elaheh-extract/*/* "$INSTALL_DIR/" 2>/dev/null || mv /tmp/elaheh-extract/* "$INSTALL_DIR/"
        rm -rf /tmp/elaheh.zip /tmp/elaheh-extract
        return 0
    fi
    return 1
}

if ! download_and_extract "https://github.com/ehsanking/Elaheh-Project/archive/refs/tags/v2.2.0.zip"; then
    if ! download_and_extract "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/main.zip"; then
        download_and_extract "https://github.com/ehsanking/Elaheh-Project/archive/refs/heads/master.zip"
    fi
fi

cd "$INSTALL_DIR"
npm install --silent
echo "Installation Complete. Starting Dashboard..."
npm start
EOF
chmod +x install.sh
./install.sh
```

**License:** MIT  
**Author:** EHSANKiNG