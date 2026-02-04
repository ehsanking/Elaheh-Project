
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import { DatabaseService } from './database.service';
import { SmtpConfig } from './email.service';

// --- Metadata ---
export const APP_VERSION = '1.2.0'; 
export const APP_DEFAULT_BRAND = 'SanctionPass Pro'; 

// Declare process for type checking
declare var process: any;

// --- Interfaces ---
export interface LinkConfig {
  url: string;
  alias: string;
  quotaGb: number | null;
  expiryDate: string | null;
  protocol: 'vless' | 'vmess' | 'trojan' | 'trusttunnel' | 'openvpn' | 'shadowsocks';
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
  
  // Dashboard State
  serverLoad = signal<number>(0);
  memoryUsage = signal<number>(0);
  activeConnections = signal<number>(0);
  totalDataTransferred = signal<number>(142.5);
  transferRateMbps = signal<number>(0);
  totalDiskSpaceGb = signal<number>(200);
  usedDiskSpaceGb = signal<number>(64.8);
  diskUsagePercent = computed(() => (this.usedDiskSpaceGb() / this.totalDiskSpaceGb()) * 100);
  
  // Advanced Network Metrics
  packetLossRate = signal<number>(0);
  jitterMs = signal<number>(0);
  geoDistribution = signal<any[]>([
    { country: 'Iran', code: 'IR', percent: 95, count: 0 }, 
    { country: 'Germany', code: 'DE', percent: 5, count: 0 },
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
    { id: 'arvan', name: 'ArvanCloud Relay', type: 'CDN', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'derak', name: 'Derak Cloud', type: 'CDN', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'hetzner', name: 'Hetzner Direct', type: 'VPS', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'cloudflare', name: 'Cloudflare Worker', type: 'CDN', status: 'untested', latencyMs: null, jitterMs: null },
  ]);

  logs = signal<LogEntry[]>([]);
  
  users = signal<User[]>([ { id: '1', username: 'demo_user', quotaGb: 50, usedGb: 12.5, expiryDays: 30, status: 'active', links: [], concurrentConnectionsLimit: 2, currentConnections: 1, subscriptionLink: `https://link.example.com/sub/demo`, udpEnabled: true } ]);
  userStats = computed(() => { const all = this.users(); return { total: all.length, active: all.filter(u => u.status === 'active').length, expired: all.filter(u => u.status === 'expired').length, banned: all.filter(u => u.status === 'banned').length }; });

  // Customizable Products
  products = signal<Product[]>([
    { id: 'p1', title: 'پکیج پایه', description: 'مناسب وب‌گردی و تحقیق', price: 90000, durationDays: 30, trafficGb: 30, userLimit: 1, features: ['۳۰ گیگابایت', '۱ کاربر', 'سرعت بالا', 'آی‌پی ثابت'], highlight: false },
    { id: 'p2', title: 'پکیج حرفه‌ای', description: 'مناسب ترید و فریلنسرها', price: 160000, durationDays: 30, trafficGb: 60, userLimit: 2, features: ['۶۰ گیگابایت', '۲ کاربر', 'پینگ پایین', 'کیل‌سوئیچ'], highlight: true },
    { id: 'p3', title: 'پکیج سازمانی', description: 'مناسب شرکت‌ها و تیم‌ها', price: 290000, durationDays: 60, trafficGb: 120, userLimit: 4, features: ['۱۲۰ گیگابایت', '۴ کاربر', 'مسیر اختصاصی', 'پشتیبانی VIP'], highlight: false },
  ]);
  
