import { Component, inject, signal, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { CryptoLayerService } from '../services/crypto-layer.service';
import { CamouflageSettingsComponent } from './camouflage-settings.component';
import { LanguageService } from '../services/language.service';
import { CommonModule } from '@angular/common';
import { EndpointSettingsComponent } from './endpoint-settings.component';
import { TunnelOptimizationComponent } from './tunnel-optimization.component';
import { DomainSslComponent } from './domain-ssl.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApplicationCamouflageComponent } from './application-camouflage.component';
import { DohSettingsComponent } from './doh-settings.component';
import { IapSettingsComponent } from './iap-settings.component';
import { NatTraversalComponent } from './nat-traversal.component';
import { SshSettingsComponent } from './ssh-settings.component';
import { RemoteInstallerComponent } from './remote-installer.component';
import { EmailService } from '../services/email.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CamouflageSettingsComponent, FormsModule, CommonModule, EndpointSettingsComponent, TunnelOptimizationComponent, DomainSslComponent, ApplicationCamouflageComponent, DohSettingsComponent, IapSettingsComponent, NatTraversalComponent, SshSettingsComponent, RemoteInstallerComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit, OnDestroy {
  core = inject(ElahehCoreService);
  cryptoLayer = inject(CryptoLayerService);
  emailService = inject(EmailService);
  fb: FormBuilder = inject(FormBuilder);
  languageService = inject(LanguageService);
  
  private destroy$ = new Subject<void>();

  currentTab = signal<'general' | 'network' | 'security' | 'advanced' | 'store' | 'ssh' | 'system'>('general');
  successMessage = signal('');
  modelSuccessMessage = signal('');
  importError = signal('');
  
  availableModels = ['gemini-2.5-flash', 'gemini-2.5-pro'];
  selectedModel = signal<string>(this.core.aiModel());

  proxySuccessMessage = signal('');
  emailTestStatus = signal<'idle' | 'sending' | 'success' | 'failed'>('idle');

  adminForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  edgeNodeForm = this.fb.group({
    address: ['', Validators.required],
    key: ['', [Validators.required, Validators.pattern(/^[a-fA-F0-9]{64}$/)]]
  });

  proxyForm = this.fb.group({
    isEnabled: [false],
    host: [''],
    port: [null as number | null],
    type: ['SOCKS5']
  });

  smtpForm = this.fb.group({
      host: ['smtp.gmail.com', Validators.required],
      port: [587, [Validators.required, Validators.min(1)]],
      user: ['', Validators.required],
      pass: ['', Validators.required],
      secure: [false],
      senderName: ['Elaheh Admin'],
      senderEmail: ['', [Validators.required, Validators.email]]
  });
  
  ngOnInit(): void {
    this.adminForm.setValue({
      username: this.core.adminUsername(),
      password: this.core.adminPassword()
    });
    this.edgeNodeForm.setValue({
      address: this.core.edgeNodeAddress(),
      key: this.core.edgeNodeAuthKey()
    });
    this.proxyForm.setValue({
      isEnabled: this.core.isProxyEnabled(),
      host: this.core.proxyHost(),
      port: this.core.proxyPort(),
      type: this.core.proxyType()
    });
    
    // SMTP Load
    const smtp = this.core.smtpConfig();
    this.smtpForm.patchValue(smtp);

    this.proxyForm.get('isEnabled')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(enabled => {
      const hostControl = this.proxyForm.get('host');
      const portControl = this.proxyForm.get('port');
      if (enabled) {
        hostControl?.setValidators([Validators.required]);
        portControl?.setValidators([Validators.required, Validators.min(1), Validators.max(65535)]);
      } else {
        hostControl?.clearValidators();
        portControl?.clearValidators();
      }
      hostControl?.updateValueAndValidity();
      portControl?.updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTab(tab: any) {
    this.currentTab.set(tab);
  }

  saveCredentials() {
    if (this.adminForm.valid) {
      const { username, password } = this.adminForm.value;
      this.core.updateAdminCredentials(username!, password!);
      this.successMessage.set(this.languageService.translate('settings.credentials.success'));
      setTimeout(() => this.successMessage.set(''), 3000);
    }
  }
  
  saveModelSelection() {
    this.core.aiModel.set(this.selectedModel());
    this.core.addLog('SUCCESS', `AI model switched to: ${this.selectedModel()}`);
    this.modelSuccessMessage.set(this.languageService.translate('settings.aiModel.saveSuccess'));
    setTimeout(() => this.modelSuccessMessage.set(''), 3000);
  }

  saveAndTestEdgeNode() {
    if (this.edgeNodeForm.valid) {
      const { address, key } = this.edgeNodeForm.value;
      this.core.updateEdgeNodeConfig(address!, key!);
    }
  }

  saveProxySettings() {
    if (this.proxyForm.invalid) return;
    const config = this.proxyForm.value;
    this.core.updateProxyConfig({
      isEnabled: config.isEnabled!,
      host: config.host || '',
      port: config.port,
      type: config.type as any
    });
    this.proxySuccessMessage.set(this.languageService.translate('settings.proxy.saveSuccess'));
    setTimeout(() => this.proxySuccessMessage.set(''), 3000);
  }

  // --- Database Actions ---
  exportSettings() {
      const json = this.core.exportSettings();
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elaheh_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
  }

  triggerImport() {
      document.getElementById('fileInput')?.click();
  }

  onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              const content = e.target?.result as string;
              if (this.core.importSettings(content)) {
                  alert('Settings Imported Successfully. Reloading...');
                  window.location.reload();
              } else {
                  this.importError.set('Invalid backup file.');
                  setTimeout(() => this.importError.set(''), 3000);
              }
          };
          reader.readAsText(file);
      }
  }

  // --- Email Actions ---
  saveSmtp() {
      if (this.smtpForm.valid) {
          this.core.updateSmtpConfig(this.smtpForm.value as any);
      }
  }

  testEmail() {
      if (this.smtpForm.valid) {
          this.emailTestStatus.set('sending');
          this.emailService.sendTestEmail(this.smtpForm.value as any, 'admin@localhost').then(() => {
              this.emailTestStatus.set('success');
              setTimeout(() => this.emailTestStatus.set('idle'), 3000);
          });
      }
  }
}