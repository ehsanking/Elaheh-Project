
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
import { ApplicationCamouflageComponent } from './application-camouflage.component';
import { DohSettingsComponent } from './doh-settings.component';
import { IapSettingsComponent } from './iap-settings.component';
import { NatTraversalComponent } from './nat-traversal.component';
import { SshSettingsComponent } from './ssh-settings.component';
import { EmailService } from '../services/email.service';

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
  emailService = inject(EmailService);
  fb: FormBuilder = inject(FormBuilder);
  languageService = inject(LanguageService);
  
  private destroy$ = new Subject<void>();

  currentTab = signal<'general' | 'store' | 'branding' | 'network' | 'security'>('general');
  successMessage = signal('');
  
  // Store Mgmt Signals
  selectedProductIdx = signal<number | null>(null);
  
  // Upstream Connection
  upstreamTokenInput = signal('');
  isConnectingUpstream = signal(false);

  // Forms
  adminForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  brandingForm = this.fb.group({
      brandName: [''],
      currency: ['تومان']
  });

  productForm = this.fb.group({
      title: [''],
      price: [0],
      durationDays: [30],
      trafficGb: [0]
  });

  edgeServerForm = this.fb.group({
      name: ['', Validators.required],
      host: ['', Validators.required]
  });

  ngOnInit(): void {
    this.adminForm.setValue({
      username: this.core.adminUsername(),
      password: this.core.adminPassword()
    });
    this.brandingForm.setValue({
        brandName: this.core.brandName(),
        currency: this.core.currency()
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
      this.showSuccess(this.languageService.translate('settings.credentials.success'));
    }
  }

  // Branding Logic
  saveBranding() {
      const { brandName, currency } = this.brandingForm.value;
      this.core.updateBranding(brandName!, this.core.brandLogo(), currency!);
      this.showSuccess(this.languageService.translate('settings.branding.saveSuccess'));
  }

  onLogoSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              const base64 = e.target?.result as string;
              this.core.brandLogo.set(base64);
          };
          reader.readAsDataURL(file);
      }
  }

  // Store Logic
  editProduct(idx: number) {
      this.selectedProductIdx.set(idx);
      const p = this.core.products()[idx];
      this.productForm.patchValue({
          title: p.title, price: p.price, durationDays: p.durationDays, trafficGb: p.trafficGb
      });
  }

  saveProduct() {
      if (this.selectedProductIdx() !== null) {
          const p = this.core.products()[this.selectedProductIdx()!];
          const val = this.productForm.value;
          const updated = { ...p, title: val.title!, price: val.price!, durationDays: val.durationDays!, trafficGb: val.trafficGb! };
          this.core.updateProduct(this.selectedProductIdx()!, updated);
          this.selectedProductIdx.set(null);
      }
  }

  toggleGateway(id: string, event: any) {
      const gw = this.core.paymentGateways().find(g => g.id === id);
      if(gw) {
          this.core.updateGateway(id, gw.merchantId, event.target.checked);
      }
  }

  updateMerchant(id: string, event: any) {
      const gw = this.core.paymentGateways().find(g => g.id === id);
      if(gw) {
          this.core.updateGateway(id, event.target.value, gw.isEnabled);
      }
  }

  // Edge Server Logic
  createEdgeServer() {
      if(this.edgeServerForm.valid) {
          const { name, host } = this.edgeServerForm.value;
          this.core.addEdgeServer({
              id: Math.random().toString(36).substring(2),
              name: name!,
              host: host!
          });
          this.edgeServerForm.reset();
      }
  }

  removeEdgeServer(id: string) {
      this.core.removeEdgeServer(id);
  }

  // Upstream Logic
  connectUpstream() {
      if(!this.upstreamTokenInput()) return;
      this.isConnectingUpstream.set(true);
      
      // Simulate validation delay
      setTimeout(() => {
          this.core.connectToUpstream(this.upstreamTokenInput());
          this.isConnectingUpstream.set(false);
          this.upstreamTokenInput.set('');
          this.showSuccess('Upstream Connection Established');
      }, 1500);
  }

  showSuccess(msg: string) {
      this.successMessage.set(msg);
      setTimeout(() => this.successMessage.set(''), 3000);
  }
}