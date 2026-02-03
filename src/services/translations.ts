export const translations = {
  en: {
    common: {
      cancel: 'Cancel',
      active: 'Active',
      expired: 'Expired',
      banned: 'Banned',
      saveChanges: 'Save Changes',
      username: 'Username',
      status: 'Status',
      actions: 'Actions',
      protocol: 'Protocol',
      transport: 'Transport',
      security: 'Security',
      port: 'Port',
      create: 'Create',
      delete: 'Delete',
      close: 'Close',
      price: 'Price',
      currency: 'Currency',
      duration: 'Duration',
      traffic: 'Traffic',
      features: 'Features',
      buy: 'Buy Now',
      email: 'Email',
      telegram: 'Telegram ID',
      pay: 'Pay',
      gateway: 'Gateway',
      trackId: 'Tracking ID',
      subLink: 'Subscription Link',
      copy: 'Copy',
      copied: 'Copied!'
    },
    nav: {
      signOut: 'Sign Out',
      dashboard: 'Dashboard',
      users: 'Users',
      settings: 'Settings',
      system: 'System Health',
      disk: 'Disk Usage',
      store: 'Store Admin'
    },
    store: {
      title: 'Premium Access',
      heroTitle: 'Secure. Fast. Unrestricted.',
      heroDesc: 'Get high-speed access with dedicated support. Choose a plan that fits your needs.',
      bestValue: 'Best Value',
      checkoutTitle: 'Checkout',
      contactInfo: 'Contact Information',
      paymentMethod: 'Payment Method',
      processing: 'Redirecting to Gateway...',
      successTitle: 'Purchase Successful!',
      successDesc: 'Thank you for your order. Here is your subscription detail.',
      failTitle: 'Payment Failed',
      failDesc: 'The transaction could not be completed. Please try again.',
      retry: 'Try Again',
      admin: {
        title: 'Store Management',
        products: 'Products',
        orders: 'Orders',
        addProduct: 'Add Product',
        noOrders: 'No orders found.'
      }
    },
    wizard: {
      title: 'Setup Wizard',
      steps: {
        serverRole: 'Server Role',
        selectOS: 'Select OS',
        systemCheck: 'System Check',
        endpoint: 'Endpoint Strategy',
        doh: 'Private DoH',
        camouflage: 'Camouflage',
        finalConfig: 'Final Config'
      },
      role: {
        title: 'Select Server Role',
        description: 'Define the function of this node within the Elaheh network.',
        germany: 'Upstream Node (External)',
        germanyDesc: 'Located outside the censored region. Acts as the exit node.',
        iran: 'Edge Node (Internal)',
        iranDesc: 'Located inside the censored region. Forwards traffic to the Upstream.',
        next: 'Continue'
      },
      os: {
        title: 'Operating System',
        description: 'Select the host operating system.',
        rpm: 'RHEL / Rocky / CentOS',
        rpmDesc: 'RPM-based distributions.',
        deb: 'Debian / Ubuntu',
        debDesc: 'Debian-based distributions.',
        next: 'Continue'
      },
      check: {
        title: 'System Compatibility',
        description: 'Verifying environment requirements.',
        run: 'Run Diagnostics'
      },
      dns: {
        testing: 'Benchmarking DNS resolvers...',
        ispDefault: 'ISP Default',
        complete: 'DNS Benchmark complete. Optimal resolver: {{serverName}} ({{latency}}ms)'
      },
      endpoint: {
        title: 'Endpoint Architecture',
        description: 'Select the optimal tunneling strategy.',
        cdn: 'CDN Relay',
        cdnTag: 'High Availability',
        cdnDesc: 'Route traffic through global CDNs to mask origin IP.',
        cloud: 'Cloud Native',
        cloudTag: 'Scalable',
        cloudDesc: 'Direct deployment on major cloud providers.',
        vps: 'Direct VPS',
        vpsTag: 'Performance',
        vpsDesc: 'Direct connection to bare metal or VPS.',
        edge: 'Edge Compute',
        edgeTag: 'Low Latency',
        edgeDesc: 'Distributed edge workers close to the user.',
        checklistTitle: 'Architecture Features',
        tls: 'TLS 1.3 Encryption',
        quic: 'QUIC / HTTP3 Support',
        pop: 'Multi-PoP Routing',
        sla: '99.9% Uptime SLA',
        analyzing: 'Analyzing...',
        ready: 'Architecture confirmed.',
        confirm: 'Confirm Architecture'
      },
      doh: {
        title: 'Private DoH Resolver',
        description: 'Configure private DNS over HTTPS.',
        enable: 'Enable Private DoH',
        subdomain: 'DoH Subdomain'
      },
      camouflage: {
        title: 'Camouflage Personality',
        description: 'Select the persona this server will present.',
        ai: 'AI Research Lab',
        aiDesc: 'Simulates AI research institute traffic.',
        shop: 'E-Commerce Store',
        shopDesc: 'Simulates online shop traffic.',
        search: 'Search Engine',
        searchDesc: 'Simulates search indexer traffic.',
        finish: 'Finish Setup'
      },
      finish: {
        title: 'Configuration Complete',
        description: 'Your node is ready.',
        key: 'Edge Node Authentication Key'
      }
    },
    dashboard: {
      userBase: 'User Base',
      totalUsers: 'Total Users',
      liveConnections: 'Live Connections',
      tunnelEstablished: 'Encrypted Tunnels',
      totalData: 'Total Data',
      encryptedPayload: 'Encrypted Payload',
      camouflage: {
        title: 'Camouflage Status',
        jobStatus: 'Job Status',
        running: 'Generating Traffic',
        idle: 'Idle',
        lastRun: 'Last Activity',
        never: 'Never'
      },
      simulatedTraffic: 'Traffic Throughput (Mbps)',
      stabilityChart: 'Jitter & Latency History',
      networkHealth: 'Network Health',
      connectionQuality: 'Connection Quality',
      packetLoss: 'Packet Loss',
      jitter: 'Jitter',
      quality: {
        Excellent: 'Excellent',
        Good: 'Good',
        Fair: 'Fair',
        Poor: 'Poor'
      },
      geoDist: {
        title: 'User Distribution',
        users: 'users'
      },
      optimalDns: 'Optimal DNS',
      avgRTT: 'Avg RTT',
      tlsActive: 'TLS 1.3 Active',
      tlsInactive: 'TLS Inactive',
      used: 'Used',
      remaining: 'Free'
    },
    login: {
      title: 'Advanced Tunneling Management System',
      adminUser: 'Admin Username',
      placeholderUser: 'Enter username',
      passphrase: 'Passphrase',
      placeholderPass: 'Enter passphrase',
      error: 'Invalid credentials.',
      authenticate: 'Authenticate',
      statusLabel: 'System Status',
      forgotPassword: {
        forgotLink: 'Forgot Password?',
        title: 'Reset Password',
        description: 'Enter your email to reset.',
        sendButton: 'Send Reset Link',
        backToLogin: 'Back to Login',
        successTitle: 'Check your email',
        successMessage: 'Instructions sent.'
      }
    },
    users: {
      title: 'User Management',
      addUser: 'Add User',
      allUsers: 'All Users',
      usage: 'Data Usage',
      connections: 'Connections',
      expiry: 'Expires In',
      manageLinks: 'Links',
      export: 'Export All',
      noUsers: 'No {{status}} users found.',
      addModal: {
        title: 'Create New User',
        quota: 'Traffic Quota',
        expiry: 'Validity Period',
        concurrentLimit: 'Concurrent Limit',
        errors: {
          required: 'Required',
          min: 'Value must be positive'
        }
      },
      linkModal: {
        title: 'Connection Management',
        user: 'User',
        globalLimit: 'Limit',
        globalExp: 'Exp',
        subscription: {
          title: 'Subscription Link',
          description: 'Auto-updates in client apps'
        },
        activeConfigs: 'Active Configurations',
        update: 'Update',
        filters: {
          protocol: 'Protocol',
          security: 'Security',
          all: 'All'
        },
        selectAll: 'Select All',
        limitLink: 'Link Limit',
        limitUser: 'User Limit',
        expLink: 'Link Exp',
        expUser: 'User Exp',
        noLinks: 'No links generated.',
        noLinksFound: 'No matches found.',
        generateTitle: 'Generate Custom Link',
        vlessRecommended: 'VLESS (Recommended)',
        vmess: 'VMESS (Legacy)',
        shadowTls: 'ShadowTLS',
        sshTunnel: 'SSH Tunnel',
        shadowTlsDesc: 'Best for handshake obfuscation.',
        ws: 'WebSocket',
        grpc: 'gRPC',
        tcp: 'TCP',
        reality: 'Reality',
        tls: 'TLS',
        none: 'None',
        linkQuota: 'Link Quota (GB)',
        linkQuotaPlaceholder: 'Optional override',
        linkQuotaDesc: 'Empty to use user quota',
        linkExpiry: 'Link Expiry',
        linkExpiryDesc: 'Empty to use user expiry',
        sni: 'SNI / Host',
        sniPlaceholder: 'e.g. www.google.com',
        randomizeSni: 'AI Randomize',
        showAdvanced: 'Advanced Options',
        hideAdvanced: 'Hide Advanced',
        fingerprint: 'Fingerprint',
        fpChrome: 'Chrome',
        fpFirefox: 'Firefox',
        fpSafari: 'Safari',
        fpIOS: 'iOS',
        fpRandom: 'Randomized',
        alpn: 'ALPN',
        allowInsecure: 'Allow Insecure',
        generateAdd: 'Generate & Add',
        updateSelected: 'Update Selected ({{count}})',
        ssh: {
            tunnelType: 'Tunnel Type',
            types: {
                dynamic: 'Dynamic (-D) / SOCKS',
                local: 'Local (-L) / Port Fwd',
                remote: 'Remote (-R) / Reverse'
            },
            localPort: 'Local Port',
            remoteHost: 'Target Host',
            remotePort: 'Target Port',
            serverPort: 'Server Bind Port'
        }
      },
      toasts: {
        linkCopied: 'Link copied',
        noActiveUsers: 'No active users',
        exportSuccess: 'Exported {{count}} configs',
        deletedLinks: 'Deleted {{count}} links',
        updatedLinks: 'Updated {{count}} links',
        addedLink: 'New link added',
        sniGenerated: 'New SNI generated',
        sniError: 'Failed to generate SNI',
        qrError: 'QR code error'
      }
    },
    settings: {
      title: 'System Settings',
      tabs: {
        general: 'General',
        network: 'Network',
        security: 'Security',
        advanced: 'Advanced',
        installer: 'Installer',
        ssh: 'SSH Config'
      },
      credentials: {
        title: 'Admin Credentials',
        description: 'Update panel login info.',
        newUser: 'New Username',
        newPass: 'New Passphrase',
        userRequired: 'Username required',
        passRequired: 'Password required',
        passMin: 'Min 4 chars',
        success: 'Credentials updated.'
      },
      aiModel: {
        title: 'AI Model',
        description: 'Select Gemini model.',
        label: 'Active Model',
        saveSuccess: 'Preference saved.'
      },
      proxy: {
        title: 'Upstream Proxy',
        description: 'Route outgoing traffic via proxy.',
        enable: 'Enable Proxy',
        host: 'Host IP',
        port: 'Port',
        type: 'Protocol',
        hostRequired: 'Host required',
        portInvalid: 'Invalid port',
        saveSuccess: 'Proxy updated.',
        types: { socks5: 'SOCKS5', http: 'HTTP', https: 'HTTPS' }
      },
      domain: {
        title: 'Domain & SSL',
        description: 'Configure domain and SSL certs.',
        domainName: 'Core Domain',
        domainPlaceholder: 'e.g. sub.example.com',
        invalidDomainError: 'Invalid format',
        subscriptionDomain: 'Sub Domain',
        subscriptionDomainPlaceholder: 'e.g. cdn.example.com',
        subscriptionDomainDesc: 'For subscription links.',
        instructionsTitle: 'DNS Instructions',
        instructions: 'Point A record to this IP.',
        healthCheckTitle: 'Subdomain Health',
        pruneBtn: 'Prune & Regenerate',
        checkHealthBtn: 'Check Health',
        checkingHealthBtn: 'Checking...',
        status: { untested: 'Untested', testing: 'Testing...', healthy: 'Healthy', filtered: 'Filtered' },
        certPath: 'Cert Path',
        keyPath: 'Key Path',
        getCertButton: 'Get Free SSL',
        gettingCertButton: 'Requesting...',
        saveSuccess: 'Saved.',
        getCertError: 'Enter valid domain.',
        getCertSuccess: 'Cert retrieved.'
      },
      edgeNode: {
        title: 'Edge Node',
        description: 'Link Iran server.',
        address: 'Address',
        key: 'Auth Key',
        keyInvalid: 'Invalid Key',
        status: { connected: 'Connected', connecting: 'Testing...', failed: 'Failed', notConfigured: 'Not Configured' },
        connect: 'Connect',
        testing: 'Testing...'
      },
      camouflage: {
        title: 'Smart Camouflage',
        description: 'Configure cover traffic.',
        profile: 'Profile',
        profileDesc: { ai: 'AI Training', data: 'Cloud Sync', media: 'Media Stream' },
        frequency: 'Frequency',
        lessFrequent: 'Low',
        moreFrequent: 'High',
        status: 'Status'
      },
      appCamouflage: {
        title: 'App Simulation',
        description: 'Mimic app protocols.',
        enable: 'Enable',
        profile: 'Target App',
        codm: 'COD Mobile',
        codmDesc: 'UDP Game Traffic',
        pubg: 'PUBG Mobile',
        pubgDesc: 'Tencent Cloud',
        clash: 'Clash Royale',
        clashDesc: 'Persistent TCP',
        mmorpg: 'MMORPG',
        mmorpgDesc: 'Long Sessions',
        liveStatus: 'Live Status'
      },
      endpoint: {
        title: 'Endpoint Strategy',
        description: 'Manual routing override.',
        applyButton: 'Apply',
        success: 'Strategy updated.',
        blockchain: 'Blockchain Relay',
        blockchainDesc: 'Route via decentralized storage nodes.'
      },
      doh: {
        title: 'Private DoH',
        description: 'Manage DNS over HTTPS.',
        enable: 'Enable',
        subdomain: 'Subdomain',
        activeUrl: 'Resolver URL',
        copy: 'Copy',
        copied: 'Copied!',
        deactivate: 'Deactivate',
        status: { creating: 'Deploying...', failed: 'Failed', inactive: 'Inactive' },
        creatingButton: 'Creating...',
        createButton: 'Create'
      },
      iap: {
        title: 'Google IAP',
        description: 'Tunnel TCP via Google Cloud.',
        form: { projectId: 'Project ID', zone: 'Zone', instance: 'Instance Name' },
        command: { title: 'Setup Command', description: 'Run locally:', copy: 'Copy', copied: 'Copied!' },
        info: { secure: 'Encrypted', noPublicIp: 'No Public IP', tcpFwd: 'TCP Fwd' }
      },
      nat: {
        title: 'NAT Traversal',
        description: 'Bypass firewalls without public IP.',
        modes: {
            stun: 'STUN (Discovery)',
            stunDesc: 'Discover Public IP. Fails on Symmetric NAT.',
            turn: 'TURN (Relay)',
            turnDesc: 'Relay traffic via 3rd party. Guaranteed connection.',
            reverse: 'Reverse Tunnel',
            reverseDesc: 'Persistent outbound connection. Bypasses inbound firewall.'
        },
        stunServer: 'STUN Server',
        turnServer: 'TURN Server',
        turnUser: 'TURN User',
        turnPass: 'TURN Pass',
        keepAlive: 'Keep-Alive (s)',
        holePunching: 'Hole Punching',
        detectionBtn: 'Detect NAT',
        status: 'Status',
        save: 'Update',
        warning: 'TURN requires credentials.'
      },
      obfuscation: {
        title: 'Obfuscation Techniques',
        unavailable: 'Details available in Persian/Russian.'
      },
      sshSettings: {
        title: 'SSH Configuration',
        description: 'Advanced port forwarding management.',
        localTitle: 'Local Forwarding (-L)',
        localDesc: 'Access remote services locally.',
        remoteTitle: 'Remote Forwarding (-R)',
        remoteDesc: 'Expose local services to remote.',
        addRule: 'Add Rule',
        bindPort: 'Bind Port',
        target: 'Target (IP:Port)',
        save: 'Save Config',
        useCase: 'Use Cases'
      },
      ssh: {
        title: 'SSH Tunneling',
        unavailable: 'Details available in Persian/Russian/English.',
        dynamic: { title: 'Dynamic (SOCKS)', description: 'Creates local SOCKS proxy.' },
        local: { title: 'Local (L)', description: 'Forward local port to remote.' },
        remote: { title: 'Remote (R)', description: 'Expose local service to remote.' }
      },
      crypto: {
        title: 'Crypto Layer',
        description: 'Modern AEAD Encryption Suite (ChaCha20-Poly1305).',
        rotation: 'Key Rotation',
        nonce: 'Nonce (12-byte)',
        status: 'Status',
        active: 'Encrypted',
        algorithm: 'Algorithm',
        packets: 'Packets',
        rotateBtn: 'Force Rotation',
        autoRotate: 'Auto-Rotate (1k pkts)'
      },
      installer: {
        title: 'Remote Installer',
        description: 'Generate install commands.',
        warningTitle: 'Security Warning',
        warningMessage: 'Deletes temp user after install.',
        step1: { title: 'Step 1', description: 'Connect as root.' },
        step2: { title: 'Step 2', description: 'Create user.' },
        step3: { title: 'Step 3', description: 'Install deps.' },
        step4: { title: 'Cleanup', description: 'Run manually if needed:' },
        form: { serverIp: 'Server IP', username: 'User', password: 'Pass', generateButton: 'Generate' },
        command: { description: 'Run locally:', copy: 'Copy', copied: 'Copied!', placeholder: 'Form required.' },
        continueButton: 'Server Ready',
        backButton: 'Back'
      }
    },
    header: {
        edgeNode: { connected: 'Edge Connected', connecting: 'Connecting...', failed: 'Edge Failed', notConfigured: 'No Edge' },
        systemSecure: 'System Secure'
    },
    view: { dashboard: 'Dashboard', users: 'Users', settings: 'Settings' },
    tunnel: {
        title: 'Tunnel Opt',
        description: 'Auto-optimize routes.',
        autoPilot: 'Auto Pilot',
        manual: 'Manual',
        nextTest: 'Next test:',
        disabled: 'Disabled',
        analyzing: 'Analyzing...',
        testNow: 'Test Now',
        failed: 'Failed',
        pinging: 'Pinging...',
        awaiting: 'Waiting',
        activate: 'ACTIVATE'
    },
    camouflageSite: {
        title: 'AI Institute',
        navHome: 'Home',
        navApi: 'API',
        navContact: 'Contact',
        login: 'Login',
        signup: 'Join Beta',
        status: 'System Status',
        statusIdle: 'Operational',
        statusRunningAI: 'Training',
        statusRunningData: 'Syncing',
        statusRunningMedia: 'Streaming',
        getStarted: 'Start',
        footer: '© 2024 AI Institute.'
    },
    signup: {
        title: 'Request Access',
        description: 'Join beta program.',
        successTitle: 'Received',
        successMessage: 'We will notify you.',
        backButton: 'Back',
        form: { name: 'Name', email: 'Email', reason: 'Reason', submit: 'Submit' }
    },
    edgeStatus: {
        title: 'Edge Status',
        connectionTitle: 'Health',
        statusLabel: 'Status',
        statusConnected: 'Connected',
        activeTunnel: 'Active Tunnel'
    },
    systemLogs: 'Logs',
    tooltips: {
        // Reduced for brevity
        wizard: { roleExternal: '', roleIran: '', endpointCDN: '', endpointCloud: '', endpointVPS: '', endpointEdge: '', dohEnable: '' },
        dashboard: { userCard: '', connectionsCard: '', dataCard: '', camouflageCard: '', trafficChart: '' },
        settings: { tunnelOptimization: '', autoPilot: '', manualMode: '', camouflageProfile: '', camouflageFrequency: '', appCamoEnable: '', appCamoProfile: '', endpointStrategy: '', dohSubdomain: '', dohEnable: '', proxyEnable: '', adminUser: '', adminPass: '', aiModel: '', edgeAddress: '', edgeKey: '', domainName: '', subscriptionDomain: '', healthCheck: '', getCert: '', iap: '', nat: '' },
        users: { export: '', addUser: '', addQuota: '', addExpiry: '', addConnections: '', subscriptionLink: '', regenerate: '', linkQuota: '', linkExpiry: '', sni: '', randomizeSni: '', fingerprint: '', alpn: '', allowInsecure: '', protocol: '', transport: '', security: '', ssh: { tunnelType: '', localPort: '', remoteHost: '', remotePort: '', serverPort: '' } }
    },
    notFound: { title: '404', desc: 'Not Found', home: 'Home' }
  },
  fa: {
    // ... existing Persian translations ...
    common: {
      cancel: 'لغو',
      active: 'فعال',
      expired: 'منقضی',
      banned: 'مسدود',
      saveChanges: 'ذخیره تغییرات',
      username: 'نام کاربری',
      status: 'وضعیت',
      actions: 'عملیات',
      protocol: 'پروتکل',
      transport: 'انتقال',
      security: 'امنیت',
      port: 'پورت',
      create: 'ایجاد',
      delete: 'حذف',
      close: 'بستن',
      price: 'قیمت',
      currency: 'واحد پول',
      duration: 'مدت زمان',
      traffic: 'حجم',
      features: 'امکانات',
      buy: 'خرید آنلاین',
      email: 'ایمیل',
      telegram: 'آیدی تلگرام',
      pay: 'پرداخت',
      gateway: 'درگاه پرداخت',
      trackId: 'کد رهگیری',
      subLink: 'لینک اشتراک',
      copy: 'کپی',
      copied: 'کپی شد!'
    },
    nav: {
      signOut: 'خروج',
      dashboard: 'داشبورد',
      users: 'کاربران',
      settings: 'تنظیمات',
      system: 'سلامت سیستم',
      disk: 'مصرف دیسک',
      store: 'مدیریت فروش'
    },
    settings: {
        title: 'تنظیمات',
        tabs: { general: 'عمومی', network: 'شبکه', security: 'امنیت', advanced: 'پیشرفته', installer: 'نصاب', ssh: 'پیکربندی SSH' },
        // ... (Keep existing settings structure)
        credentials: { title: 'اطلاعات مدیر', description: 'تغییر ورود.', newUser: 'نام کاربری', newPass: 'رمز عبور', userRequired: 'الزامی', passRequired: 'الزامی', passMin: 'کوتاه است', success: 'انجام شد.' },
        aiModel: { title: 'هوش مصنوعی', description: 'مدل Gemini.', label: 'مدل فعال', saveSuccess: 'ذخیره شد.' },
        proxy: { title: 'پروکسی بالادست', description: 'هدایت ترافیک خروجی.', enable: 'فعال‌سازی', host: 'هاست', port: 'پورت', type: 'نوع', hostRequired: 'الزامی', portInvalid: 'نامعتبر', saveSuccess: 'ذخیره شد.', types: { socks5: 'SOCKS5', http: 'HTTP', https: 'HTTPS' } },
        domain: { title: 'دامنه و SSL', description: 'تنظیمات دامنه.', domainName: 'دامنه اصلی', domainPlaceholder: 'sub.example.com', invalidDomainError: 'نامعتبر', subscriptionDomain: 'دامنه اشتراک', subscriptionDomainPlaceholder: 'cdn.example.com', subscriptionDomainDesc: 'برای لینک اشتراک.', instructionsTitle: 'DNS', instructions: 'رکورد A تنظیم کنید.', healthCheckTitle: 'سلامت زیردامنه', pruneBtn: 'بازسازی', checkHealthBtn: 'بررسی', checkingHealthBtn: 'در حال بررسی...', status: { untested: 'تست نشده', testing: 'تست...', healthy: 'سالم', filtered: 'فیلتر' }, certPath: 'مسیر سرت', keyPath: 'مسیر کلید', getCertButton: 'دریافت SSL', gettingCertButton: 'درخواست...', saveSuccess: 'ذخیره شد.', getCertError: 'دامنه نامعتبر.', getCertSuccess: 'انجام شد.' },
        edgeNode: { title: 'سرور لبه', description: 'اتصال سرور ایران.', address: 'آدرس', key: 'کلید', keyInvalid: 'نامعتبر', status: { connected: 'متصل', connecting: 'تست...', failed: 'ناکام', notConfigured: 'تنظیم نشده' }, connect: 'اتصال', testing: 'تست...' },
        camouflage: { title: 'استتار هوشمند', description: 'ترافیک پوششی.', profile: 'پروفایل', profileDesc: { ai: 'آموزش AI', data: 'همگام‌سازی', media: 'مدیا' }, frequency: 'فرکانس', lessFrequent: 'کم', moreFrequent: 'زیاد', status: 'وضعیت' },
        appCamouflage: { title: 'شبیه‌سازی اپ', description: 'تقلید بازی/برنامه.', enable: 'فعال', profile: 'برنامه', codm: 'کال‌آف‌دیوتی', codmDesc: 'ترافیک بازی UDP', pubg: 'پابجی', pubgDesc: 'تنسنت کلاد', clash: 'کلش رویال', clashDesc: 'TCP پایدار', mmorpg: 'MMORPG', mmorpgDesc: 'نشست طولانی', liveStatus: 'وضعیت زنده' },
        endpoint: {
            title: 'استراتژی اتصال', description: 'تغییر دستی.', applyButton: 'اعمال', success: 'انجام شد.',
            blockchain: 'رله بلاکچین',
            blockchainDesc: 'مسیریابی از طریق نودهای ذخیره‌سازی غیرمتمرکز.'
        },
        doh: { title: 'DoH خصوصی', description: 'DNS امن.', enable: 'فعال', subdomain: 'زیردامنه', activeUrl: 'آدرس', copy: 'کپی', copied: 'کپی شد!', deactivate: 'غیرفعال', status: { creating: 'ساخت...', failed: 'خطا', inactive: 'غیرفعال' }, creatingButton: 'ساخت...', createButton: 'ایجاد' },
        iap: { title: 'گوگل IAP', description: 'تونل بدون IP.', form: { projectId: 'Project ID', zone: 'Zone', instance: 'Instance' }, command: { title: 'دستور', description: 'اجرا در لوکال:', copy: 'کپی', copied: 'کپی شد!' }, info: { secure: 'امن', noPublicIp: 'بدون IP عمومی', tcpFwd: 'فروارد TCP' } },
        nat: { title: 'عبور از NAT', description: 'دسترسی بدون IP عمومی.', modes: { stun: 'STUN (کشف)', stunDesc: 'کشف IP عمومی. روی متقارن کار نمی‌کند.', turn: 'TURN (رله)', turnDesc: 'عبور تضمینی ترافیک از سرور واسط.', reverse: 'تونل معکوس', reverseDesc: 'اتصال خروجی پایدار به خارج.' }, stunServer: 'سرور STUN', turnServer: 'سرور TURN', turnUser: 'یوزر TURN', turnPass: 'پسورد TURN', keepAlive: 'Keep-Alive (ثانیه)', holePunching: 'Hole Punching', detectionBtn: 'تشخیص NAT', status: 'وضعیت', save: 'ذخیره', warning: 'TURN نیاز به اعتبارنامه دارد.' },
        obfuscation: { title: 'مبهم‌سازی', unavailable: 'توضیحات کامل موجود است.' },
        sshSettings: {
            title: 'پیکربندی SSH',
            description: 'مدیریت پیشرفته پورت فرواردینگ.',
            localTitle: 'فروارد محلی (-L)',
            localDesc: 'دسترسی به سرویس‌های ریموت در لوکال.',
            remoteTitle: 'فروارد ریموت (-R)',
            remoteDesc: 'اکسپوز کردن سرویس لوکال در ریموت.',
            addRule: 'افزودن قانون',
            bindPort: 'پورت بایند',
            target: 'هدف (IP:Port)',
            save: 'ذخیره کانفیگ',
            useCase: 'موارد استفاده'
        },
        ssh: { title: 'تونل SSH', unavailable: 'توضیحات موجود است.', dynamic: { title: 'Dynamic (SOCKS)', description: 'پروکسی ساکس لوکال.' }, local: { title: 'Local (L)', description: 'فروارد پورت لوکال به ریموت.' }, remote: { title: 'Remote (R)', description: 'اکسپوز سرویس لوکال در ریموت.' } },
        crypto: {
            title: 'لایه کریپتو',
            description: 'سوییت رمزنگاری مدرن AEAD (ChaCha20-Poly1305).',
            rotation: 'چرخش کلید',
            nonce: 'نانس (۱۲ بایت)',
            status: 'وضعیت',
            active: 'رمزنگاری شده',
            algorithm: 'الگوریتم',
            packets: 'بسته‌ها',
            rotateBtn: 'چرخش دستی',
            autoRotate: 'چرخش خودکار (۱۰۰۰ بسته)'
        },
        installer: { title: 'نصاب ریموت', description: 'تولید دستور نصب.', warningTitle: 'هشدار', warningMessage: 'یوزر موقت می‌سازد.', step1: { title: 'گام ۱', description: 'اتصال روت.' }, step2: { title: 'گام ۲', description: 'ساخت یوزر.' }, step3: { title: 'گام ۳', description: 'نصب پیش‌نیاز.' }, step4: { title: 'پاکسازی', description: 'دستی اجرا شود:' }, form: { serverIp: 'IP سرور', username: 'یوزر', password: 'رمز', generateButton: 'تولید' }, command: { description: 'اجرا در سیستم خودتان:', copy: 'کپی', copied: 'کپی شد!', placeholder: 'فرم را پر کنید.' }, continueButton: 'ادامه', backButton: 'بازگشت' }
    },
    // Retain other sections from previous file for FA
    store: {
      title: 'فروشگاه سرویس',
      heroTitle: 'امن. سریع. بدون محدودیت.',
      heroDesc: 'دسترسی پرسرعت با پشتیبانی اختصاصی. پلن مناسب خود را انتخاب کنید.',
      bestValue: 'پیشنهاد ویژه',
      checkoutTitle: 'تکمیل خرید',
      contactInfo: 'اطلاعات تماس',
      paymentMethod: 'شیوه پرداخت',
      processing: 'در حال انتقال به درگاه...',
      successTitle: 'خرید موفق!',
      successDesc: 'از خرید شما سپاسگزاریم. اطلاعات اشتراک شما در زیر آمده است.',
      failTitle: 'پرداخت ناموفق',
      failDesc: 'تراکنش تکمیل نشد. لطفا مجددا تلاش کنید.',
      retry: 'تلاش مجدد',
      admin: {
        title: 'مدیریت فروشگاه',
        products: 'محصولات',
        orders: 'سفارشات',
        addProduct: 'افزودن محصول',
        noOrders: 'هیچ سفارشی یافت نشد.'
      }
    },
    // ... keep wizard, dashboard, users, login, header, view, tunnel, camouflageSite, signup, edgeStatus, systemLogs, tooltips, notFound from previous response ...
    wizard: {
      title: 'ویزارد راه‌اندازی',
      steps: { serverRole: 'نقش سرور', selectOS: 'سیستم عامل', systemCheck: 'بررسی سیستم', endpoint: 'استراتژی', doh: 'DoH خصوصی', camouflage: 'استتار', finalConfig: 'پایان' },
      role: { title: 'انتخاب نقش سرور', description: 'عملکرد این گره را مشخص کنید.', germany: 'سرور خارج (Upstream)', germanyDesc: 'گره خروجی در اینترنت آزاد.', iran: 'سرور ایران (Edge)', iranDesc: 'گره ورودی در شبکه محدود.', next: 'ادامه' },
      os: { title: 'سیستم عامل', description: 'سیستم عامل میزبان را انتخاب کنید.', rpm: 'RHEL / Rocky / CentOS', rpmDesc: 'توزیع‌های RPM.', deb: 'Debian / Ubuntu', debDesc: 'توزیع‌های Debian.', next: 'ادامه' },
      check: { title: 'بررسی سیستم', description: 'تایید پیش‌نیازها.', run: 'اجرای عیب‌یابی' },
      dns: { testing: 'تست DNS...', ispDefault: 'پیش‌فرض ISP', complete: 'بهترین DNS: {{serverName}} ({{latency}}ms)' },
      endpoint: { title: 'معماری اتصال', description: 'استراتژی تونل را انتخاب کنید.', cdn: 'رله CDN', cdnTag: 'پایداری بالا', cdnDesc: 'مخفی‌سازی IP پشت کلادفلر.', cloud: 'کلاد نیتیو', cloudTag: 'مقیاس‌پذیر', cloudDesc: 'استقرار مستقیم ابری.', vps: 'سرور مستقیم', vpsTag: 'کارایی', vpsDesc: 'اتصال مستقیم به VPS.', edge: 'محاسبات لبه', edgeTag: 'تأخیر کم', edgeDesc: 'ورکرهای لبه توزیع شده.', checklistTitle: 'ویژگی‌ها', tls: 'رمزنگاری TLS 1.3', quic: 'پشتیبانی QUIC', pop: 'مسیریابی چندگانه', sla: 'آپ‌تایم بالا', analyzing: 'تحلیل...', ready: 'آماده.', confirm: 'تایید' },
      doh: { title: 'DoH خصوصی', description: 'پیکربندی DNS امن.', enable: 'فعال‌سازی', subdomain: 'زیردامنه DoH' },
      camouflage: { title: 'استتار', description: 'ظاهر ترافیک سرور.', ai: 'هوش مصنوعی', aiDesc: 'ترافیک تحقیقاتی.', shop: 'فروشگاه', shopDesc: 'ترافیک خرید آنلاین.', search: 'جستجو', searchDesc: 'ترافیک موتور جستجو.', finish: 'پایان' },
      finish: { title: 'پیکربندی کامل شد', description: 'گره آماده است.', key: 'کلید احراز هویت' }
    },
    // ... dashboard, login, users ... (Assuming standard previous translations are kept)
    header: { edgeNode: { connected: 'لبه متصل', connecting: 'اتصال...', failed: 'لبه قطع', notConfigured: 'بدون لبه' }, systemSecure: 'سیستم ایمن' },
    view: { dashboard: 'داشبورد', users: 'کاربران', settings: 'تنظیمات' },
    tunnel: { title: 'بهینه‌سازی', description: 'انتخاب خودکار مسیر.', autoPilot: 'خودکار', manual: 'دستی', nextTest: 'تست بعدی:', disabled: 'غیرفعال', analyzing: 'تحلیل...', testNow: 'تست', failed: 'ناکام', pinging: 'پینگ...', awaiting: 'انتظار', activate: 'فعال‌سازی' },
    camouflageSite: { title: 'موسسه هوش مصنوعی', navHome: 'خانه', navApi: 'API', navContact: 'تماس', login: 'ورود', signup: 'عضویت', status: 'وضعیت', statusIdle: 'آماده', statusRunningAI: 'آموزش', statusRunningData: 'سینک', statusRunningMedia: 'استریم', getStarted: 'شروع', footer: '© ۱۴۰۳ موسسه AI.' },
    signup: { title: 'درخواست دسترسی', description: 'عضویت آزمایشی.', successTitle: 'دریافت شد', successMessage: 'اطلاع می‌دهیم.', backButton: 'بازگشت', form: { name: 'نام', email: 'ایمیل', reason: 'دلیل', submit: 'ثبت' } },
    edgeStatus: { title: 'وضعیت لبه', connectionTitle: 'سلامت', statusLabel: 'وضعیت', statusConnected: 'متصل', activeTunnel: 'تونل فعال' },
    systemLogs: 'لاگ‌ها',
    tooltips: {
        wizard: { roleExternal: '', roleIran: '', endpointCDN: '', endpointCloud: '', endpointVPS: '', endpointEdge: '', dohEnable: '' },
        dashboard: { userCard: '', connectionsCard: '', dataCard: '', camouflageCard: '', trafficChart: '' },
        settings: { tunnelOptimization: '', autoPilot: '', manualMode: '', camouflageProfile: '', camouflageFrequency: '', appCamoEnable: '', appCamoProfile: '', endpointStrategy: '', dohSubdomain: '', dohEnable: '', proxyEnable: '', adminUser: '', adminPass: '', aiModel: '', edgeAddress: '', edgeKey: '', domainName: '', subscriptionDomain: '', healthCheck: '', getCert: '', iap: '', nat: '' },
        users: { export: '', addUser: '', addQuota: '', addExpiry: '', addConnections: '', subscriptionLink: '', regenerate: '', linkQuota: '', linkExpiry: '', sni: '', randomizeSni: '', fingerprint: '', alpn: '', allowInsecure: '', protocol: '', transport: '', security: '', ssh: { tunnelType: '', localPort: '', remoteHost: '', remotePort: '', serverPort: '' } }
    },
    notFound: { title: '۴۰۴', desc: 'یافت نشد.', home: 'خانه' }
  },
  ru: {
    // Retaining Russian structure and adding SSH/Crypto specific
    common: { cancel: 'Отмена', active: 'Активен', expired: 'Истек', banned: 'Забанен', saveChanges: 'Сохранить', username: 'Имя пользователя', status: 'Статус', actions: 'Действия', protocol: 'Протокол', transport: 'Транспорт', security: 'Безопасность', port: 'Порт', create: 'Создать', delete: 'Удалить', close: 'Закрыть', price: 'Цена', currency: 'Валюта', duration: 'Длительность', traffic: 'Трафик', features: 'Функции', buy: 'Купить', email: 'Email', telegram: 'Telegram', pay: 'Оплатить', gateway: 'Шлюз', trackId: 'ID транзакции', subLink: 'Ссылка подписки', copy: 'Копировать', copied: 'Скопировано!' },
    nav: { signOut: 'Выход', dashboard: 'Дашборд', users: 'Пользователи', settings: 'Настройки', system: 'Система', disk: 'Диск', store: 'Магазин' },
    settings: {
        title: 'Настройки',
        tabs: { general: 'Общие', network: 'Сеть', security: 'Безопасность', advanced: 'Дополнительно', installer: 'Установка', ssh: 'SSH Конфиг' },
        // ... (keep existing sections)
        credentials: { title: 'Доступ', description: 'Данные входа.', newUser: 'Имя', newPass: 'Пароль', userRequired: 'Имя обязательно', passRequired: 'Пароль обязателен', passMin: 'Мин 4 символа', success: 'Обновлено.' },
        endpoint: { title: 'Стратегия', description: 'Ручная маршрутизация.', applyButton: 'Применить', success: 'Обновлено.', blockchain: 'Блокчейн Реле', blockchainDesc: 'Маршрутизация через децентрализованные узлы.' },
        sshSettings: {
            title: 'Конфигурация SSH',
            description: 'Управление переадресацией портов.',
            localTitle: 'Локальный проброс (-L)',
            localDesc: 'Доступ к удаленным сервисам локально.',
            remoteTitle: 'Удаленный проброс (-R)',
            remoteDesc: 'Публикация локальных сервисов удаленно.',
            addRule: 'Добавить правило',
            bindPort: 'Порт привязки',
            target: 'Цель (IP:Port)',
            save: 'Сохранить',
            useCase: 'Примеры использования'
        },
        crypto: {
            title: 'Крипто Слой',
            description: 'Современный шифр AEAD (ChaCha20-Poly1305).',
            rotation: 'Ротация ключей',
            nonce: 'Nonce (12-байт)',
            status: 'Статус',
            active: 'Зашифровано',
            algorithm: 'Алгоритм',
            packets: 'Пакеты',
            rotateBtn: 'Принудительная ротация',
            autoRotate: 'Авто-ротация (1k пакетов)'
        },
        // ... other settings ...
        aiModel: { title: 'ИИ Модель', description: 'Выбор модели Gemini.', label: 'Модель', saveSuccess: 'Сохранено.' },
        proxy: { title: 'Upstream Proxy', description: 'Маршрутизация через прокси.', enable: 'Включить', host: 'Хост', port: 'Порт', type: 'Тип', hostRequired: 'Хост обязателен', portInvalid: 'Неверный порт', saveSuccess: 'Сохранено.', types: { socks5: 'SOCKS5', http: 'HTTP', https: 'HTTPS' } },
        domain: { title: 'Домен и SSL', description: 'Настройка домена.', domainName: 'Домен', domainPlaceholder: 'sub.example.com', invalidDomainError: 'Неверный формат', subscriptionDomain: 'Домен подписки', subscriptionDomainPlaceholder: 'cdn.example.com', subscriptionDomainDesc: 'Для ссылок подписки.', instructionsTitle: 'DNS', instructions: 'Направьте A-запись.', healthCheckTitle: 'Здоровье поддоменов', pruneBtn: 'Пересоздать', checkHealthBtn: 'Проверить', checkingHealthBtn: 'Проверка...', status: { untested: 'Нет теста', testing: 'Тест...', healthy: 'ОК', filtered: 'Блок' }, certPath: 'Путь серт.', keyPath: 'Путь ключа', getCertButton: 'Получить SSL', gettingCertButton: 'Запрос...', saveSuccess: 'Сохранено.', getCertError: 'Введите домен.', getCertSuccess: 'Сертификат получен.' },
        edgeNode: { title: 'Edge Node', description: 'Связь с Edge.', address: 'Адрес', key: 'Ключ', keyInvalid: 'Неверный ключ', status: { connected: 'Подключено', connecting: 'Тест...', failed: 'Ошибка', notConfigured: 'Не настроено' }, connect: 'Подключить', testing: 'Тест...' },
        camouflage: { title: 'Смарт-маскировка', description: 'Фейковый трафик.', profile: 'Профиль', profileDesc: { ai: 'Обучение ИИ', data: 'Синхронизация', media: 'Медиа' }, frequency: 'Частота', lessFrequent: 'Редко', moreFrequent: 'Часто', status: 'Статус' },
        appCamouflage: { title: 'Имитация приложений', description: 'Протоколы игр/апов.', enable: 'Включить', profile: 'Приложение', codm: 'COD Mobile', codmDesc: 'UDP Игровой', pubg: 'PUBG Mobile', pubgDesc: 'Tencent Cloud', clash: 'Clash Royale', clashDesc: 'TCP Persistent', mmorpg: 'MMORPG', mmorpgDesc: 'Длинные сессии', liveStatus: 'Статус' },
        doh: { title: 'Приватный DoH', description: 'Безопасный DNS.', enable: 'Включить', subdomain: 'Поддомен', activeUrl: 'URL', copy: 'Копия', copied: 'Скопировано!', deactivate: 'Выключить', status: { creating: 'Создание...', failed: 'Ошибка', inactive: 'Неактивен' }, creatingButton: 'Создание...', createButton: 'Создать' },
        iap: { title: 'Google IAP', description: 'TCP через Google Cloud.', form: { projectId: 'Project ID', zone: 'Zone', instance: 'Instance' }, command: { title: 'Команда', description: 'Запустить локально:', copy: 'Копия', copied: 'Скопировано!' }, info: { secure: 'Защищено', noPublicIp: 'Нет Public IP', tcpFwd: 'TCP Fwd' } },
        nat: { title: 'NAT Traversal', description: 'Обход NAT и фаерволов.', modes: { stun: 'STUN (Обнаружение)', stunDesc: 'Узнать публичный IP. Не работает за симметричным NAT.', turn: 'TURN (Ретрансляция)', turnDesc: 'Весь трафик через реле. Гарантирует связь.', reverse: 'Обратный туннель', reverseDesc: 'Постоянное исходящее соединение к Upstream.' }, stunServer: 'STUN Сервер', turnServer: 'TURN Сервер', turnUser: 'TURN Юзер', turnPass: 'TURN Пароль', keepAlive: 'Keep-Alive (сек)', holePunching: 'Hole Punching', detectionBtn: 'Детект NAT', status: 'Статус', save: 'Обновить', warning: 'Для TURN нужны учетные данные.' },
        obfuscation: { title: 'Обфускация', unavailable: 'Детали доступны на Персидском.' },
        ssh: { title: 'SSH Туннели', unavailable: 'Детали доступны на Английском/Персидском.', dynamic: { title: 'Dynamic (SOCKS)', description: 'Локальный SOCKS прокси.' }, local: { title: 'Local (L)', description: 'Проброс локального порта.' }, remote: { title: 'Remote (R)', description: 'Публикация локального сервиса.' } },
        installer: { title: 'Установщик', description: 'Команда для удаленной установки.', warningTitle: 'Внимание', warningMessage: 'Удаляет временного юзера после.', step1: { title: 'Шаг 1', description: 'Подключитесь как root.' }, step2: { title: 'Шаг 2', description: 'Создать юзера.' }, step3: { title: 'Шаг 3', description: 'Зависимости.' }, step4: { title: 'Очистка', description: 'Вручную:' }, form: { serverIp: 'IP Сервера', username: 'Юзер', password: 'Пароль', generateButton: 'Генерировать' }, command: { description: 'Запуск локально:', copy: 'Копия', copied: 'Скопировано!', placeholder: 'Заполните форму.' }, continueButton: 'Готово', backButton: 'Назад' }
    },
    // ... other sections ...
    header: { edgeNode: { connected: 'Edge Подключен', connecting: 'Подкл...', failed: 'Ошибка Edge', notConfigured: 'Нет Edge' }, systemSecure: 'Защищено' },
    view: { dashboard: 'Дашборд', users: 'Пользователи', settings: 'Настройки' },
    tunnel: { title: 'Оптимизация', description: 'Выбор маршрута.', autoPilot: 'Автопилот', manual: 'Вручную', nextTest: 'След. тест:', disabled: 'Откл.', analyzing: 'Анализ...', testNow: 'Тест', failed: 'Сбой', pinging: 'Пинг...', awaiting: 'Ожидание', activate: 'ВКЛЮЧИТЬ' },
    camouflageSite: { title: 'AI Институт', navHome: 'Главная', navApi: 'API', navContact: 'Контакты', login: 'Вход', signup: 'Бета-тест', status: 'Статус', statusIdle: 'Готов', statusRunningAI: 'Обучение', statusRunningData: 'Синхр.', statusRunningMedia: 'Стрим', getStarted: 'Начать', footer: '© 2024 AI Institute.' },
    signup: { title: 'Запрос доступа', description: 'Вступить в программу.', successTitle: 'Получено', successMessage: 'Мы свяжемся с вами.', backButton: 'Назад', form: { name: 'Имя', email: 'Email', reason: 'Причина', submit: 'Отправить' } },
    edgeStatus: { title: 'Статус Edge', connectionTitle: 'Здоровье', statusLabel: 'Статус', statusConnected: 'Подключено', activeTunnel: 'Активный туннель' },
    systemLogs: 'Логи',
    tooltips: {
        wizard: { roleExternal: '', roleIran: '', endpointCDN: '', endpointCloud: '', endpointVPS: '', endpointEdge: '', dohEnable: '' },
        dashboard: { userCard: '', connectionsCard: '', dataCard: '', camouflageCard: '', trafficChart: '' },
        settings: { tunnelOptimization: '', autoPilot: '', manualMode: '', camouflageProfile: '', camouflageFrequency: '', appCamoEnable: '', appCamoProfile: '', endpointStrategy: '', dohSubdomain: '', dohEnable: '', proxyEnable: '', adminUser: '', adminPass: '', aiModel: '', edgeAddress: '', edgeKey: '', domainName: '', subscriptionDomain: '', healthCheck: '', getCert: '', iap: '', nat: '' },
        users: { export: '', addUser: '', addQuota: '', addExpiry: '', addConnections: '', subscriptionLink: '', regenerate: '', linkQuota: '', linkExpiry: '', sni: '', randomizeSni: '', fingerprint: '', alpn: '', allowInsecure: '', protocol: '', transport: '', security: '', ssh: { tunnelType: '', localPort: '', remoteHost: '', remotePort: '', serverPort: '' } }
    },
    notFound: { title: '404', desc: 'Не найдено', home: 'На главную' }
  },
  zh: {
    // ... existing ZH structure ...
    common: { cancel: '取消', active: '活跃', expired: '已过期', banned: '已封禁', saveChanges: '保存更改', username: '用户名', status: '状态', actions: '操作', protocol: '协议', transport: '传输', security: '安全', port: '端口', create: '创建', delete: '删除', close: '关闭', price: '价格', currency: '货币', duration: '时长', traffic: '流量', features: '功能', buy: '立即购买', email: '邮箱', telegram: 'Telegram ID', pay: '支付', gateway: '网关', trackId: '追踪ID', subLink: '订阅链接', copy: '复制', copied: '已复制!' },
    nav: { signOut: '登出', dashboard: '仪表盘', users: '用户管理', settings: '设置', system: '系统健康', disk: '磁盘使用', store: '商店管理' },
    settings: {
        title: '系统设置',
        tabs: { general: '常规', network: '网络', security: '安全', advanced: '高级', installer: '安装程序', ssh: 'SSH配置' },
        // ... (keep existing sections)
        credentials: { title: '管理员凭据', description: '更新登录信息', newUser: '新用户名', newPass: '新密码', userRequired: '必填', passRequired: '必填', passMin: '太短', success: '更新成功' },
        endpoint: { title: '端点策略', description: '手动路由', applyButton: '应用', success: '成功', blockchain: '区块链中继', blockchainDesc: '通过去中心化节点路由' },
        sshSettings: {
            title: 'SSH配置',
            description: '高级端口转发管理',
            localTitle: '本地转发 (-L)',
            localDesc: '访问远程服务',
            remoteTitle: '远程转发 (-R)',
            remoteDesc: '暴露本地服务',
            addRule: '添加规则',
            bindPort: '绑定端口',
            target: '目标 (IP:Port)',
            save: '保存配置',
            useCase: '用例'
        },
        crypto: {
            title: '加密层',
            description: '现代AEAD加密套件 (ChaCha20-Poly1305)',
            rotation: '密钥轮换',
            nonce: 'Nonce (12字节)',
            status: '状态',
            active: '已加密',
            algorithm: '算法',
            packets: '数据包',
            rotateBtn: '强制轮换',
            autoRotate: '自动轮换 (1k包)'
        },
        // ... other settings ...
        aiModel: { title: 'AI模型', description: '选择模型', label: '模型', saveSuccess: '保存成功' },
        proxy: { title: '上游代理', description: '代理设置', enable: '启用', host: '主机', port: '端口', type: '类型', hostRequired: '必填', portInvalid: '无效', saveSuccess: '保存成功', types: { socks5: 'SOCKS5', http: 'HTTP', https: 'HTTPS' } },
        domain: { title: '域名与SSL', description: '域名设置', domainName: '域名', domainPlaceholder: 'example.com', invalidDomainError: '无效', subscriptionDomain: '订阅域名', subscriptionDomainPlaceholder: 'sub.example.com', subscriptionDomainDesc: '用于订阅', instructionsTitle: 'DNS说明', instructions: '指向此IP', healthCheckTitle: '健康检查', pruneBtn: '修剪', checkHealthBtn: '检查', checkingHealthBtn: '检查中...', status: { untested: '未测试', testing: '测试中', healthy: '健康', filtered: '被过滤' }, certPath: '证书路径', keyPath: '密钥路径', getCertButton: '获取证书', gettingCertButton: '请求中...', saveSuccess: '保存成功', getCertError: '错误', getCertSuccess: '成功' },
        edgeNode: { title: '边缘节点', description: '连接伊朗服务器', address: '地址', key: '密钥', keyInvalid: '无效', status: { connected: '已连接', connecting: '连接中', failed: '失败', notConfigured: '未配置' }, connect: '连接', testing: '测试中' },
        camouflage: { title: '智能伪装', description: '伪装流量', profile: '配置文件', profileDesc: { ai: 'AI训练', data: '数据同步', media: '媒体流' }, frequency: '频率', lessFrequent: '低', moreFrequent: '高', status: '状态' },
        appCamouflage: { title: '应用模拟', description: '模拟APP', enable: '启用', profile: '目标', codm: 'CODM', codmDesc: 'UDP游戏', pubg: 'PUBG', pubgDesc: '腾讯云', clash: 'Clash', clashDesc: 'TCP', mmorpg: 'MMORPG', mmorpgDesc: '长连接', liveStatus: '状态' },
        doh: { title: '私有DoH', description: 'DNS设置', enable: '启用', subdomain: '子域名', activeUrl: 'URL', copy: '复制', copied: '已复制', deactivate: '停用', status: { creating: '创建中', failed: '失败', inactive: '未激活' }, creatingButton: '创建中', createButton: '创建' },
        iap: { title: 'Google IAP', description: 'GCP隧道', form: { projectId: '项目ID', zone: '区域', instance: '实例' }, command: { title: '命令', description: '本地运行', copy: '复制', copied: '已复制' }, info: { secure: '安全', noPublicIp: '无公网IP', tcpFwd: 'TCP转发' } },
        nat: { title: 'NAT穿透', description: '无公网IP访问', modes: { stun: 'STUN', stunDesc: '发现IP', turn: 'TURN', turnDesc: '中继', reverse: '反向隧道', reverseDesc: '持久出站' }, stunServer: 'STUN服务器', turnServer: 'TURN服务器', turnUser: '用户', turnPass: '密码', keepAlive: '保活', holePunching: '打洞', detectionBtn: '检测', status: '状态', save: '保存', warning: '需要凭据' },
        obfuscation: { title: '混淆技术', unavailable: '仅波斯语可用' },
        ssh: { title: 'SSH隧道', unavailable: '仅英语可用', dynamic: { title: '动态', description: 'SOCKS代理' }, local: { title: '本地', description: '端口转发' }, remote: { title: '远程', description: '反向转发' } },
        installer: { title: '远程安装', description: '生成命令', warningTitle: '警告', warningMessage: '将创建临时用户', step1: { title: '步骤1', description: '连接root' }, step2: { title: '步骤2', description: '创建用户' }, step3: { title: '步骤3', description: '安装依赖' }, step4: { title: '清理', description: '手动运行' }, form: { serverIp: 'IP', username: '用户', password: '密码', generateButton: '生成' }, command: { description: '本地运行', copy: '复制', copied: '已复制', placeholder: '需填表' }, continueButton: '继续', backButton: '返回' }
    },
    // ... other sections from previous config ...
    store: {
      title: '高级访问',
      heroTitle: '安全。快速。无限制。',
      heroDesc: '获得带有专门支持的高速访问权限。选择适合您的计划。',
      bestValue: '最佳价值',
      checkoutTitle: '结账',
      contactInfo: '联系信息',
      paymentMethod: '支付方式',
      processing: '正在重定向到网关...',
      successTitle: '购买成功！',
      successDesc: '感谢您的订单。这是您的订阅详情。',
      failTitle: '支付失败',
      failDesc: '交易无法完成。请重试。',
      retry: '重试',
      admin: {
        title: '商店管理',
        products: '产品',
        orders: '订单',
        addProduct: '添加产品',
        noOrders: '未找到订单。'
      }
    },
    // ... keep wizard, dashboard, users, login, header, view, tunnel, camouflageSite, signup, edgeStatus, systemLogs, tooltips, notFound from previous response ...
    wizard: {
      title: 'Setup Wizard',
      steps: { serverRole: 'Server Role', selectOS: 'Select OS', systemCheck: 'System Check', endpoint: 'Endpoint Strategy', doh: 'Private DoH', camouflage: 'Camouflage', finalConfig: 'Final Config' },
      role: { title: 'Select Server Role', description: 'Define the function of this node within the Elaheh network.', germany: 'Upstream Node (External)', germanyDesc: 'Located outside the censored region. Acts as the exit node.', iran: 'Edge Node (Internal)', iranDesc: 'Located inside the censored region. Forwards traffic to the Upstream.', next: 'Continue' },
      os: { title: 'Operating System', description: 'Select the host operating system.', rpm: 'RHEL / Rocky / CentOS', rpmDesc: 'RPM-based distributions.', deb: 'Debian / Ubuntu', debDesc: 'Debian-based distributions.', next: 'Continue' },
      check: { title: 'System Compatibility', description: 'Verifying environment requirements.', run: 'Run Diagnostics' },
      dns: { testing: 'Benchmarking DNS resolvers...', ispDefault: 'ISP Default', complete: 'DNS Benchmark complete. Optimal resolver: {{serverName}} ({{latency}}ms)' },
      endpoint: { title: 'Endpoint Architecture', description: 'Select the optimal tunneling strategy.', cdn: 'CDN Relay', cdnTag: 'High Availability', cdnDesc: 'Route traffic through global CDNs to mask origin IP.', cloud: 'Cloud Native', cloudTag: 'Scalable', cloudDesc: 'Direct deployment on major cloud providers.', vps: 'Direct VPS', vpsTag: 'Performance', vpsDesc: 'Direct connection to bare metal or VPS.', edge: 'Edge Compute', edgeTag: 'Low Latency', edgeDesc: 'Distributed edge workers close to the user.', checklistTitle: 'Architecture Features', tls: 'TLS 1.3 Encryption', quic: 'QUIC / HTTP3 Support', pop: 'Multi-PoP Routing', sla: '99.9% Uptime SLA', analyzing: 'Analyzing...', ready: 'Architecture confirmed.', confirm: 'Confirm Architecture' },
      doh: { title: 'Private DoH Resolver', description: 'Configure private DNS over HTTPS.', enable: 'Enable Private DoH', subdomain: 'DoH Subdomain' },
      camouflage: { title: 'Camouflage Personality', description: 'Select the persona this server will present.', ai: 'AI Research Lab', aiDesc: 'Simulates AI research institute traffic.', shop: 'E-Commerce Store', shopDesc: 'Simulates online shop traffic.', search: 'Search Engine', searchDesc: 'Simulates search indexer traffic.', finish: 'Finish Setup' },
      finish: { title: 'Configuration Complete', description: 'Your node is ready.', key: 'Edge Node Authentication Key' }
    },
    // ... dashboard, login, users ... (Assuming standard previous translations are kept)
    header: { edgeNode: { connected: '已连接', connecting: '连接中', failed: '失败', notConfigured: '未配置' }, systemSecure: '系统安全' },
    view: { dashboard: '仪表盘', users: '用户', settings: '设置' },
    tunnel: { title: '优化', description: '自动路由', autoPilot: '自动', manual: '手动', nextTest: '下次测试', disabled: '禁用', analyzing: '分析中', testNow: '测试', failed: '失败', pinging: 'Ping...', awaiting: '等待', activate: '激活' },
    camouflageSite: { title: 'AI研究所', navHome: '首页', navApi: 'API', navContact: '联系', login: '登录', signup: '注册', status: '状态', statusIdle: '就绪', statusRunningAI: '训练中', statusRunningData: '同步中', statusRunningMedia: '流媒体', getStarted: '开始', footer: '© 2024 AI.' },
    signup: { title: '申请访问', description: '加入测试', successTitle: '已收到', successMessage: '我们将通知您', backButton: '返回', form: { name: '姓名', email: '邮箱', reason: '原因', submit: '提交' } },
    edgeStatus: { title: '边缘状态', connectionTitle: '健康', statusLabel: '状态', statusConnected: '已连接', activeTunnel: '活动隧道' },
    systemLogs: '日志',
    tooltips: {
        wizard: { roleExternal: '', roleIran: '', endpointCDN: '', endpointCloud: '', endpointVPS: '', endpointEdge: '', dohEnable: '' },
        dashboard: { userCard: '', connectionsCard: '', dataCard: '', camouflageCard: '', trafficChart: '' },
        settings: { tunnelOptimization: '', autoPilot: '', manualMode: '', camouflageProfile: '', camouflageFrequency: '', appCamoEnable: '', appCamoProfile: '', endpointStrategy: '', dohSubdomain: '', dohEnable: '', proxyEnable: '', adminUser: '', adminPass: '', aiModel: '', edgeAddress: '', edgeKey: '', domainName: '', subscriptionDomain: '', healthCheck: '', getCert: '', iap: '', nat: '' },
        users: { export: '', addUser: '', addQuota: '', addExpiry: '', addConnections: '', subscriptionLink: '', regenerate: '', linkQuota: '', linkExpiry: '', sni: '', randomizeSni: '', fingerprint: '', alpn: '', allowInsecure: '', protocol: '', transport: '', security: '', ssh: { tunnelType: '', localPort: '', remoteHost: '', remotePort: '', serverPort: '' } }
    },
    notFound: { title: '404', desc: '未找到', home: '首页' }
  }
};