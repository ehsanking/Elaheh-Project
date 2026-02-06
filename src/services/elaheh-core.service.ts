

import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { DatabaseService } from './database.service';
import { SmtpConfig } from './email.service';

// --- Metadata ---
export const APP_VERSION = '1.0.8'; 
export const APP_DEFAULT_BRAND = 'Elaheh VPN'; 

// Declare process for type checking
declare var process: any;

// --- Interfaces ---
export interface LinkConfig {
  url: string;
  alias: string;
  quotaGb: number | null;
  expiryDate: string | null;
  protocol: 'vless' | 'vmess' | 'trojan' | 'trusttunnel' | 'openvpn' | 'wireguard' | 'shadowsocks' | 'hysteria2';
  description?: string;
  serverName?: string;
}

export interface EdgeServer {
    id: string;
    name: string;
    host: string; // IP or Domain
    location?: string;
}

export interface User {
  id: string;
  username: string;
  quotaGb: number;
  usedGb: number;
  uploadGb: number;
  downloadGb: number;
  expiryDays: number;
  status: 'active' | 'expired' | 'banned';
  links: LinkConfig[];
  concurrentConnectionsLimit: number;
  currentConnections: number;
  subscriptionLink: string;
  udpEnabled: boolean;
}

export interface SshRule {
  id: string;
  type: 'Local' | 'Remote';
  bindAddress: string;
  port: number;
  target: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  message: string;
}

export type EndpointType = 'CDN' | 'CLOUD' | 'VPS' | 'EDGE' | 'BLOCKCHAIN' | 'P2P' | 'TRUST_TUNNEL';
export type CamouflageProfile = 'AI_TRAINING' | 'DATA_SYNC' | 'MEDIA_FETCH';

export interface EndpointStrategy {
  type: EndpointType;
  providerName: string;
  features: string[];
  latencyMs: number;
}

export interface TunnelProvider {
  id: string;
  name: string;
  type: EndpointType;
  status: 'untested' | 'testing' | 'optimal' | 'suboptimal' | 'failed';
  latencyMs: number | null;
  jitterMs: number | null;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  durationDays: number;
  trafficGb: number;
  userLimit: number;
  features: string[];
  highlight: boolean;
}

export interface PaymentGateway {
  id: string;
  name: string;
  logo: string;
  url: string;
  merchantId: string;
  isEnabled: boolean;
  type: 'FIAT' | 'CRYPTO' | 'INTL';
}

export interface Order {
  id: string;
  productId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerTelegram: string;
  gatewayId: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: Date;
  paidAt?: Date;
  transactionId?: string;
  generatedUserId?: string;
  generatedSubLink?: string;
}

export interface EdgeNodeInfo {
  ip: string;
  location: string;
  hostname: string;
  latency: string;
  provider: string;
}

export interface TelegramBotConfig {
    token: string;
    adminChatId: string;
    isEnabled: boolean;
    proxyEnabled: boolean;
}

export interface AutoSwitchConfig {
    latencyThresholdMs: number;
    packetLossThresholdPercent: number;
    cooldownSeconds: number; // Minimum time between switches
    improvementMarginMs: number; // New tunnel must be this much better to switch
}

// FIX: Add GameProfile type for application camouflage
export type GameProfile = 'COD_MOBILE' | 'PUBG' | 'CLASH_ROYALE' | 'MMORPG';

@Injectable({
  providedIn: 'root'
})
export class ElahehCoreService {
  private db = inject(DatabaseService);

  // Theme & Branding
  theme = signal<'light' | 'dark'>('dark');
  brandName = signal<string>('Project Elaheh');
  brandLogo = signal<string | null>(null); 
  
  // Store Config
  currency = signal<string>('تومان'); 

  // Authentication State
  isAuthenticated = signal<boolean>(false);
  adminUsername = signal<string>('admin');
  adminPassword = signal<string>('admin');
  adminEmail = signal<string>('');
  
  // 2FA State
  is2faEnabled = signal<boolean>(false);
  twoFactorSecret = signal<string>('');

  // Dashboard State (Shared)
  serverLoad = signal<number>(0);
  memoryUsage = signal<number>(0);
  activeConnections = signal<number>(0);
  totalDataTransferred = signal<number>(142.5);
  transferRateMbps = signal<number>(0);
  totalDiskSpaceGb = signal<number>(200);
  usedDiskSpaceGb = signal<number>(64.8);
  diskUsagePercent = computed(() => (this.usedDiskSpaceGb() / this.totalDiskSpaceGb()) * 100);
  
