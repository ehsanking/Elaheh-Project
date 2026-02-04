
import { Component, inject, signal, computed, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ElahehCoreService, User, LinkConfig } from '../services/elaheh-core.service';
import * as QRCode from 'qrcode';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
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
  selectedUser = signal<User | null>(null);
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
      if (mode === 'manual') manualConfig = this.manualProtoForm.value;

      this.core.addUser(username!, Number(quota!), Number(days!), Number(concurrentLimit!), mode, manualConfig);
      this.toggleAddModal();
    }
  }

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
      const dataUrl = await QRCode.toDataURL(link.url, { width: 256, margin: 2 });
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
  
  updateConcurrency(userId: string, event: any) {
      const val = parseInt(event.target.value, 10);
      if (!isNaN(val) && val >= 0) {
          this.core.updateUserConcurrencyLimit(userId, val);
      }
  }

  // --- Export/Import Logic ---
  exportUsers() {
      const json = this.core.exportUsersJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elaheh_users_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
  }

  triggerImport() {
      document.getElementById('importFile')?.click();
  }

  onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              const content = e.target?.result as string;
              this.core.importUsersJSON(content);
          };
          reader.readAsText(file);
      }
  }

  // --- App Recommendations (Specific URLs) ---
  getRecommendedApps(protocol: string) {
      const p = protocol.toLowerCase();
      
      if (p.includes('trust')) {
          return [
              { name: 'TrustTunnel iOS', icon: '🍏', url: 'https://apps.apple.com/us/app/trusttunnel/id6755807890' },
              { name: 'TrustTunnel Android', icon: '🤖', url: 'https://play.google.com/store/apps/details?id=com.adguard.trusttunnel' }
          ];
      }
      
      if (p.includes('openvpn')) {
          return [
              { name: 'OpenVPN Connect (Mac)', icon: '💻', url: 'https://openvpn.net/downloads/openvpn-connect-v3-macos.dmg' },
              { name: 'OpenVPN Connect (iOS)', icon: '🍏', url: 'https://itunes.apple.com/us/app/openvpn-connect/id590379981?mt=8' },
              { name: 'OpenVPN Android', icon: '🤖', url: 'https://play.google.com/store/apps/details?id=net.openvpn.openvpn' },
              { name: 'OpenVPN Windows', icon: '🪟', url: 'https://openvpn.net/downloads/openvpn-connect-v3-windows.msi' }
          ];
      }

      if (p.includes('wireguard')) {
          return [
              { name: 'WireGuard Windows', icon: '🪟', url: 'https://download.wireguard.com/windows-client/wireguard-installer.exe' },
              { name: 'WireGuard iOS', icon: '🍏', url: 'https://itunes.apple.com/us/app/wireguard/id1451685025?ls=1&mt=12' },
              { name: 'WireGuard Android', icon: '🤖', url: 'https://play.google.com/store/apps/details?id=com.wireguard.android' },
              { name: 'WireGuard macOS', icon: '💻', url: 'https://itunes.apple.com/us/app/wireguard/id1441195209?ls=1&mt=8' }
          ];
      }

      if (p.includes('vless') || p.includes('vmess') || p.includes('trojan')) {
          return [
              { name: 'v2rayNG (Android)', icon: '🤖', url: 'https://github.com/2dust/v2rayNG/releases' },
              { name: 'Hiddify', icon: '🚀', url: 'https://play.google.com/store/apps/details?id=app.hiddify.com' },
              { name: 'V2Box (iOS)', icon: '🍏', url: 'https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690' },
              { name: 'v2rayN (Windows)', icon: '🪟', url: 'https://github.com/2dust/v2rayN/releases' },
              { name: 'NapsternetV', icon: '🌐', url: 'https://play.google.com/store/apps/details?id=com.napsternetlabs.napsternetv' }
          ];
      }

      return [];
  }
}
