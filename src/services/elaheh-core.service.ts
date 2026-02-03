import { Injectable, signal, computed, effect } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, GenerateContentParameters } from "@google/genai";

// --- Metadata ---
export const APP_VERSION = '1.0.2';
export const APP_AUTHOR = 'EHSANKiNG';
export const APP_SLOGAN = 'اینترنت آزاد برای همه یا هیچکس - Free Internet for everyone or no one';

// --- Interfaces ---
export interface LinkConfig {
  url: string;
  alias: string;
  quotaGb: number | null;
  expiryDate: string | null;
  protocol: string;
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

export type EndpointType = 'CDN' | 'CLOUD' | 'VPS' | 'EDGE' | 'BLOCKCHAIN' | 'P2P' | 'SATELLITE';
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

export interface GeoIpConfig {
  enabled: boolean;
  iran: boolean;
  china: boolean;
  russia: boolean;
}

export interface DdosProtectionConfig {
  level: 'off' | 'standard' | 'aggressive' | 'under_attack';
  sensitivity: number;
}

export interface NatConfig {
  mode: 'STUN' | 'TURN' | 'REVERSE_TUNNEL';
  stunServer: string;
  turnServer: string;
  turnUser: string;
  turnCredential: string;
  keepAliveIntervalSec: number;
  holePunchingEnabled: boolean;
}

export interface GeoStat {
  code: string;
  country: string;
  percent: number;
  count: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
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
  apiKey: string;
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

@Injectable({
  providedIn: 'root'
})
export class ElahehCoreService {
  // Theme State
  theme = signal<'light' | 'dark'>('dark');

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
  geoDistribution = signal<GeoStat[]>([
    { country: 'Iran', code: 'IR', percent: 78, count: 0 },
    { country: 'China', code: 'CN', percent: 12, count: 0 },
    { country: 'Russia', code: 'RU', percent: 5, count: 0 },
    { country: 'Germany', code: 'DE', percent: 3, count: 0 },
    { country: 'UAE', code: 'AE', percent: 2, count: 0 },
  ]);
  
  connectionQuality = computed(() => {
    const loss = this.packetLossRate();
    const jitter = this.jitterMs();
    if (loss < 0.5 && jitter < 15) return 'Excellent';
    if (loss < 2.0 && jitter < 40) return 'Good';
    if (loss < 5.0 && jitter < 80) return 'Fair';
    return 'Poor';
  });

  // Network Topography State
  upstreamNode = computed(() => this.edgeNodeAddress() || 'Scanning...');
  downstreamNode = signal<string>('LOC-EDGE (10.0.0.5)');
  
  // Endpoint Strategy State
  activeStrategy = signal<EndpointStrategy>({
    type: 'VPS',
    providerName: 'Auto-Detect (Rocky Linux)',
    features: ['TLS 1.3', 'TCP/BBR'],
    latencyMs: 45
  });

  // Tunnel Provider State (Restored All Providers)
  isTestingTunnels = signal<boolean>(false);
  tunnelProviders = signal<TunnelProvider[]>([
    { id: 'cloudflare', name: 'Cloudflare Tunnel (Argo)', type: 'CDN', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'aws', name: 'AWS Global Accelerator', type: 'CLOUD', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'gcp-iap', name: 'Google Cloud IAP', type: 'CLOUD', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'azure', name: 'Azure Front Door', type: 'CDN', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'hetzner', name: 'Hetzner Direct (TCP)', type: 'VPS', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'arvan', name: 'ArvanCloud (Relay)', type: 'CDN', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'blockchain', name: 'Ethereum Whisper Relay', type: 'BLOCKCHAIN', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'ipfs', name: 'IPFS Circuit Relay', type: 'P2P', status: 'untested', latencyMs: null, jitterMs: null },
    { id: 'starlink', name: 'Starlink Uplink', type: 'SATELLITE', status: 'untested', latencyMs: null, jitterMs: null },
  ]);

  // Terminal/Logs
  logs = signal<LogEntry[]>([]);
  
