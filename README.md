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
```bash
bash <(curl -Ls https://raw.githubusercontent.com/ehsanking/Elaheh-Project/main/install.sh)
```

### Manual Installation
If the automated script fails, you can install the panel manually. Log into your server as a non-root user with `sudo` privileges and follow these steps.

**Note:** The entire process can take up to 30 minutes, especially during the application build step.

**1. Install Dependencies**
*   **For Debian / Ubuntu:**
    ```bash
    sudo apt-get update
    sudo apt-get install -y curl git unzip nginx certbot python3-certbot-nginx nodejs redis-server npm
    ```
*   **For Rocky / CentOS / Fedora:**
    ```bash
    sudo dnf check-update
    sudo dnf install -y curl git unzip nginx certbot python3-certbot-nginx nodejs redis npm
    ```

**2. Download Source Code**
This command bypasses any local git proxy that might be configured.
```bash
git -c http.proxy="" -c https.proxy="" clone https://github.com/ehsanking/Elaheh-Project.git
cd Elaheh-Project
```

**3. Build The Application**
This step might take a few minutes.
```bash
# Configure NPM to use a faster mirror (recommended)
npm config set registry https://registry.npmmirror.com

# Install dependencies
npm install --legacy-peer-deps

# Build the application
npm run build
```

**4. Move Files & Configure**
```bash
# Create the destination directory and move files
sudo mkdir -p /opt/elaheh-project/
sudo mv dist/project-elaheh/browser/* /opt/elaheh-project/

# Create a server config file
sudo bash -c 'cat > /opt/elaheh-project/assets/server-config.json <<EOF
{
  "role": "iran",
  "domain": "YOUR_DOMAIN_HERE",
  "installedAt": "$(date)"
}
EOF'
```
*Replace `"iran"` with `"external"` for a foreign server. Replace `YOUR_DOMAIN_HERE` with your domain.*

**5. Configure Web Server**
The final step is to configure Nginx to serve files from `/opt/elaheh-project` and set up an SSL certificate using `sudo certbot --nginx`. This is an advanced step that the script automates.

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
*   **RAM:** 1GB
*   **Disk:** 2GB Free SSD
*   **OS:** Ubuntu 20.04+, Debian 11+, Rocky 9

---

## 🇮🇷 فارسی (Persian)

### نصب خودکار
```bash
bash <(curl -Ls https://raw.githubusercontent.com/ehsanking/Elaheh-Project/main/install.sh)
```

### نصب دستی
اگر اسکریپت خودکار با خطا مواجه شد، می‌توانید پنل را به صورت دستی نصب کنید. با یک کاربر غیر-root که دسترسی `sudo` دارد وارد سرور شوید و مراحل زیر را دنبال کنید.

**توجه:** کل فرآیند نصب، به خصوص مرحله ساخت اپلیکیشن، ممکن است تا ۳۰ دقیقه زمان ببرد.

**۱. نصب پیش‌نیازها**
*   **برای Debian / Ubuntu:**
    ```bash
    sudo apt-get update
    sudo apt-get install -y curl git unzip nginx certbot python3-certbot-nginx nodejs redis-server npm
    ```
*   **برای Rocky / CentOS / Fedora:**
    ```bash
    sudo dnf check-update
    sudo dnf install -y curl git unzip nginx certbot python3-certbot-nginx nodejs redis npm
    ```

**۲. دانلود سورس کد**
این دستور هرگونه پراکسی محلی که روی git تنظیم شده باشد را نادیده می‌گیرد.
```bash
git -c http.proxy="" -c https.proxy="" clone https://github.com/ehsanking/Elaheh-Project.git
cd Elaheh-Project
```

**۳. ساخت اپلیکیشن**
این مرحله ممکن است چند دقیقه طول بکشد.
```bash
# تنظیم NPM برای استفاده از میرور سریع‌تر (پیشنهادی)
npm config set registry https://registry.npmmirror.com

# نصب وابستگی‌ها
npm install --legacy-peer-deps

# ساخت اپلیکیشن
npm run build
```

**۴. انتقال فایل‌ها و تنظیمات**
```bash
# ساخت پوشه مقصد و انتقال فایل‌ها
sudo mkdir -p /opt/elaheh-project/
sudo mv dist/project-elaheh/browser/* /opt/elaheh-project/

# ساخت فایل کانفیگ سرور
sudo bash -c 'cat > /opt/elaheh-project/assets/server-config.json <<EOF
{
  "role": "iran",
  "domain": "YOUR_DOMAIN_HERE",
  "installedAt": "$(date)"
}
EOF'
```
*برای سرور خارج، `"iran"` را با `"external"` جایگزین کنید. `YOUR_DOMAIN_HERE` را با دامنه خود جایگزین کنید.*

**۵. تنظیم وب سرور**
مرحله آخر، تنظیم Nginx برای ارائه فایل‌ها از مسیر `/opt/elaheh-project` و نصب گواهی SSL با دستور `sudo certbot --nginx` است. این یک مرحله پیشرفته است که اسکریپت به صورت خودکار انجام می‌دهد.

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
```bash
bash <(curl -Ls https://raw.githubusercontent.com/ehsanking/Elaheh-Project/main/install.sh)
```

### 手动安装
如果自动脚本失败，您可以手动安装面板。使用具有 `sudo` 权限的非 root 用户登录到您的服务器，并按照以下步骤操作。

**请注意：** 整个过程最多可能需要30分钟，尤其是在应用程序构建步骤。