  // Upstream Node State
  upstreamToken = signal<string | null>(null);
  upstreamStatus = signal<'listening' | 'connected'>('listening');

  // Edge (Iran) State - Multi Server Support
  edgeServers = signal<EdgeServer[]>([]); 
  
  private getActiveHosts(): EdgeServer[] {
      if (this.edgeServers().length > 0) return this.edgeServers();
      return [{ id: 'default', name: 'Main Server', host: this.customDomain() || 'YOUR_IP_OR_DOMAIN' }];
  }

  packetLossRate = signal<number>(0);
  jitterMs = signal<number>(0);
  geoDistribution = signal<any[]>([
    { country: 'Iran', code: 'IR', percent: 85, count: 120 },
    { country: 'Germany', code: 'DE', percent: 10, count: 14 },
    { country: 'China', code: 'CN', percent: 3, count: 4 },
    { country: 'Russia', code: 'RU', percent: 2, count: 3 },
  ]);
  
  connectionQuality = computed(() => {
    const loss = this.packetLossRate();
    const jitter = this.jitterMs();
    if (loss < 0.5 && jitter < 15) return 'Excellent';
    if (loss < 2.0 && jitter < 40) return 'Good';
    if (loss < 5.0 && jitter < 80) return 'Fair';
    return 'Poor';
  });

  upstreamNode = signal<string>('Not Connected');
  downstreamNode = signal<string>('Local Relay');
  
  activeStrategy = signal<EndpointStrategy>({
    type: 'VPS',
    providerName: 'Auto-Detect',
    features: ['TLS 1.3', 'TCP/BBR'],
    latencyMs: 45
  });

  // Tunnel Automation State
  isTestingTunnels = signal<boolean>(false);
  tunnelProviders = signal<TunnelProvider[]>([
    { id: 'trusttunnel', name: 'TrustTunnel (AdGuard)', type: 'TRUST_TUNNEL', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'wireguard', name: 'WireGuard (UDP)', type: 'VPS', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'openvpn', name: 'OpenVPN (TCP)', type: 'VPS', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'vless', name: 'VLESS Reality', type: 'CDN', status: 'untested', latencyMs: null, jitterMs: null },
  ]);

  autoTunnelConfig = signal<AutoSwitchConfig>({
      latencyThresholdMs: 150,
      packetLossThresholdPercent: 3.5,
      cooldownSeconds: 60, // Prevent flapping
      improvementMarginMs: 20
  });
  lastAutoSwitchTimestamp = signal<number>(0);

  sshRules = signal<SshRule[]>([]);
  logs = signal<LogEntry[]>([]);
  users = signal<User[]>([]); 
  userStats = computed(() => { const all = this.users(); return { total: all.length, active: all.filter(u => u.status === 'active').length, expired: all.filter(u => u.status === 'expired').length, banned: all.filter(u => u.status === 'banned').length }; });

  protocolUsage = computed(() => {
    const usage: { [protocol: string]: number } = {};
    this.users().forEach(user => {
      if (user.status === 'active') {
        const protocols = new Set<string>();
        user.links.forEach(link => {
          protocols.add(link.protocol);
        });
        protocols.forEach(protocol => {
          usage[protocol] = (usage[protocol] || 0) + 1;
        });
      }
    });
    return usage;
  });

  products = signal<Product[]>([
    { id: 'p1', title: 'پکیج پایه', description: 'مناسب وب‌گردی و تحقیق', price: 90000, durationDays: 30, trafficGb: 30, userLimit: 1, features: ['۳۰ گیگابایت', '۱ کاربر', 'سرعت بالا', 'آی‌پی ثابت'], highlight: false },
    { id: 'p2', title: 'پکیج حرفه‌ای', description: 'مناسب ترید و فریلنسرها', price: 160000, durationDays: 30, trafficGb: 60, userLimit: 2, features: ['۶۰ گیگابایت', '۲ کاربر', 'پینگ پایین', 'کیل‌سوئیچ'], highlight: true },
    { id: 'p3', title: 'پکیج سازمانی', description: 'مناسب شرکت‌ها و تیم‌ها', price: 290000, durationDays: 60, trafficGb: 120, userLimit: 4, features: ['۱۲۰ گیگابایت', '۴ کاربر', 'مسیر اختصاصی', 'پشتیبانی VIP'], highlight: false },
  ]);
  