  // Users State
  users = signal<User[]>([ { id: '1', username: 'demo_user', quotaGb: 50, usedGb: 12.5, expiryDays: 30, status: 'active', links: [ { url: 'vmess://...', alias: 'demo_vmess', quotaGb: null, expiryDate: null, protocol: 'vmess' } ], concurrentConnectionsLimit: 2, currentConnections: 1, subscriptionLink: `https://ir-server.elaheh.com/sub/demo_user_sub_key`, udpEnabled: true } ]);
  userStats = computed(() => { const all = this.users(); return { total: all.length, active: all.filter(u => u.status === 'active').length, expired: all.filter(u => u.status === 'expired').length, banned: all.filter(u => u.status === 'banned').length }; });

  // Store State
  products = signal<Product[]>([
    { id: 'p1', title: 'Bronze', description: 'Economy Starter', price: 90000, currency: 'IRT', durationDays: 30, trafficGb: 30, userLimit: 1, features: ['30GB Traffic', '1 User', 'High Speed', 'Support'], highlight: false },
    { id: 'p2', title: 'Silver', description: 'Standard Plan', price: 160000, currency: 'IRT', durationDays: 30, trafficGb: 60, userLimit: 2, features: ['60GB Traffic', '2 Users', 'Low Ping', 'VIP Support'], highlight: true },
    { id: 'p3', title: 'Gold', description: 'Heavy User', price: 290000, currency: 'IRT', durationDays: 60, trafficGb: 120, userLimit: 4, features: ['120GB Traffic', '4 Users', 'Gaming Route', 'Dedicated IP'], highlight: false },
  ]);
  
  orders = signal<Order[]>([]);
  paymentGateways = signal<PaymentGateway[]>([
    { id: 'zarinpal', name: 'ZarinPal', logo: 'https://cdn.zarinpal.com/badges/trustLogo/1.svg', url: 'https://www.zarinpal.com', apiKey: '', isEnabled: true, type: 'FIAT' },
    { id: 'payping', name: 'PayPing', logo: 'https://payping.ir/assets/img/logo-dark.svg', url: 'https://payping.ir', apiKey: '', isEnabled: true, type: 'FIAT' },
    { id: 'cryptomus', name: 'Cryptomus', logo: 'https://cryptomus.com/img/logo.svg', url: 'https://cryptomus.com', apiKey: '', isEnabled: true, type: 'CRYPTO' },
  ]);

  // Camouflage State
  camouflageMode = signal<'AI_RESEARCH' | 'SHOP' | 'SEARCH_ENGINE'>('SHOP');
  camouflageContent = signal<string>('Welcome to Elaheh VPN Store.');
  camouflageProfile = signal<CamouflageProfile>('AI_TRAINING');
  camouflageJobStatus = signal<'IDLE' | 'RUNNING'>('IDLE');
  lastCamouflageUpdate = signal<Date | null>(null);
  camouflageFrequency = signal<number>(30);
  
  // App Camouflage
  applicationCamouflageEnabled = signal<boolean>(false);
  applicationCamouflageProfile = signal<GameProfile | null>(null);
  applicationCamouflageStatus = signal<string>('Idle');

  // Config State
  isConfigured = signal<boolean>(false);
  serverRole = signal<'iran' | 'external' | null>(null);
  selectedOS = signal<'rpm' | 'deb' | null>(null);
  aiModel = signal<string>('gemini-2.5-flash');
  optimalDnsResolver = signal<string | null>(null);
  
  // Domain & SSL State
  customDomain = signal<string>('ir-server.elaheh.com');
  subscriptionDomain = signal<string>('');
  sslCertPath = signal<string>('');
  sslKeyPath = signal<string>('');
  isSslActive = computed(() => this.customDomain() !== '' && this.sslCertPath() !== '' && this.sslKeyPath() !== '');
  
  // IAP
  iapConfig = signal<{projectId: string, zone: string, instanceName: string}>({ projectId: '', zone: 'europe-west3-c', instanceName: 'elaheh-upstream' });

  // NAT (Iran Server)
  natConfig = signal<NatConfig>({ mode: 'REVERSE_TUNNEL', stunServer: 'stun.l.google.com:19302', turnServer: '', turnUser: '', turnCredential: '', keepAliveIntervalSec: 25, holePunchingEnabled: true });
  natStatus = signal<'Idle' | 'Detecting' | 'Connected' | 'Relaying'>('Idle');
  detectedNatType = signal<string>('Unknown');
  detectedPublicIp = signal<string>('Unknown');
  private keepAliveTimer: any = null;