  orders = signal<Order[]>([]);
  paymentGateways = signal<PaymentGateway[]>([
    { id: 'zarinpal', name: 'زرین‌پال', logo: 'https://cdn.zarinpal.com/badges/trustLogo/1.svg', url: 'https://www.zarinpal.com', merchantId: '', isEnabled: true, type: 'FIAT' },
    { id: 'payping', name: 'پی‌پینگ', logo: 'https://payping.ir/assets/img/logo-dark.svg', url: 'https://payping.ir', merchantId: '', isEnabled: true, type: 'FIAT' },
    { id: 'nextpay', name: 'نکست‌پی', logo: 'https://nextpay.org/assets/images/logo.png', url: 'https://nextpay.org', merchantId: '', isEnabled: false, type: 'FIAT' },
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

    effect(() => {
       const state = {
           users: this.users(),
           products: this.products(),
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
        this.addLog('INFO', 'System configured as Upstream.');
        this.startCamouflageSimulation();
        if (this.tunnelMode() === 'auto') {
            this.startAutoTesting();
        }
      } else if (this.isConfigured() && this.serverRole() === 'iran') {
        this.addLog('INFO', 'Iran Node Configured. Connecting to Upstream: ' + this.upstreamNode());
        this.startNatKeepAlive();
      }
    });
  }

  private loadPersistedData() {
      const data = this.db.loadState();
      if (data) {
          if (data.users) this.users.set(data.users);
          if (data.products) this.products.set(data.products);
          if (data.settings) {
              if(data.settings.adminUsername) this.adminUsername.set(data.settings.adminUsername);
              if(data.settings.domain) this.customDomain.set(data.settings.domain);
              if(data.settings.smtp) this.smtpConfig.set(data.settings.smtp);
              if(data.settings.brandName) this.brandName.set(data.settings.brandName);
              if(data.settings.brandLogo) this.brandLogo.set(data.settings.brandLogo);
              if(data.settings.currency) this.currency.set(data.settings.currency);
              if(data.settings.gateways) this.paymentGateways.set(data.settings.gateways);
          }
          this.addLog('SUCCESS', 'Settings loaded.');
      }
  }

  private loadServerConfig() {
    fetch('assets/server-config.json')
      .then(res => res.json())
      .then(config => {
        if (config.domain) {
           this.customDomain.set(config.domain);
           if (!this.sslCertPath() || this.sslCertPath().includes('example')) {
                this.sslCertPath.set(`/etc/letsencrypt/live/${config.domain}/fullchain.pem`);
                this.sslKeyPath.set(`/etc/letsencrypt/live/${config.domain}/privkey.pem`);
                this.addLog('INFO', `Auto-configured SSL paths for ${config.domain}`);
           }
        }
        if (config.role) {
            this.serverRole.set(config.role);
            this.isConfigured.set(true);
        }
      })
      .catch(() => {
        // Silent catch
      });
  }

  async fetchIpLocation(ip?: string): Promise<any> {
    const url = ip ? `https://ipwho.is/${ip}` : 'https://ipwho.is/';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (data.success) {
            return {
                status: 'success',
                countryCode: data.country_code,
                country: data.country,
                query: data.ip
            };
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch IP location:', error);
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
    this.addLog('SUCCESS', `Strategy: ${strategy.providerName}`); 
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
      this.isTestingTunnels.set(true);
      this.addLog('INFO', 'Background Service: Scanning tunnel providers (TrustTunnel, Cloudflare, CDN)...');
      
      setTimeout(() => {
          const updates = this.tunnelProviders().map(p => {
              // Simulate realistic network conditions
              let latencyBase = 40;
              let jitterBase = 5;
              
              if (p.id === 'trusttunnel') {
                  // TrustTunnel usually has good performance due to HTTP/3
                  latencyBase = 35;
                  jitterBase = 2;
              } else if (p.type === 'EDGE') {
                  latencyBase = 65;
                  jitterBase = 3;
              } else if (p.type === 'VPS') {
                  latencyBase = 30;
                  jitterBase = 10;
              }

              const latency = Math.floor(Math.random() * 50) + latencyBase; 
              const jitter = Math.floor(Math.random() * 10) + jitterBase;
              
              const status: 'optimal' | 'suboptimal' | 'failed' = 
                (Math.random() > 0.95) ? 'failed' : 
                (latency < 60 && jitter < 15) ? 'optimal' : 'suboptimal';

              const finalLatency = status === 'failed' ? null : latency;
              const finalJitter = status === 'failed' ? null : jitter;

              return { ...p, latencyMs: finalLatency, jitterMs: finalJitter, status };
          });
          
          this.tunnelProviders.set(updates as any);
          
          if (this.tunnelMode() === 'auto') {
              const candidates = updates.filter(u => u.status !== 'failed' && u.latencyMs !== null);
              if (candidates.length > 0) {
                  candidates.sort((a, b) => (a.latencyMs! + a.jitterMs!) - (b.latencyMs! + b.jitterMs!));
                  const best = candidates[0];
                  if (best.name !== this.activeStrategy().providerName) {
                      this.addLog('SUCCESS', `Auto-Switch: Switching to ${best.name} (${best.latencyMs}ms)`);
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
    // Determine the host: If external role, use custom domain. If Iran role, use the Iran Server IP/Domain.
    const host = this.customDomain() || 'YOUR_SERVER_IP';
    const subUrl = `https://${host}/sub/${userId}`;
    const uuid = crypto.randomUUID();
    
    // Generate Multiple Links for Auto Mode
    const links: LinkConfig[] = [];

    if (mode === 'auto') {
        // 1. VLESS Reality (Standard)
        links.push({
            alias: 'VLESS Reality (Auto)',
            url: `vless://${uuid}@${host}:443?type=tcp&security=reality&encryption=none&pbk=7_3_...&fp=chrome&sni=google.com#${username}_VLESS`,
            quotaGb: null, expiryDate: null, protocol: 'vless', description: 'Best for general use'
        });

        // 2. VMess WS (CDN)
        links.push({
            alias: 'VMess WS CDN',
            url: `vmess://${btoa(JSON.stringify({v: "2", ps: username + "_VMess", add: host, port: "443", id: uuid, aid: "0", scy: "auto", net: "ws", type: "none", host: host, path: "/ws", tls: "tls"}))}`,
            quotaGb: null, expiryDate: null, protocol: 'vmess', description: 'Good for CDN tunneling'
        });

        // 3. TrustTunnel (AdGuard - HTTPS/3)
        links.push({
            alias: 'TrustTunnel (AdGuard)',
            url: `trust://${username}:${uuid}@${host}:443?mode=http3&sni=${host}#${username}_Trust`,
            quotaGb: null, expiryDate: null, protocol: 'trusttunnel', description: 'Stealth HTTPS/HTTP3, Hard to detect'
        });

        // 4. OpenVPN (Legacy)
        links.push({
            alias: 'OpenVPN (TCP)',
            url: `https://${host}/api/ovpn/${userId}.ovpn`,
            quotaGb: null, expiryDate: null, protocol: 'openvpn', description: 'Legacy compatibility'
        });

        // 5. Trojan (Direct)
        links.push({
            alias: 'Trojan Direct',
            url: `trojan://${uuid}@${host}:443?security=tls&sni=${host}#${username}_Trojan`,
            quotaGb: null, expiryDate: null, protocol: 'trojan', description: 'Simple & Fast'
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
  addLog(level: any, message: string) { const entry: LogEntry = { timestamp: new Date().toLocaleTimeString(), level, message }; this.logs.update(l => [entry, ...l].slice(0, 50)); }
  
  // --- Connection Key Generation (Upstream/External) ---
  generateConnectionToken(): string {
      // Used by External Server to generate a key for Iran Server to connect
      const host = this.customDomain() || '127.0.0.1'; // In real app, detect Public IP
      const token = this.generateSecureEdgeKey(); // The auth token
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
      
      this.addLog('INFO', `Connecting to Upstream: ${data.host}...`);
      this.edgeNodeStatus.set('connecting');
      
      // Simulate Connection Handshake
      setTimeout(() => {
          this.edgeNodeStatus.set('connected');
          this.addLog('SUCCESS', 'Tunnel established with Upstream Server.');
          // Enable NAT traversal as client
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
  initSimulatedMetrics() { /* ... */ }
  startCamouflageSimulation() { /* ... */ }
  startNatKeepAlive() { if(this.keepAliveTimer) clearInterval(this.keepAliveTimer); this.keepAliveTimer = setInterval(() => {}, this.natConfig().keepAliveIntervalSec * 1000); }
}