  orders = signal<Order[]>([]);
  paymentGateways = signal<PaymentGateway[]>([
    { id: 'zarinpal', name: 'زرین‌پال', logo: 'https://cdn.zarinpal.com/badges/trustLogo/1.svg', url: 'https://www.zarinpal.com', merchantId: '', isEnabled: true, type: 'FIAT' },
    { id: 'payping', name: 'پی‌پینگ', logo: 'https://payping.ir/assets/img/logo-dark.svg', url: 'https://payping.ir', merchantId: '', isEnabled: true, type: 'FIAT' },
  ]);

  camouflageMode = signal<'AI_RESEARCH' | 'SHOP' | 'SEARCH_ENGINE'>('SHOP');
  camouflageContent = signal<string>('سامانه ارائه خدمات زیرساخت ابری.');
  camouflageProfile = signal<CamouflageProfile>('AI_TRAINING');
  camouflageJobStatus = signal<'IDLE' | 'RUNNING'>('IDLE');
  lastCamouflageUpdate = signal<Date | null>(null);
  camouflageFrequency = signal<number>(30);
  
  // Advanced Obfuscation
  tlsCamouflageEnabled = signal<boolean>(false);
  tlsCamouflageSni = signal<string>('www.google.com');
  tlsCamouflageStatus = signal<'active' | 'inactive' | 'error'>('inactive');

  // FIX: Add signals for Application Camouflage
  applicationCamouflageEnabled = signal<boolean>(false);
  applicationCamouflageProfile = signal<GameProfile | null>(null);
  applicationCamouflageStatus = signal<string>('Idle');

  isConfigured = signal<boolean>(false);
  serverRole = signal<'iran' | 'external' | null>(null);
  selectedOS = signal<'rpm' | 'deb' | null>(null);
  
  customDomain = signal<string>('');
  subscriptionDomain = signal<string>('');
  sslCertPath = signal<string>('');
  sslKeyPath = signal<string>('');
  isSslActive = computed(() => this.customDomain() !== '');
  
  smtpConfig = signal<SmtpConfig>({ host: '', port: 587, user: '', pass: '', secure: false, senderName: 'Admin', senderEmail: '' });
  telegramBotConfig = signal<TelegramBotConfig>({ token: '', adminChatId: '', isEnabled: false, proxyEnabled: true });
  
  iapConfig = signal<{projectId: string, zone: string, instanceName: string}>({ projectId: '', zone: 'europe-west3-c', instanceName: 'upstream' });
  natConfig = signal<any>({ mode: 'REVERSE_TUNNEL', keepAliveIntervalSec: 25 });
  natStatus = signal<'Idle' | 'Detecting' | 'Connected' | 'Relaying'>('Idle');
  detectedNatType = signal<string>('Unknown');
  detectedPublicIp = signal<string>('Unknown');
  private keepAliveTimer: any = null;

  private regenerationTrigger = signal(0);
  generatedSubdomains = computed(() => {
    this.regenerationTrigger(); 
    const domain = this.customDomain();
    if (!domain) return ['www.' + (domain || 'example.com'), 'api.' + (domain || 'example.com')];
    return [ `www.${domain}`, `api.${domain}`, `cdn.${domain}`, `blog.${domain}`, `shop.${domain}`, `ws.${domain}`, `update.${domain}`, `secure.${domain}`];
  });
  
  forceSubdomainRegeneration() { this.regenerationTrigger.update(v => v + 1); this.addLog('INFO', 'Regenerating subdomain list...'); }

  edgeNodeAddress = signal<string>('');
  edgeNodeAuthKey = signal<string>('');
  edgeNodeStatus = signal<'not_configured' | 'connecting' | 'connected' | 'failed'>('not_configured');

  isProxyEnabled = signal<boolean>(false);
  proxyHost = signal<string>('');
  proxyPort = signal<number | null>(null);
  proxyType = signal<'SOCKS5' | 'HTTP' | 'HTTPS'>('SOCKS5');

  isDohEnabled = signal<boolean>(false);
  dohSubdomain = signal<string>('dns');
  dohStatus = signal<'inactive' | 'creating' | 'active' | 'failed'>('inactive');
  dohUrl = computed(() => (this.dohStatus() === 'active' && this.customDomain()) ? `https://${this.dohSubdomain()}.${this.customDomain()}/dns-query` : null);
  
  optimalDnsResolver = signal<string | null>(null);

  private ai: GoogleGenAI | null = null;
  private chat = signal<Chat | null>(null);