  // Subdomain Logic
  private regenerationTrigger = signal(0);
  generatedSubdomains = computed(() => {
    this.regenerationTrigger(); 
    const domain = this.customDomain();
    if (!domain) return ['www.' + (domain || 'example.com'), 'api.' + (domain || 'example.com')];
    return [ `www.${domain}`, `api.${domain}`, `cdn.${domain}`, `blog.${domain}`, `shop.${domain}`, `ws.${domain}`, `update.${domain}`, `secure.${domain}`];
  });
  
  forceSubdomainRegeneration() { this.regenerationTrigger.update(v => v + 1); this.addLog('INFO', 'Regenerating subdomain list...'); }

  // Edge Node
  edgeNodeAddress = signal<string>('');
  edgeNodeAuthKey = signal<string>('');
  edgeNodeStatus = signal<'not_configured' | 'connecting' | 'connected' | 'failed'>('not_configured');

  // Proxy
  isProxyEnabled = signal<boolean>(false);
  proxyHost = signal<string>('');
  proxyPort = signal<number | null>(null);
  proxyType = signal<'SOCKS5' | 'HTTP' | 'HTTPS'>('SOCKS5');

  // GeoIP
  geoIpConfig = signal<GeoIpConfig>({ enabled: false, iran: true, china: false, russia: false });

  // DDoS
  ddosConfig = signal<DdosProtectionConfig>({ level: 'standard', sensitivity: 50 });

  // DoH
  isDohEnabled = signal<boolean>(false);
  dohSubdomain = signal<string>('dns');
  dohStatus = signal<'inactive' | 'creating' | 'active' | 'failed'>('inactive');
  dohUrl = computed(() => (this.dohStatus() === 'active' && this.customDomain()) ? `https://${this.dohSubdomain()}.${this.customDomain()}/dns-query` : null);

  private ai: GoogleGenAI | null = null;
  private readonly AUTO_TEST_INTERVAL_SECONDS = 600; // 10 minutes
  private autoTestIntervalId: any = null;
  private countdownIntervalId: any = null;
  tunnelMode = signal<'auto' | 'manual'>('auto');
  isAutoTestEnabled = computed(() => this.tunnelMode() === 'auto');
  nextAutoTestSeconds = signal<number>(0);

  constructor() {
    this.initSimulatedMetrics();
    this.addLog('INFO', `Elaheh Core Service Initialized v${APP_VERSION}`);
    this.addLog('INFO', APP_SLOGAN);
    
    const apiKey = process.env.API_KEY;
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
      if (this.isConfigured() && this.serverRole() === 'external') {
        this.addLog('INFO', 'System configured. Initializing job-based camouflage simulation.');
        this.startCamouflageSimulation();
        // Start Auto Test if in auto mode
        if (this.tunnelMode() === 'auto') {
            this.startAutoTesting();
        }
      } else if (this.isConfigured() && this.serverRole() === 'iran') {
        this.addLog('INFO', 'Iran Role Configured. Initializing NAT & Keep-Alive.');
        this.startNatKeepAlive();
      }
    });
  }

  toggleTheme() {
    this.theme.update(current => (current === 'dark' ? 'light' : 'dark'));
  }

  login(user: string, pass: string): boolean {
    if (user === this.adminUsername() && pass === this.adminPassword()) {
      this.isAuthenticated.set(true);
      this.addLog('SUCCESS', 'Admin logged in successfully.');
      return true;
    }
    return false;
  }
  
  updateAdminCredentials(newUser: string, newPass: string) {
    this.adminUsername.set(newUser);
    this.adminPassword.set(newPass);
    this.addLog('SUCCESS', 'Admin credentials updated successfully.');
  }
  
  setEndpointStrategy(strategy: EndpointStrategy, manual = false) { 
    this.activeStrategy.set(strategy);
    const manualLog = manual ? ' [Manual Override]' : ' [Auto-Optimized]';
    this.addLog('SUCCESS', `Endpoint architecture switched to: ${strategy.providerName} (${strategy.type})${manualLog}`); 
  }

