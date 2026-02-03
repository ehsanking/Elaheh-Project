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

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CamouflageSettingsComponent, FormsModule, CommonModule, EndpointSettingsComponent, TunnelOptimizationComponent, DomainSslComponent, ApplicationCamouflageComponent, DohSettingsComponent, IapSettingsComponent, NatTraversalComponent, SshSettingsComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit, OnDestroy {
  core = inject(ElahehCoreService);
  cryptoLayer = inject(CryptoLayerService);
  fb: FormBuilder = inject(FormBuilder);
  languageService = inject(LanguageService);
  
  private destroy$ = new Subject<void>();

  currentTab = signal<'general' | 'network' | 'security' | 'advanced' | 'store' | 'ssh'>('general');
  successMessage = signal('');
  modelSuccessMessage = signal('');
  
  availableModels = ['gemini-2.5-flash', 'gemini-2.5-pro'];
  selectedModel = signal<string>(this.core.aiModel());

  proxySuccessMessage = signal('');

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
}