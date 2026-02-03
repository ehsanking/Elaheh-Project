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
**Project Elaheh** is a state-of-the-art tunneling and traffic obfuscation management system designed to bypass sophisticated censorship firewalls (GFW, Filternet).

### Installation (Fix for 404 Error)

The standard one-liner might fail if the repository is private or the file hasn't been pushed yet. **Use this guaranteed method instead:**

Copy and paste this entire block into your terminal. It creates the installer locally and runs it:

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

### Standard Install (Only if Repo is Public)
```bash
bash <(curl -Ls https://raw.githubusercontent.com/EHSANKiNG/project-elaheh/main/install.sh)
```

---

## 🇮🇷 فارسی (Persian)

### راه حل خطای 404 (نصب تضمینی)
اگر دستور نصب استاندارد کار نکرد (چون فایل هنوز در گیت‌هاب موجود نیست)، لطفا **دستور زیر را به طور کامل** کپی کرده و در ترمینال اجرا کنید. این دستور فایل نصب را مستقیماً روی سرور شما می‌سازد:

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

### نصب استاندارد (فقط در صورت عمومی بودن مخزن)
```bash
bash <(curl -Ls https://raw.githubusercontent.com/EHSANKiNG/project-elaheh/main/install.sh)
```

---

## 🇨🇳 中文 (Chinese)

### 安装 (修复 404 错误)
如果标准命令失败，请复制以下整段代码并在终端运行：

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

## 🇷🇺 Русский (Russian)

### Установка (Исправление ошибки 404)
Скопируйте и выполните этот блок, если стандартная команда не работает:

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

**License:** MIT  
**Author:** EHSANKiNG