  updateDomainSettings(config: { domain: string; subDomain: string; certPath: string; keyPath: string }) {
    this.customDomain.set(config.domain);
    this.subscriptionDomain.set(config.subDomain);
    this.sslCertPath.set(config.certPath);
    this.sslKeyPath.set(config.keyPath);
    this.addLog('SUCCESS', `Domain set to ${config.domain}. SSL/TLS paths updated.`);
  }
  
  setTunnelMode(mode: 'auto' | 'manual') { 
      this.tunnelMode.set(mode);
      if (mode === 'auto') {
          this.startAutoTesting(); 
          this.runTunnelAnalysis(); 
          this.addLog('INFO', 'Automatic tunnel optimization has been ENABLED (10min interval).'); 
      } else {
          this.stopAutoTesting(); 
          this.addLog('WARN', 'Tunnel mode set to MANUAL. Automatic optimization is disabled.');
      }
  }

  private startAutoTesting() {
      this.stopAutoTesting();
      this.nextAutoTestSeconds.set(this.AUTO_TEST_INTERVAL_SECONDS);
      
      this.countdownIntervalId = setInterval(() => {
          this.nextAutoTestSeconds.update(s => s > 0 ? s - 1 : this.AUTO_TEST_INTERVAL_SECONDS);
      }, 1000);

      this.autoTestIntervalId = setInterval(() => {
          this.runTunnelAnalysis();
      }, this.AUTO_TEST_INTERVAL_SECONDS * 1000);
  }

  private stopAutoTesting() {
      if (this.autoTestIntervalId) clearInterval(this.autoTestIntervalId);
      if (this.countdownIntervalId) clearInterval(this.countdownIntervalId);
  }

  runTunnelAnalysis() {
      this.isTestingTunnels.set(true);
      this.addLog('INFO', 'Running background tunnel latency analysis...');
      
      // Simulate checking all providers
      setTimeout(() => {
          const updates = this.tunnelProviders().map(p => {
              const latency = Math.floor(Math.random() * 150) + 20;
              const jitter = Math.floor(Math.random() * 20);
              let status: 'optimal' | 'suboptimal' | 'failed' = 'suboptimal';
              
              if (latency < 50 && jitter < 10) status = 'optimal';
              if (latency > 200) status = 'failed';
              
              return { ...p, latencyMs: latency, jitterMs: jitter, status };
          });
          
          this.tunnelProviders.set(updates as any);
          
          if (this.tunnelMode() === 'auto') {
              const best = updates.reduce((prev, curr) => (curr.latencyMs! < prev.latencyMs! ? curr : prev));
              this.activateProvider(best);
          }
          
          this.isTestingTunnels.set(false);
      }, 2000);
  }

  activateProvider(provider: TunnelProvider) {
      const strategy: EndpointStrategy = {
          type: provider.type,
          providerName: provider.name,
          features: ['TLS 1.3', 'Auto-Routing'],
          latencyMs: provider.latencyMs || 50
      };
      this.setEndpointStrategy(strategy, this.tunnelMode() === 'manual');
  }

  // --- USER & LINK LOGIC ---

  // Enhanced Add User: Auto vs Manual
  addUser(username: string, quota: number, days: number, concurrentLimit: number, mode: 'auto' | 'manual' = 'auto', manualConfig: any = null): User {
    const userId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    const subId = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).substring(2);
    const domain = this.customDomain() || 'ir-server.elaheh.com';
    const subDomain = this.subscriptionDomain() || domain;
    
    let links: LinkConfig[] = [];

