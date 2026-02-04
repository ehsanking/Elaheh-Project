
import { Component, inject, signal, computed, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ElahehCoreService, User, LinkConfig } from '../services/elaheh-core.service';
import * as QRCode from 'qrcode';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-management.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent implements OnInit, OnDestroy {
  core = inject(ElahehCoreService);
  fb: FormBuilder = inject(FormBuilder);
  languageService = inject(LanguageService);
  
  showAddModal = signal(false);
  showLinkModal = signal(false);
  showAdvancedOptions = signal(false);
  selectedUser = signal<User | null>(null);
  toastMessage = signal<string | null>(null);
  copiedIndex = signal<number | null>(null);

  // QR Code State
  qrCodeDataUrl = signal<string | null>(null);
  qrCodeLinkAlias = signal<string | null>(null);

  // Filter State
  statusFilter = signal<'all' | 'active' | 'expired' | 'banned'>('all');
  
  // Creation Mode
  creationMode = signal<'auto' | 'manual'>('auto');

  userForm = this.fb.group({
    username: ['', Validators.required],
    quota: [50, [Validators.required, Validators.min(1)]],
    days: [30, [Validators.required, Validators.min(1)]],
    concurrentLimit: [2, [Validators.required, Validators.min(0)]]
  });

  // Manual Protocol Config (if mode is manual)
  manualProtoForm = this.fb.group({
      protocol: ['vless'],
      transport: ['ws'],
      security: ['reality'],
      port: [443],
      sni: ['google.com']
  });

  private destroy$ = new Subject<void>();

  filteredUsers = computed(() => {
    const filter = this.statusFilter();
    const users = this.core.users();
    if (filter === 'all') return users;
    return users.filter(u => u.status === filter);
  });

  ngOnInit(): void { }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  setFilter(filter: 'all' | 'active' | 'expired' | 'banned') {
    this.statusFilter.set(filter);
  }

  toggleAddModal() {
    this.showAddModal.update(v => !v);
    this.userForm.reset({ quota: 50, days: 30, concurrentLimit: 2 });
    this.creationMode.set('auto');
  }

  generateRandomUsername() {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    this.userForm.patchValue({ username: `user_${randomSuffix}` });
  }

  setCreationMode(mode: 'auto' | 'manual') {
      this.creationMode.set(mode);
  }

  onSubmit() {
    if (this.userForm.valid) {
      const { username, quota, days, concurrentLimit } = this.userForm.getRawValue();
      const mode = this.creationMode();
      
      let manualConfig = null;
      if (mode === 'manual') {
          manualConfig = this.manualProtoForm.value;
      }

      this.core.addUser(username!, Number(quota!), Number(days!), Number(concurrentLimit!), mode, manualConfig);
      this.toggleAddModal();
    }
  }

  // --- Link Management ---
  
  openLinkManager(user: User) {
    this.selectedUser.set(user);
    this.showLinkModal.set(true);
  }

  closeLinkManager() {
    this.showLinkModal.set(false);
    this.selectedUser.set(null);
  }

  copyLinkStr(link: string, index: number) {
    navigator.clipboard.writeText(link).then(() => {
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.set(null), 2000);
    });
  }

  async showQrCode(link: LinkConfig) {
    try {
      const dataUrl = await QRCode.toDataURL(link.url, { width: 256, margin: 2, color: { dark: '#FFFFFF', light: '#00000000' } });
      this.qrCodeDataUrl.set(dataUrl);
      this.qrCodeLinkAlias.set(link.alias);
    } catch (err) { console.error(err); }
  }

  closeQrCode() { this.qrCodeDataUrl.set(null); }

  deleteLink(index: number) {
      if(this.selectedUser()) {
          this.core.removeLinkFromUser(this.selectedUser()!.id, index);
      }
  }

  getProtocolFromUrl(url: string) { return 'vless'; } // simplified for display

  // --- App Recommendation Logic ---
  getRecommendedApps(protocol: string) {
      const p = protocol.toLowerCase();
      
      // VLESS, VMess, Trojan, Shadowsocks
      if (p.startsWith('vless') || p.startsWith('vmess') || p.startsWith('trojan') || p.startsWith('shadow')) {
          return [
              { name: 'Hiddify (Universal)', icon: '🚀', url: 'https://github.com/hiddify/hiddify-next/releases' },
              { name: 'v2rayNG (Android)', icon: '🤖', url: 'https://play.google.com/store/apps/details?id=com.v2ray.ang' },
              { name: 'V2Box (iOS)', icon: '🍎', url: 'https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690' },
              { name: 'v2rayN (Windows)', icon: '🪟', url: 'https://github.com/2dust/v2rayN/releases' }
          ];
      }
      
      // TrustTunnel (AdGuard)
      if (p.startsWith('trust')) {
          return [
              { name: 'AdGuard VPN', icon: '🛡️', url: 'https://adguard-vpn.com/en/welcome.html' },
              { name: 'Trust Client (Custom)', icon: '🔒', url: '#' } // Placeholder for custom client
          ];
      }

      // OpenVPN
      if (p.includes('openvpn') || p.includes('ovpn')) {
          return [
              { name: 'OpenVPN Connect', icon: '🌐', url: 'https://openvpn.net/client-connect-vpn-for-windows/' }
          ];
      }

      return [];
  }
}