  private readonly AUTO_TEST_INTERVAL_SECONDS = 600;
  private autoTestIntervalId: any = null;
  private countdownIntervalId: any = null;
  tunnelMode = signal<'auto' | 'manual'>('auto');
  isAutoTestEnabled = computed(() => this.tunnelMode() === 'auto');
  nextAutoTestSeconds = signal<number>(0);

  private openedPorts = new Set<number>([80, 443, 22]);

  constructor() {
    this.initSimulatedMetrics();
    this.addLog('INFO', `Core Service Initialized v${APP_VERSION}`);
    this.loadPersistedData();
    this.loadServerConfig(); 

    const apiKey = typeof process !== 'undefined' ? process.env?.API_KEY : null;
    if (apiKey) { this.ai = new GoogleGenAI({ apiKey }); }

    effect(() => {
      const currentTheme = this.theme();
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });

    effect(() => {
       const state = {
           users: this.users(),
           products: this.products(),
           sshRules: this.sshRules(),
           edgeServers: this.edgeServers(),
           settings: {
               adminUsername: this.adminUsername(),
               adminEmail: this.adminEmail(),
               domain: this.customDomain(),
               smtp: this.smtpConfig(),
               telegram: this.telegramBotConfig(),
               brandName: this.brandName(),
               brandLogo: this.brandLogo(),
               currency: this.currency(),
               gateways: this.paymentGateways(),
               is2faEnabled: this.is2faEnabled(),
               twoFactorSecret: this.twoFactorSecret(),
               autoTunnelConfig: this.autoTunnelConfig()
           }
       };
       this.db.saveState(state);
    });

    effect(() => {
      if (this.isConfigured() && this.serverRole() === 'external') {
        this.addLog('INFO', 'Role: UPSTREAM SERVER (Foreign).');
        if (!this.upstreamToken()) {
            this.upstreamToken.set(this.generateConnectionToken());
        }
      } else if (this.isConfigured() && this.serverRole() === 'iran') {
        this.addLog('INFO', 'Role: EDGE SERVER (Iran). Panel Active.');
        this.startNatKeepAlive();
        if (this.tunnelMode() === 'auto') {
            this.startAutoTesting();
        }
      }
    });
  }

  // --- Fix: Implement addLog method ---
  addLog(level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', message: string) {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    this.logs.update(currentLogs => [newLog, ...currentLogs.slice(0, 99)]);
  }

  private loadPersistedData() {
      const data = this.db.loadState();
      if (data) {
          if (data.users) this.users.set(data.users);
          if (data.products) this.products.set(data.products);
          if (data.sshRules) this.sshRules.set(data.sshRules);
          if (data.edgeServers) this.edgeServers.set(data.edgeServers);
          if (data.settings) {
              if(data.settings.adminUsername) this.adminUsername.set(data.settings.adminUsername);
              if(data.settings.adminEmail) this.adminEmail.set(data.settings.adminEmail);
              if(data.settings.domain) this.customDomain.set(data.settings.domain);
              if(data.settings.brandName) this.brandName.set(data.settings.brandName);
              if(data.settings.currency) this.currency.set(data.settings.currency);
              if(data.settings.telegram) this.telegramBotConfig.set(data.settings.telegram);
              if(data.settings.is2faEnabled !== undefined) this.is2faEnabled.set(data.settings.is2faEnabled);
              if(data.settings.twoFactorSecret) this.twoFactorSecret.set(data.settings.twoFactorSecret);
              if(data.settings.autoTunnelConfig) this.autoTunnelConfig.set(data.settings.autoTunnelConfig);
          }
      } else {
          if (this.serverRole() === 'iran' && this.users().length === 0) {
              this.addUser('demo', 10, 30, 2);
          }
      }
  }

  private loadServerConfig() {
    fetch('assets/server-config.json')
      .then(res => res.json())
      .then(config => {
        if (config.domain) this.customDomain.set(config.domain);
        if (config.role) {
            this.serverRole.set(config.role);
            this.isConfigured.set(true);
        }
      })
      .catch(() => {});
  }

  // --- AI / Gemini Methods ---