    if (mode === 'auto') {
        // Auto-generate all protocols using random subdomains
        const subdomains = this.generatedSubdomains();
        
        // 1. VLESS Reality (gRPC)
        links.push({
            url: this.generateLinkString(userId, { protocol: 'vless', transport: 'grpc', security: 'reality', port: 443, sni: 'www.google.com', fp: 'chrome', alpn: 'h2', type: 'grpc', udp: true }, `${username}_vless_reality_grpc`),
            alias: `${username}_vless_reality_grpc`,
            quotaGb: null, expiryDate: null, protocol: 'vless'
        });
        
        // 2. VLESS Reality (TCP/Vision)
        links.push({
            url: this.generateLinkString(userId, { protocol: 'vless', transport: 'tcp', security: 'reality', port: 443, sni: 'www.microsoft.com', fp: 'chrome', alpn: 'h2,http/1.1', type: 'tcp', udp: true }, `${username}_vless_reality_tcp`),
            alias: `${username}_vless_reality_tcp`,
            quotaGb: null, expiryDate: null, protocol: 'vless'
        });

        // 3. VMess WS (CDN)
        links.push({
            url: this.generateLinkString(userId, { protocol: 'vmess', transport: 'ws', security: 'tls', port: 443, sni: subdomains[0] || domain, fp: 'chrome', alpn: 'http/1.1', type: 'ws', path: '/ws', udp: true }, `${username}_vmess_ws_cdn`),
            alias: `${username}_vmess_ws_cdn`,
            quotaGb: null, expiryDate: null, protocol: 'vmess'
        });
        
        // 4. ShadowTLS
        links.push({
            url: this.generateLinkString(userId, { protocol: 'shadowtls', transport: 'tcp', security: 'tls', port: 443, sni: 'www.bing.com', fp: 'chrome', udp: true }, `${username}_shadowtls`),
            alias: `${username}_shadowtls`,
            quotaGb: null, expiryDate: null, protocol: 'shadowtls'
        });

    } else if (manualConfig) {
        // Manual Config
        const alias = `${username}_${manualConfig.protocol}_${manualConfig.transport || 'tcp'}`;
        const url = this.generateLinkString(userId, { ...manualConfig, udp: true }, alias);
        links.push({ url, alias, quotaGb: null, expiryDate: null, protocol: manualConfig.protocol });
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
        subscriptionLink: `https://${subDomain}/sub/${subId}`,
        udpEnabled: true
    };
    
