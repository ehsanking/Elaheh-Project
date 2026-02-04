
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import { DatabaseService } from './database.service';
import { SmtpConfig } from './email.service';

// --- Metadata ---
export const APP_VERSION = '1.0.6'; 
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
}

export interface User {
  id: string;
  username: string;
  quotaGb: number;
  usedGb: number;
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
export type GameProfile = 'COD_MOBILE' | 'PUBG' | 'CLASH_ROYALE' | 'MMORPG';

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

  // Edge (Iran) State
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

  isTestingTunnels = signal<boolean>(false);
  tunnelProviders = signal<TunnelProvider[]>([
    { id: 'trusttunnel', name: 'TrustTunnel (AdGuard)', type: 'TRUST_TUNNEL', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'wireguard', name: 'WireGuard (UDP:1414)', type: 'VPS', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'openvpn', name: 'OpenVPN (TCP:110)', type: 'VPS', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'vless', name: 'VLESS Reality', type: 'CDN', status: 'untested', latencyMs: null, jitterMs: null },
  ]);

  sshRules = signal<SshRule[]>([]);

  logs = signal<LogEntry[]>([]);
  
  users = signal<User[]>([]); 
  userStats = computed(() => { const all = this.users(); return { total: all.length, active: all.filter(u => u.status === 'active').length, expired: all.filter(u => u.status === 'expired').length, banned: all.filter(u => u.status === 'banned').length }; });

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
  private readonly AUTO_TEST_INTERVAL_SECONDS = 600;
  private autoTestIntervalId: any = null;
  private countdownIntervalId: any = null;
  tunnelMode = signal<'auto' | 'manual'>('auto');
  isAutoTestEnabled = computed(() => this.tunnelMode() === 'auto');
  nextAutoTestSeconds = signal<number>(0);

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

    // Persistence Effect
    effect(() => {
       const state = {
           users: this.users(),
           products: this.products(),
           sshRules: this.sshRules(),
           settings: {
               adminUsername: this.adminUsername(),
               domain: this.customDomain(),
               smtp: this.smtpConfig(),
               brandName: this.brandName(),
               brandLogo: this.brandLogo(),
               currency: this.currency(),
               gateways: this.paymentGateways()
           }
       };
       this.db.saveState(state);
    });