  async analyzeLogsWithAi(logs: LogEntry[]): Promise<{ analysis: string; citations: any[] }> {
    if (!this.ai) {
        this.addLog('ERROR', 'AI client not initialized. Is API_KEY set?');
        throw new Error("AI client not initialized.");
    }
    if (logs.length === 0) {
        return { analysis: "No logs to analyze.", citations: [] };
    }

    const logMessages = logs.slice(0, 25).map(l => `[${l.level}] ${l.message}`).join('\n');
    const prompt = `Analyze the following system logs from a VPN management panel. Provide a concise, one-paragraph summary of the system's health. Highlight any critical errors, repeated warnings, or unusual activity patterns. If you find specific error codes or software names, use Google Search to get up-to-date information on them.

Logs:
${logMessages}

Health Summary:
`;

    try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                thinkingConfig: { thinkingBudget: 32768 }
            },
        });

        const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

        return {
            analysis: response.text || "No response generated.",
            citations: citations.map((c: any) => c.web).filter(Boolean)
        };
    } catch (error) {
        console.error("Error during AI log analysis:", error);
        this.addLog('ERROR', 'AI analysis failed. See browser console for details.');
        throw new Error("Failed to get analysis from AI.");
    }
  }

  async generateUsernameWithAi(existingUsernames: string[]): Promise<string> {
    if (!this.ai) { throw new Error("AI client not initialized."); }

    const prompt = `Generate a single, cool, unique, and easy-to-remember username. It should be one word, lowercase, and suitable for a tech service. Do not use any of these existing names: ${existingUsernames.join(', ')}.`;

    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // Clean up the response to ensure it's a single word
        return response.text.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/gi, '');
    } catch (error) {
        console.error("AI username generation failed:", error);
        return `user_${Math.random().toString(36).substring(2, 8)}`; // Fallback
    }
  }

  startChat() {
    if (!this.ai) {
        throw new Error("AI client not initialized.");
    }
    const systemInstruction = "You are a helpful assistant for the administrator of 'Project Elaheh', a sophisticated VPN and network tunneling panel. Your role is to provide clear, concise, and expert advice on network configuration, user management, security best practices, and troubleshooting. Be professional and helpful. Your responses should be in Markdown format.";
    this.chat.set(
        this.ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction }
        })
    );
  }

  async sendMessageStream(message: string) {
    if (!this.chat()) {
        this.startChat();
    }
    if (!this.chat()) { // Check again after trying to start
        throw new Error("Chat could not be initialized.");
    }
    return this.chat()!.sendMessageStream({ message });
  }

  // --- End of AI Methods ---
  
  // --- Fix: Implement missing methods ---
  toggleTheme() {
    this.theme.update(current => (current === 'dark' ? 'light' : 'dark'));
  }

  updateAdminCredentials(username: string, password_not_used: string) {
    this.adminUsername.set(username);
    // In a real app, we'd hash the password. For this demo, we'll just log it.
    this.addLog('INFO', `Admin username changed to '${username}'.`);
  }

  updateAdminEmail(email: string) {
    this.adminEmail.set(email);
    this.addLog('INFO', `Admin email updated.`);
  }

  updateBranding(name: string, logo: string | null, currency: string) {
    this.brandName.set(name);
    this.brandLogo.set(logo);
    this.currency.set(currency);
  }

  updateProduct(index: number, product: Product) {
    this.products.update(products => {
        const newProducts = [...products];
        newProducts[index] = product;
        return newProducts;
    });
  }

  updateGateway(id: string, merchantId: string, isEnabled: boolean) {
      this.paymentGateways.update(gateways => gateways.map(g => g.id === id ? {...g, merchantId, isEnabled} : g));
  }
  
  addEdgeServer(server: EdgeServer) {
      this.edgeServers.update(servers => [...servers, server]);
  }
  
  removeEdgeServer(id: string) {
      this.edgeServers.update(servers => servers.filter(s => s.id !== id));
  }
  
  connectToUpstream(token: string) {
      const parsed = this.parseConnectionToken(token);
      if (parsed) {
          this.upstreamNode.set(parsed.host);
          this.upstreamStatus.set('connected');
          this.addLog('SUCCESS', `Successfully connected to upstream node: ${parsed.host}`);
      } else {
          this.addLog('ERROR', 'Failed to connect to upstream: Invalid token.');
      }
  }

  importUsersFromPanel(panelType: 'marzban' | 'x-ui' | '3x-ui', config: string) {
    this.addLog('INFO', `Starting user import from ${panelType}.`);
    try {
        const lines = config.split('\n').filter(line => line.trim() !== '');
        let count = 0;
        lines.forEach((line) => {
            const parts = line.split(',');
            if (parts.length >= 3) {
                const username = parts[0].trim();
                const quota = parseInt(parts[1], 10);
                const days = parseInt(parts[2], 10);

                if (username && !isNaN(quota) && !isNaN(days)) {
                    this.addUser(username, quota, days, 2);
                    count++;
                }
            }
        });
        if (count > 0) {
            this.addLog('SUCCESS', `Successfully imported ${count} users from ${panelType} config.`);
        } else {
            this.addLog('WARN', 'No valid users found in the provided config to import.');
        }
    } catch (e) {
        this.addLog('ERROR', 'Failed to parse panel config. Please check the format.');
        console.error("Import error:", e);
    }
  }

  async fetchIpLocation(ip?: string): Promise<any> {
    const url = ip ? `https://ipwho.is/${ip}` : 'https://ipwho.is/';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.success ? data : { success: false, message: 'Failed to fetch IP data' };
    } catch (error) {
        console.error("Error fetching IP location:", error);
        return { success: false, message: 'Could not fetch IP location.' };
    }
  }
  
  // --- User Management ---
  addUser(username: string, quotaGb: number, expiryDays: number, concurrentConnectionsLimit: number, mode: 'auto' | 'manual' = 'auto', manualConfig: any = null) {
    const newUser: User = {
      id: this.generateRandomKey(8),
      username,
      quotaGb,
      usedGb: 0,
      uploadGb: 0,
      downloadGb: 0,
      expiryDays,
      status: 'active',
      links: this.generateLinksForUser(username, mode, manualConfig),
      concurrentConnectionsLimit,
      currentConnections: 0,
      subscriptionLink: `https://${this.subscriptionDomain() || this.customDomain() || 'example.com'}/sub/${this.generateRandomKey(16)}`,
      udpEnabled: true,
    };
    this.users.update(users => [...users, newUser]);
    this.addLog('SUCCESS', `User '${username}' created successfully.`);
  }

  removeUser(userId: string) {
      this.users.update(users => users.filter(u => u.id !== userId));
  }
  
  removeLinkFromUser(userId: string, linkIndex: number) {
      this.users.update(users => users.map(u => {
          if (u.id === userId) {
              const newLinks = [...u.links];
              newLinks.splice(linkIndex, 1);
              return { ...u, links: newLinks };
          }
          return u;
      }));
  }

  updateUserConcurrencyLimit(userId: string, limit: number) {
      this.users.update(users => users.map(u => u.id === userId ? { ...u, concurrentConnectionsLimit: limit } : u));
  }

  exportUsersJSON(): string {
      return JSON.stringify(this.users(), null, 2);
  }

  importUsersJSON(json: string) {
      try {
          const importedUsers = JSON.parse(json) as User[];
          // Basic validation
          if (Array.isArray(importedUsers) && importedUsers.every(u => u.id && u.username)) {
              this.users.set(importedUsers);
              this.addLog('SUCCESS', `${importedUsers.length} users imported successfully.`);
          } else {
              throw new Error('Invalid user format.');
          }
      } catch (e) {
          this.addLog('ERROR', 'Failed to import users from JSON. Check format.');
      }
  }

  // --- Settings Methods ---
  setTunnelMode(mode: 'auto' | 'manual') {
      this.tunnelMode.set(mode);
  }
  
  updateDomainSettings(config: { domain: string, subDomain: string, certPath: string, keyPath: string }) {
      this.customDomain.set(config.domain);
      this.subscriptionDomain.set(config.subDomain);
      this.sslCertPath.set(config.certPath);
      this.sslKeyPath.set(config.keyPath);
  }

  activateDohResolver(subdomain: string) {
      this.dohSubdomain.set(subdomain);
      this.dohStatus.set('creating');
      setTimeout(() => {
          this.dohStatus.set('active');
          this.addLog('SUCCESS', `DoH Resolver is active at ${this.dohUrl()}`);
      }, 2000);
  }

  deactivateDohResolver() {
      this.isDohEnabled.set(false);
      this.dohStatus.set('inactive');
  }

  updateIapConfig(config: { projectId: string, zone: string, instanceName: string }) {
      this.iapConfig.set(config);
  }
  
  runNatTypeDetection() {
      this.natStatus.set('Detecting');
      setTimeout(() => {
          this.detectedNatType.set('Full Cone (Type 1)');
          this.detectedPublicIp.set('81.22.14.96');
          this.natStatus.set('Connected');
      }, 2500);
  }

  updateNatConfig(config: any) {
      this.natConfig.set(config);
  }

  addSshRule(rule: SshRule) {
      this.sshRules.update(rules => [...rules, rule]);
  }

  removeSshRule(id: string) {
      this.sshRules.update(rules => rules.filter(r => r.id !== id));
  }

  async testTelegramBot(config: TelegramBotConfig): Promise<boolean> {
      this.addLog('INFO', `Testing Telegram bot connection...`);
      // Simulate API call
      return new Promise(resolve => {
          setTimeout(() => {
              const success = config.token.length > 10 && config.adminChatId.length > 5;
              resolve(success);
          }, 1500);
      });
  }

  updateTelegramBotConfig(config: TelegramBotConfig) {
      this.telegramBotConfig.set(config);
  }
  
  generateNew2faSecret(): string {
      // In a real app, use a proper library. This is a placeholder.
      const secret = 'JBSWY3DPEHPK3PXP'; // Example secret
      this.twoFactorSecret.set(secret);
      return secret;
  }
  
  updateTlsCamouflage(enabled: boolean, sni: string) {
    this.tlsCamouflageEnabled.set(enabled);
    if (enabled) {
        if (sni && sni.includes('.')) {
            this.tlsCamouflageSni.set(sni);
            this.tlsCamouflageStatus.set('active');
            this.addLog('SUCCESS', `[TLS Camouflage] Enabled. Mimicking SNI: ${sni}`);
        } else {
            this.tlsCamouflageEnabled.set(false);
            this.tlsCamouflageStatus.set('error');
            this.addLog('ERROR', `[TLS Camouflage] Invalid SNI provided: ${sni}`);
        }
    } else {
        this.tlsCamouflageStatus.set('inactive');
        this.addLog('INFO', '[TLS Camouflage] Disabled.');
    }
  }
  
  // FIX: Add method for Application Camouflage
  updateApplicationCamouflage(enabled: boolean, profile: GameProfile | null) {
    this.applicationCamouflageEnabled.set(enabled);
    if (enabled && profile) {
        this.applicationCamouflageProfile.set(profile);
        this.addLog('SUCCESS', `[App Camouflage] Enabled for ${profile}.`);
    } else {
        // if enabled is false, or profile is null
        this.applicationCamouflageEnabled.set(false); // ensure it's off
        this.applicationCamouflageProfile.set(null);
        this.applicationCamouflageStatus.set('Idle');
        this.addLog('INFO', '[App Camouflage] Disabled.');
    }
  }

  // --- Store Methods ---
  createOrder(productId: string, email: string, telegram: string, gatewayId: string): Order {
      const product = this.products().find(p => p.id === productId);
      if (!product) throw new Error('Product not found');

      const newOrder: Order = {
          id: this.generateRandomKey(10),
          productId: productId,
          amount: product.price,
          currency: this.currency(),
          customerEmail: email,
          customerTelegram: telegram,
          gatewayId: gatewayId,
          status: 'PENDING',
          createdAt: new Date(),
      };
      this.orders.update(o => [...o, newOrder]);
      return newOrder;
  }

  completeOrder(orderId: string, transactionId: string): Order | undefined {
      let completedOrder: Order | undefined;
      this.orders.update(orders => orders.map(o => {
          if (o.id === orderId) {
              const product = this.products().find(p => p.id === o.productId)!;
              const newUserId = `u_${orderId}`;
              // For simplicity, we create a user here.
              this.addUser(newUserId, product.trafficGb, product.durationDays, product.userLimit);
              const newUser = this.users().find(u => u.username === newUserId);

              completedOrder = { 
                  ...o, 
                  status: 'PAID', 
                  paidAt: new Date(), 
                  transactionId,
                  generatedUserId: newUserId,
                  generatedSubLink: newUser?.subscriptionLink
              };
              return completedOrder;
          }
          return o;
      }));
      return completedOrder;
  }
  
  setEndpointStrategy(strategy: EndpointStrategy, manual = false) {
    this.activeStrategy.set(strategy);
    if(manual) this.setTunnelMode('manual');
    this.addLog('SUCCESS', `Endpoint strategy switched to ${strategy.providerName}.`);
  }

  // --- Private & Utility Methods ---
  private initSimulatedMetrics() {
    setInterval(() => {
      this.serverLoad.set(Math.floor(Math.random() * 60 + 20)); // 20-80%
      this.memoryUsage.set(Math.floor(Math.random() * 40 + 30)); // 30-70%
      this.transferRateMbps.set(Math.floor(Math.random() * 200 + 50)); // 50-250Mbps
    }, 2000);
  }
  
  private startNatKeepAlive() {
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
    const interval = (this.natConfig().keepAliveIntervalSec || 30) * 1000;
    this.keepAliveTimer = setInterval(() => {
        if (this.serverRole() === 'iran') {
            this.addLog('INFO', '[NAT] Sending keep-alive to upstream...');
        }
    }, interval);
  }

  private startAutoTesting() {
    if (this.autoTestIntervalId) clearInterval(this.autoTestIntervalId);
    if (this.countdownIntervalId) clearInterval(this.countdownIntervalId);

    this.nextAutoTestSeconds.set(this.AUTO_TEST_INTERVAL_SECONDS);
    this.runTunnelAnalysis();

    this.autoTestIntervalId = setInterval(() => {
        this.runTunnelAnalysis();
        this.nextAutoTestSeconds.set(this.AUTO_TEST_INTERVAL_SECONDS);
    }, this.AUTO_TEST_INTERVAL_SECONDS * 1000);

    this.countdownIntervalId = setInterval(() => {
        this.nextAutoTestSeconds.update(s => (s > 0 ? s - 1 : 0));
    }, 1000);
  }

  runTunnelAnalysis() {
    if (this.isTestingTunnels()) return;
    this.isTestingTunnels.set(true);
    this.addLog('INFO', 'Starting tunnel performance analysis...');

    this.tunnelProviders.update(providers =>
        providers.map(p => ({ ...p, status: 'testing', latencyMs: null, jitterMs: null }))
    );

    const promises = this.tunnelProviders().map((provider, index) =>
        new Promise<void>(resolve => {
            const delay = 1000 + Math.random() * 1500;
            setTimeout(() => {
                const failed = Math.random() < 0.1; // 10% fail chance
                this.tunnelProviders.update(providers => {
                    const newProviders = [...providers];
                    const p = newProviders[index];
                    if (failed) {
                        p.status = 'failed';
                    } else {
                        p.latencyMs = 20 + Math.floor(Math.random() * 130);
                        p.jitterMs = 2 + Math.floor(Math.random() * 20);
                        p.status = p.latencyMs! < 100 ? 'optimal' : 'suboptimal';
                    }
                    return newProviders;
                });
                resolve();
            }, delay);
        })
    );

    Promise.all(promises).then(() => {
        this.isTestingTunnels.set(false);
        const optimal = this.tunnelProviders().filter(p => p.status === 'optimal').sort((a, b) => a.latencyMs! - b.latencyMs!);
        if (optimal.length > 0) {
             this.addLog('SUCCESS', `Tunnel analysis complete. Best provider: ${optimal[0].name} at ${optimal[0].latencyMs}ms.`);
        } else {
             this.addLog('WARN', 'Tunnel analysis complete. No optimal providers found.');
        }
    });
  }

  generateConnectionToken(): string {
    const host = this.customDomain() || 'YOUR_IP_OR_DOMAIN';
    const payload = { host, authKey: this.generateRandomKey(32) };
    const jsonString = JSON.stringify(payload);
    return 'EL-LINK-' + btoa(jsonString);
  }

  parseConnectionToken(token: string): { host: string, authKey: string } | null {
    if (!token.startsWith('EL-LINK-')) return null;
    try {
        const base64Part = token.substring('EL-LINK-'.length);
        const jsonString = atob(base64Part);
        const payload = JSON.parse(jsonString);
        if (payload.host && payload.authKey) {
            return payload;
        }
        return null;
    } catch (e) {
        console.error('Failed to parse connection token', e);
        return null;
    }
  }

  private generateRandomKey(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  private generateLinksForUser(username: string, mode: 'auto' | 'manual', manualConfig: any): LinkConfig[] {
    if (mode === 'manual' && manualConfig) {
      return [{
          url: `manual://config_not_real`,
          alias: `Manual ${manualConfig.protocol}`,
          quotaGb: null,
          expiryDate: null,
          protocol: manualConfig.protocol,
          description: `Manual Config for ${username}`
      }];
    }
    
    const server = this.getActiveHosts()[0].host;
    return [
        { protocol: 'vless', alias: 'VLESS (CDN)', description: 'Best for Obfuscation' },
        { protocol: 'trojan', alias: 'Trojan GFW', description: 'Simple & Fast' },
        { protocol: 'wireguard', alias: 'WireGuard', description: 'Best for Gaming (UDP)' }
    ].map(p => ({
        ...p,
        url: `${p.protocol}://${this.generateRandomKey(16)}@${server}:443?security=reality&sni=google.com#${encodeURIComponent(p.alias)}-${username}`,
        quotaGb: null,
        expiryDate: null,
    } as LinkConfig));
  }
}