**1. 安装依赖项**
*   **对于 Debian / Ubuntu:**
    ```bash
    sudo apt-get update
    sudo apt-get install -y curl git unzip nginx certbot python3-certbot-nginx nodejs redis-server npm
    ```
*   **对于 Rocky / CentOS / Fedora:**
    ```bash
    sudo dnf check-update
    sudo dnf install -y curl git unzip nginx certbot python3-certbot-nginx nodejs redis npm
    ```

**2. 下载源代码**
此命令将绕过任何可能已配置的本地git代理。
```bash
git -c http.proxy="" -c https.proxy="" clone https://github.com/ehsanking/Elaheh-Project.git
cd Elaheh-Project
```

**3. 构建应用程序**
此步骤可能需要几分钟。
```bash
# 配置 NPM 使用更快的镜像（推荐）
npm config set registry https://registry.npmmirror.com

# 安装依赖项
npm install --legacy-peer-deps

# 构建应用程序
npm run build
```

**4. 移动文件并配置**
```bash
# 创建目标目录并移动文件
sudo mkdir -p /opt/elaheh-project/
sudo mv dist/project-elaheh/browser/* /opt/elaheh-project/

# 创建服务器配置文件
sudo bash -c 'cat > /opt/elaheh-project/assets/server-config.json <<EOF
{
  "role": "iran",
  "domain": "YOUR_DOMAIN_HERE",
  "installedAt": "$(date)"
}
EOF'
```
*对于国外服务器，请将 `"iran"` 替换为 `"external"`。将 `YOUR_DOMAIN_HERE` 替换为您的域名。*

**5. 配置 Web 服务器**
最后一步是配置 Nginx 以从 `/opt/elaheh-project` 提供文件，并使用 `sudo certbot --nginx` 设置 SSL 证书。这是一个高级步骤，由脚本自动完成。

### 🌍 捐赠服务器
通过捐赠服务器（VPS）帮助绕过审查。
1. 在审查区域以外（例如德国、荷兰）的 VPS 上安装此项目。
2. 安装期间选择 **"Foreign Server"**（外部服务器）。
3. 在仪表板中，点击 **"Donate This Server"**（捐赠此服务器）。
4. 与受限区域的用户分享 **Donation Key**（捐赠密钥）。

**安全性:**
*   **加密中继:** 所有流量均使用 TLS 1.3 / XTLS 加密。您无法看到流量内容。
*   **无日志:** 系统设计为不记录用户活动。

---

## 🇷🇺 Русский (Russian)

### Автоматическая установка
```bash
bash <(curl -Ls https://raw.githubusercontent.com/ehsanking/Elaheh-Project/main/install.sh)
```

### Ручная установка
Если автоматический скрипт не сработал, вы можете установить панель вручную. Войдите на свой сервер как пользователь без прав root, но с доступом к `sudo`, и следуйте этим шагам.

**Примечание:** Весь процесс может занять до 30 минут, особенно на этапе сборки приложения.

**1. Установка зависимостей**
*   **Для Debian / Ubuntu:**
    ```bash
    sudo apt-get update
    sudo apt-get install -y curl git unzip nginx certbot python3-certbot-nginx nodejs redis-server npm
    ```
*   **Для Rocky / CentOS / Fedora:**
    ```bash
    sudo dnf check-update
    sudo dnf install -y curl git unzip nginx certbot python3-certbot-nginx nodejs redis npm
    ```

**2. Скачивание исходного кода**
Эта команда обходит любой локальный git-прокси, который может быть настроен.
```bash
git -c http.proxy="" -c https.proxy="" clone https://github.com/ehsanking/Elaheh-Project.git
cd Elaheh-Project
```

**3. Сборка приложения**
Этот шаг может занять несколько минут.
```bash
# Настроить NPM на использование более быстрого зеркала (рекомендуется)
npm config set registry https://registry.npmmirror.com

# Установка зависимостей
npm install --legacy-peer-deps

# Сборка приложения
npm run build
```

**4. Перемещение файлов и настройка**
```bash
# Создание целевого каталога и перемещение файлов
sudo mkdir -p /opt/elaheh-project/
sudo mv dist/project-elaheh/browser/* /opt/elaheh-project/

# Создание файла конфигурации сервера
sudo bash -c 'cat > /opt/elaheh-project/assets/server-config.json <<EOF
{
  "role": "iran",
  "domain": "YOUR_DOMAIN_HERE",
  "installedAt": "$(date)"
}
EOF'
```
*Для зарубежного сервера замените `"iran"` на `"external"`. Замените `YOUR_DOMAIN_HERE` на ваш домен.*

**5. Настройка веб-сервера**
Последний шаг — настроить Nginx для обслуживания файлов из `/opt/elaheh-project` и установить SSL-сертификат с помощью `sudo certbot --nginx`. Это сложный шаг, который автоматизирует скрипт.

### 🌍 Пожертвовать сервер
Помогите обойти цензуру, пожертвовав сервер (VPS).
1. Установите этот проект на VPS вне зон цензуры.
2. Выберите **"Foreign Server"** при установке.
3. В панели управления нажмите **"Donate This Server"**.
4. Поделитесь ключом с пользователями.

**Безопасность:**
*   **Шифрование:** Весь трафик зашифрован (TLS 1.3). Вы не видите содержимое.
*   **Без логов:** Активность пользователей не сохраняется.

---

**License:** MIT  
**Author:** EHSANKiNG