    this.users.update(u => [...u, newUser]);
    this.addLog('SUCCESS', `User ${username} created (${mode} mode) with ${links.length} configs.`);
    return newUser;
  }

  generateLinkString(userId: string, config: any, alias: string): string {
    const { protocol, transport, security, port, sni, fingerprint = 'chrome', alpn, allowInsecure = false, path, udp } = config;
    const host = this.edgeNodeAddress() || this.customDomain() || 'ir-server.elaheh.com';
    
    if (protocol === 'vless') {
      const params = new URLSearchParams();
      params.set('security', security!);
      params.set('encryption', 'none');
      params.set('type', transport!);
      params.set('fp', fingerprint!);
      if(alpn) params.set('alpn', alpn);
      if (allowInsecure) params.set('allowInsecure', 'true');
      if (sni) params.set('sni', sni);
      if (transport === 'grpc') {
        params.set('serviceName', 'grpc');
        params.set('mode', 'gun');
      } else if (transport === 'ws') {
         params.set('path', path || '/');
      }
      return `vless://${userId}@${host}:${port}?${params.toString()}#${encodeURIComponent(alias)}`;
    } else if (protocol === 'vmess') {
      const vmessConfig = { v: "2", ps: alias, add: host, port: port, id: userId, aid: "0", scy: "auto", net: transport, type: "none", host: sni, path: path || '/', tls: security === 'tls' || security === 'reality' ? 'tls' : '', sni: sni };
      const jsonStr = JSON.stringify(vmessConfig);
      return `vmess://${btoa(jsonStr)}`;
    } else if (protocol === 'shadowtls') {
        // Mock ShadowTLS link format
        return `ss://${userId}@${host}:${port}#${encodeURIComponent(alias)}`;
    }
    return '';
  }

  removeUser(id: string) { this.users.update(u => u.filter(x => x.id !== id)); this.addLog('WARN', `User ID ${id} removed.`); }
  addLinkToUser(userId: string, link: LinkConfig) { this.users.update(users => users.map(u => { if (u.id === userId) { return { ...u, links: [...u.links, link] }; } return u; })); this.addLog('SUCCESS', `Added new link to user ID: ${userId.substring(0, 8)}...`); }
  removeLinkFromUser(userId: string, linkIndex: number) { this.users.update(users => users.map(u => { if (u.id === userId) { const newLinks = [...u.links]; newLinks.splice(linkIndex, 1); return { ...u, links: newLinks }; } return u; })); this.addLog('INFO', `Removed link from user ID: ${userId.substring(0, 8)}...`); }
  updateUserLinks(userId: string, links: LinkConfig[]) { this.users.update(users => users.map(u => { if (u.id === userId) { return { ...u, links: [...links] }; } return u; })); this.addLog('SUCCESS', `Batch updated links for user ID: ${userId.substring(0, 8)}...`); }
  addLog(level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', message: string) { const entry: LogEntry = { timestamp: new Date().toLocaleTimeString(), level, message }; this.logs.update(l => [entry, ...l].slice(0, 50)); }
  
  // Helpers
  generateEdgeNodeKey(): string {
    const array = new Uint8Array(32); crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  updateEdgeNodeConfig(address: string, key: string) {
    this.edgeNodeAddress.set(address);
    this.edgeNodeAuthKey.set(key);
    this.addLog('SUCCESS', `Edge Node updated: ${address}`);
    this.testEdgeNodeConnection();
  }
  
  updateProxyConfig(config: any) {
    this.isProxyEnabled.set(config.isEnabled);
    this.proxyHost.set(config.host);
    this.proxyPort.set(config.port);
    this.proxyType.set(config.type);
    this.addLog('INFO', `Proxy config updated.`);
  }
  
  updateNatConfig(config: NatConfig) {
    this.natConfig.set(config);
    this.addLog('INFO', `NAT: ${config.mode}`);
    this.startNatKeepAlive();
  }
  
  updateIapConfig(config: any) {
    this.iapConfig.set(config);
    this.addLog('SUCCESS', 'IAP updated.');
  }
  
  updateApplicationCamouflage(enabled: boolean, profile: GameProfile | null) {
    this.applicationCamouflageEnabled.set(enabled);
    if(profile) this.applicationCamouflageProfile.set(profile);
    this.addLog('INFO', `App Camouflage: ${enabled ? profile : 'Disabled'}`);
  }
  
  activateDohResolver(sub: string) {
    this.dohSubdomain.set(sub);
    this.dohStatus.set('creating');
    setTimeout(() => {
      this.dohStatus.set('active');
      this.isDohEnabled.set(true);
      this.addLog('SUCCESS', 'DoH Active');
    }, 2000);
  }
  
  deactivateDohResolver() {
    this.isDohEnabled.set(false);
    this.dohStatus.set('inactive');
    this.addLog('INFO', 'DoH Deactivated');
  }
  
  runNatTypeDetection() {
    this.natStatus.set('Detecting');
    setTimeout(() => {
      this.detectedNatType.set('Full Cone NAT');
      this.detectedPublicIp.set('89.1.2.3');
      this.natStatus.set('Connected');
    }, 1500);
  }
  
  // Placeholders
  createOrder(pid: string, email: string, tg: string, gw: string): Order { return { id: 'ORD-123', productId: pid, amount: 0, currency: 'IRT', customerEmail: email, customerTelegram: tg, gatewayId: gw, status: 'PENDING', createdAt: new Date() }; }
  completeOrder(oid: string, tx: string): Order { return { ...this.orders().find(o => o.id === oid)!, status: 'PAID', transactionId: tx, generatedUserId: 'u1', generatedSubLink: 'https://sub/123' }; }
  addProduct(p: Product) { this.products.update(pr => [...pr, p]); }
  removeProduct(id: string) { this.products.update(pr => pr.filter(p => p.id !== id)); }
  testEdgeNodeConnection() { this.edgeNodeStatus.set('connecting'); setTimeout(() => this.edgeNodeStatus.set('connected'), 1000); }
  initSimulatedMetrics() { /* ... */ }
  startCamouflageSimulation() { /* ... */ }
  startNatKeepAlive() { if(this.keepAliveTimer) clearInterval(this.keepAliveTimer); this.keepAliveTimer = setInterval(() => {}, this.natConfig().keepAliveIntervalSec * 1000); }
  async generateRandomSni() { return 'random.google.com'; }
}