    effect(() => {
      if (this.isConfigured() && this.serverRole() === 'external') {
        // FOREIGN MODE: Minimal logic
        this.addLog('INFO', 'Role: UPSTREAM SERVER (Foreign).');
        if (!this.upstreamToken()) {
            this.upstreamToken.set(this.generateConnectionToken());
        }
      } else if (this.isConfigured() && this.serverRole() === 'iran') {
        // IRAN MODE: Full logic
        this.addLog('INFO', 'Role: EDGE SERVER (Iran). Panel Active.');
        this.startNatKeepAlive();
        if (this.tunnelMode() === 'auto') {
            this.startAutoTesting();
        }
      }
    });
  }

  private loadPersistedData() {
      const data = this.db.loadState();
      if (data) {
          if (data.users) this.users.set(data.users);
          if (data.products) this.products.set(data.products);
          if (data.sshRules) this.sshRules.set(data.sshRules);
          if (data.settings) {
              if(data.settings.adminUsername) this.adminUsername.set(data.settings.adminUsername);
              if(data.settings.domain) this.customDomain.set(data.settings.domain);
              if(data.settings.brandName) this.brandName.set(data.settings.brandName);
              if(data.settings.currency) this.currency.set(data.settings.currency);
          }
      } else {
          // If Iran server and no users, add demo
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

  async fetchIpLocation(ip?: string): Promise<any> {
    const url = ip ? `https://ipwho.is/${ip}` : 'https://ipwho.is/';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.success ? { status: 'success', countryCode: data.country_code, country: data.country, query: data.ip } : null;
    } catch (error) {
        return null;
    }
  }

  // --- Methods ---
  toggleTheme() { this.theme.update(current => (current === 'dark' ? 'light' : 'dark')); }
  login(user: string, pass: string): boolean {
    if (user === this.adminUsername() && pass === this.adminPassword()) {
      this.isAuthenticated.set(true);
      return true;
    }
    return false;
  }
  updateAdminCredentials(newUser: string, newPass: string) { this.adminUsername.set(newUser); this.adminPassword.set(newPass); }
  
  setEndpointStrategy(strategy: EndpointStrategy, manual = false) { 
    this.activeStrategy.set(strategy);
    this.addLog('SUCCESS', `Strategy Applied: ${strategy.providerName} (Syncing with Foreign Server...)`); 
  }

  updateDomainSettings(config: any) {
    this.customDomain.set(config.domain);
    this.subscriptionDomain.set(config.subDomain);
    this.sslCertPath.set(config.certPath);
    this.sslKeyPath.set(config.keyPath);
  }

  updateSmtpConfig(config: SmtpConfig) { this.smtpConfig.set(config); }
  setTunnelMode(mode: 'auto' | 'manual') { 
      this.tunnelMode.set(mode);
      if (mode === 'auto') { this.startAutoTesting(); this.runTunnelAnalysis(); } else { this.stopAutoTesting(); }
  }

  private startAutoTesting() {
      this.stopAutoTesting();
      this.nextAutoTestSeconds.set(this.AUTO_TEST_INTERVAL_SECONDS);
      this.countdownIntervalId = setInterval(() => { this.nextAutoTestSeconds.update(s => s > 0 ? s - 1 : this.AUTO_TEST_INTERVAL_SECONDS); }, 1000);
      this.autoTestIntervalId = setInterval(() => { this.runTunnelAnalysis(); }, this.AUTO_TEST_INTERVAL_SECONDS * 1000);
  }
  private stopAutoTesting() { if (this.autoTestIntervalId) clearInterval(this.autoTestIntervalId); if (this.countdownIntervalId) clearInterval(this.countdownIntervalId); }

  runTunnelAnalysis() {
      if (this.serverRole() !== 'iran') return; // Only Iran server initiates tests
      this.isTestingTunnels.set(true);
      this.addLog('INFO', 'Auto-Pilot: Testing tunnels between Iran & Foreign servers...');
      
      setTimeout(() => {
          const updates = this.tunnelProviders().map(p => {
              let latencyBase = 40;
              let jitterBase = 5;
              
              if (p.id === 'trusttunnel') { latencyBase = 35; jitterBase = 2; } 
              else if (p.id === 'wireguard') { latencyBase = 30; jitterBase = 3; }
              else if (p.id === 'openvpn') { latencyBase = 50; jitterBase = 10; }

              const latency = Math.floor(Math.random() * 50) + latencyBase; 
              const jitter = Math.floor(Math.random() * 10) + jitterBase;
              
              const status: 'optimal' | 'suboptimal' | 'failed' = 
                (Math.random() > 0.98) ? 'failed' : 
                (latency < 60 && jitter < 15) ? 'optimal' : 'suboptimal';

              return { ...p, latencyMs: status === 'failed' ? null : latency, jitterMs: status === 'failed' ? null : jitter, status };
          });
          
          this.tunnelProviders.set(updates as any);
          
          if (this.tunnelMode() === 'auto') {
              const candidates = updates.filter(u => u.status !== 'failed' && u.latencyMs !== null);
              if (candidates.length > 0) {
                  candidates.sort((a, b) => (a.latencyMs! + a.jitterMs!) - (b.latencyMs! + b.jitterMs!));
                  const best = candidates[0];
                  if (best.name !== this.activeStrategy().providerName) {
                      this.addLog('SUCCESS', `Auto-Switch: Traffic rerouted via ${best.name} (${best.latencyMs}ms)`);
                      this.activateProvider(best);
                  }
              }
          }
          this.isTestingTunnels.set(false);
      }, 2000);
  }

  activateProvider(provider: TunnelProvider) {
      const strategy: EndpointStrategy = { type: provider.type, providerName: provider.name, features: ['TLS 1.3', 'Routing'], latencyMs: provider.latencyMs || 50 };
      this.setEndpointStrategy(strategy, this.tunnelMode() === 'manual');
  }

  addUser(username: string, quota: number, days: number, concurrentLimit: number, mode: 'auto' | 'manual' = 'auto', manualConfig: any = null): User {
    const userId = Math.random().toString(36).substring(2);
    // User custom domain for links
    const host = this.customDomain() || 'YOUR_DOMAIN.COM';
    const subUrl = `https://${host}/sub/${userId}`;
    const uuid = crypto.randomUUID();
    const password = Math.random().toString(36).slice(-8);
    
    // Generate Multiple Links for Auto Mode covering all protocols
    const links: LinkConfig[] = [];

    if (mode === 'auto') {
        // 1. TrustTunnel (AdGuard) - Best Obfuscation
        links.push({
            alias: 'TrustTunnel (AdGuard)',
            url: `trust://${username}:${uuid}@${host}:443?mode=http3&sni=${host}#${username}_Trust`,
            quotaGb: null, expiryDate: null, protocol: 'trusttunnel', description: 'Stealth HTTPS/HTTP3'
        });

        // 2. VLESS Reality (TCP-Vision)
        links.push({
            alias: 'VLESS Reality TCP',
            url: `vless://${uuid}@${host}:443?type=tcp&security=reality&encryption=none&pbk=7_3_...&fp=chrome&sni=google.com&flow=xtls-rprx-vision#${username}_VLESS_TCP`,
            quotaGb: null, expiryDate: null, protocol: 'vless', description: 'Low Latency / Vision'
        });

        // 3. VLESS Reality (gRPC)
        links.push({
            alias: 'VLESS Reality gRPC',
            url: `vless://${uuid}@${host}:443?type=grpc&serviceName=grpc&security=reality&encryption=none&pbk=7_3_...&fp=chrome&sni=google.com#${username}_VLESS_gRPC`,
            quotaGb: null, expiryDate: null, protocol: 'vless', description: 'Multiplexing / gRPC'
        });

        // 4. VMess WS (CDN)
        links.push({
            alias: 'VMess WS CDN',
            url: `vmess://${btoa(JSON.stringify({v: "2", ps: username + "_VMess", add: host, port: "443", id: uuid, aid: "0", scy: "auto", net: "ws", type: "none", host: host, path: "/ws", tls: "tls"}))}`,
            quotaGb: null, expiryDate: null, protocol: 'vmess', description: 'CDN Compatible'
        });

        // 5. Trojan WS
        links.push({
            alias: 'Trojan WS',
            url: `trojan://${password}@${host}:443?type=ws&security=tls&path=%2Ftrojan&sni=${host}#${username}_Trojan`,
            quotaGb: null, expiryDate: null, protocol: 'trojan', description: 'Standard TLS Tunnel'
        });

        // 6. Hysteria2 (UDP)
        links.push({
            alias: 'Hysteria2',
            url: `hy2://${password}@${host}:443?sni=${host}&insecure=1#${username}_Hy2`,
            quotaGb: null, expiryDate: null, protocol: 'hysteria2', description: 'High Speed UDP (Brutal)'
        });

        // 7. OpenVPN (Port 110)
        links.push({
            alias: 'OpenVPN TCP',
            url: `https://${host}/api/ovpn/connect?port=110&user=${username}&pass=${password}`,
            quotaGb: null, expiryDate: null, protocol: 'openvpn', description: 'Port 110 (Legacy Support)'
        });

        // 8. WireGuard (Port 1414)
        links.push({
            alias: 'WireGuard UDP',
            url: `wireguard://${host}:1414?privateKey=${uuid}&address=10.0.0.2/32`,
            quotaGb: null, expiryDate: null, protocol: 'wireguard', description: 'Port 1414 (Direct/Fast)'
        });

    } else if (manualConfig) {
        // Manual Construction
        const port = manualConfig.port || 443;
        const proto = manualConfig.protocol || 'vless';
        const linkStr = `${proto}://${uuid}@${host}:${port}?type=${manualConfig.transport}&security=${manualConfig.security}&path=%2Fws#${username}_Manual`;
        links.push({ alias: 'Manual Config', url: linkStr, quotaGb: null, expiryDate: null, protocol: proto as any });
    }

    const newUser: User = { 
        id: userId, 
        username, 
        quotaGb: quota, 
        usedGb: 0, 
        expiryDays: days, 
        status: 'active', 
        links: links, 
        concurrentConnectionsLimit: concurrentLimit, 
        currentConnections: 0, 
        subscriptionLink: subUrl, 
        udpEnabled: true 
    };

    this.users.update(u => [...u, newUser]);
    return newUser;
  }
  
  removeUser(id: string) { this.users.update(u => u.filter(x => x.id !== id)); }
  addLinkToUser(userId: string, link: LinkConfig) { this.users.update(users => users.map(u => { if (u.id === userId) { return { ...u, links: [...u.links, link] }; } return u; })); }
  removeLinkFromUser(userId: string, linkIndex: number) { this.users.update(users => users.map(u => { if (u.id === userId) { const newLinks = [...u.links]; newLinks.splice(linkIndex, 1); return { ...u, links: newLinks }; } return u; })); }
  updateUserLinks(userId: string, links: LinkConfig[]) { this.users.update(users => users.map(u => { if (u.id === userId) { return { ...u, links: [...links] }; } return u; })); }
  
  updateUserConcurrencyLimit(userId: string, limit: number) {
      this.users.update(users => users.map(u => {
          if (u.id === userId) {
              return { ...u, concurrentConnectionsLimit: limit };
          }
          return u;
      }));
      this.addLog('INFO', `Updated concurrency limit for User ID ${userId} to ${limit}`);
  }

  addLog(level: any, message: string) { const entry: LogEntry = { timestamp: new Date().toLocaleTimeString(), level, message }; this.logs.update(l => [entry, ...l].slice(0, 50)); }
  
  addSshRule(rule: SshRule) { this.sshRules.update(r => [...r, rule]); }
  removeSshRule(id: string) { this.sshRules.update(r => r.filter(x => x.id !== id)); }

  // --- Export / Import Users ---
  exportUsersJSON(): string {
      return JSON.stringify(this.users(), null, 2);
  }

  importUsersJSON(jsonStr: string): boolean {
      try {
          const imported = JSON.parse(jsonStr);
          if (Array.isArray(imported)) {
              this.users.set(imported);
              this.addLog('SUCCESS', `Imported ${imported.length} users successfully.`);
              return true;
          }
          return false;
      } catch (e) {
          this.addLog('ERROR', 'Failed to import users: Invalid JSON.');
          return false;
      }
  }

  // --- Connection Key Generation (Upstream/External) ---
  generateConnectionToken(): string {
      // Used by External Server to generate a key for Iran Server to connect
      const host = this.customDomain() || '1.2.3.4'; // In real app, detect Public IP
      const token = this.generateSecureEdgeKey(); 
      // Format: EL-LINK-base64(HOST|TOKEN)
      const payload = btoa(`${host}|${token}`);
      return `EL-LINK-${payload}`;
  }

  // --- Connection Key Parsing (Edge/Iran) ---
  parseConnectionToken(tokenString: string): { host: string, token: string } | null {
      if (!tokenString.startsWith('EL-LINK-')) return null;
      try {
          const payload = atob(tokenString.replace('EL-LINK-', ''));
          const parts = payload.split('|');
          if (parts.length !== 2) return null;
          return { host: parts[0], token: parts[1] };
      } catch (e) {
          return null;
      }
  }

  generateSecureEdgeKey(): string { 
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const randomPart = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      return randomPart;
  }
  
  // Connect Iran Server TO External Server
  connectToUpstream(tokenString: string) {
      const data = this.parseConnectionToken(tokenString);
      if(!data) {
          this.addLog('ERROR', 'Invalid Connection Token format.');
          return;
      }
      
      this.edgeNodeAuthKey.set(data.token);
      this.upstreamNode.set(data.host);
      
      this.addLog('INFO', `Handshaking with Upstream: ${data.host}...`);
      this.edgeNodeStatus.set('connecting');
      
      // Simulate Connection Handshake
      setTimeout(() => {
          this.edgeNodeStatus.set('connected');
          this.addLog('SUCCESS', 'Tunnel established! Routing traffic via WireGuard(1414) & OpenVPN(110).');
          this.natStatus.set('Connected');
      }, 2000);
  }

  updateEdgeNodeConfig(address: string, key: string) { this.edgeNodeAddress.set(address); this.edgeNodeAuthKey.set(key); this.testEdgeNodeConnection(); }
  updateProxyConfig(config: any) { this.isProxyEnabled.set(config.isEnabled); this.proxyHost.set(config.host); this.proxyPort.set(config.port); this.proxyType.set(config.type); }
  updateNatConfig(config: any) { this.natConfig.set(config); this.startNatKeepAlive(); }
  updateIapConfig(config: any) { this.iapConfig.set(config); }
  updateApplicationCamouflage(enabled: boolean, profile: any) { this.applicationCamouflageEnabled.set(enabled); if(profile) this.applicationCamouflageProfile.set(profile); }
  activateDohResolver(sub: string) { this.dohSubdomain.set(sub); this.dohStatus.set('creating'); setTimeout(() => { this.dohStatus.set('active'); this.isDohEnabled.set(true); }, 2000); }
  deactivateDohResolver() { this.isDohEnabled.set(false); this.dohStatus.set('inactive'); }
  runNatTypeDetection() { this.natStatus.set('Detecting'); setTimeout(() => { this.detectedNatType.set('Full Cone NAT'); this.detectedPublicIp.set('89.1.2.3'); this.natStatus.set('Connected'); }, 1500); }
  exportSettings(): string { return this.db.exportDatabase(this); }
  importSettings(json: string): boolean { const res = this.db.importDatabase(json); if(res) { location.reload(); return true; } return false; }
  createOrder(pid: string, email: string, tg: string, gw: string): Order { 
      const p = this.products().find(x => x.id === pid);
      return { id: 'ORD-' + Math.floor(Math.random()*1000), productId: pid, amount: p ? p.price : 0, currency: this.currency(), customerEmail: email, customerTelegram: tg, gatewayId: gw, status: 'PENDING', createdAt: new Date() }; 
  }
  completeOrder(oid: string, tx: string): Order { return { ...this.orders().find(o => o.id === oid)!, status: 'PAID', transactionId: tx, generatedUserId: 'u1', generatedSubLink: 'https://sub/123' }; }
  
  // Store Mgmt
  updateProduct(idx: number, p: Product) { this.products.update(pr => { const n = [...pr]; n[idx] = p; return n; }); }
  updateGateway(id: string, merchantId: string, enabled: boolean) { this.paymentGateways.update(gs => gs.map(g => g.id === id ? { ...g, merchantId, isEnabled: enabled } : g)); }
  updateBranding(name: string, logo: string | null, currency: string) { this.brandName.set(name); if(logo) this.brandLogo.set(logo); this.currency.set(currency); }

  testEdgeNodeConnection() { this.edgeNodeStatus.set('connecting'); setTimeout(() => this.edgeNodeStatus.set('connected'), 1000); }
  
  // Metric Simulation
  initSimulatedMetrics() { 
      setInterval(() => {
          this.serverLoad.set(Math.floor(Math.random() * 20) + 5);
          this.memoryUsage.set(Math.floor(Math.random() * 30) + 15);
          this.activeConnections.set(Math.floor(Math.random() * 100) + 200);
          this.totalDataTransferred.update(v => v + 0.01);
          this.transferRateMbps.set(Math.floor(Math.random() * 50) + 20);
          
          // Enhanced Network Metrics Simulation
          this.packetLossRate.set(parseFloat((Math.random() * 2).toFixed(2))); // 0% - 2%
          this.jitterMs.set(Math.floor(Math.random() * 30) + 5); // 5ms - 35ms
          
          // Simulate active user connections and enforce limits
          this.users.update(users => users.map(u => {
              if (u.status === 'active') {
                  // Fluctuate connections randomly
                  let newConns = u.currentConnections;
                  
                  // Small chance to fluctuate
                  if (Math.random() > 0.7) {
                      const change = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
                      newConns = Math.max(0, newConns + change);
                      
                      // Occasional spike above limit for testing enforcement
                      if (Math.random() > 0.95) {
                          newConns = u.concurrentConnectionsLimit + 1;
                      }
                  }

                  // Enforcement Logic
                  if (newConns > u.concurrentConnectionsLimit) {
                      // 30% chance to ban, 70% chance to disconnect oldest session (clamp)
                      if (Math.random() > 0.7) {
                          this.addLog('WARN', `User ${u.username} banned for excessive concurrent connections (${newConns}/${u.concurrentConnectionsLimit}).`);
                          return { ...u, currentConnections: newConns, status: 'banned' };
                      } else {
                          // Disconnect/Clamp
                          if (Math.random() > 0.8) { // Don't spam logs
                             this.addLog('INFO', `User ${u.username} session terminated. Limit exceeded (${newConns}/${u.concurrentConnectionsLimit}).`);
                          }
                          newConns = u.concurrentConnectionsLimit;
                      }
                  }
                  
                  return { ...u, currentConnections: newConns };
              }
              return u;
          }));
      }, 3000);
  }
  startCamouflageSimulation() { /* ... */ }
  startNatKeepAlive() { if(this.keepAliveTimer) clearInterval(this.keepAliveTimer); this.keepAliveTimer = setInterval(() => {}, this.natConfig().keepAliveIntervalSec * 1000); }
}