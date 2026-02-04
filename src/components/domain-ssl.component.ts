
import { Component, inject, signal, ChangeDetectionStrategy, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';

type SubdomainStatus = 'untested' | 'testing' | 'healthy' | 'filtered';
interface SubdomainState {
  domain: string;
  status: SubdomainStatus;
}

@Component({
  selector: 'app-domain-ssl',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './domain-ssl.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DomainSslComponent implements OnInit {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);
  fb: FormBuilder = inject(FormBuilder);

  domainForm = this.fb.group({
    domain: ['', [Validators.required, Validators.pattern(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/)]],
    subscriptionDomain: ['', [Validators.pattern(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/)]],
    certPath: [''],
    keyPath: ['']
  });
  
  successMessage = signal('');
  isRequestingCert = signal(false);

  subdomainStatuses = signal<SubdomainState[]>([]);
  isCheckingHealth = signal(false);
  hasChecked = signal(false);

  constructor() {
    effect(() => {
      const newSubdomains = this.core.generatedSubdomains();
      this.subdomainStatuses.set(
        newSubdomains.map(d => ({ domain: d, status: 'untested' }))
      );
      this.hasChecked.set(false);
    });

    // Auto-update form when core state changes (e.g. from server-config load)
    effect(() => {
        const domain = this.core.customDomain();
        const cert = this.core.sslCertPath();
        const key = this.core.sslKeyPath();
        
        // Use emitEvent: false to prevent circular updates if needed, though signals are efficient
        this.domainForm.patchValue({
            domain: domain,
            certPath: cert,
            keyPath: key
        }, { emitEvent: false });
    });
  }

  ngOnInit(): void {
    // Initial sync
    this.domainForm.setValue({
      domain: this.core.customDomain(),
      subscriptionDomain: this.core.subscriptionDomain(),
      certPath: this.core.sslCertPath(),
      keyPath: this.core.sslKeyPath()
    });

    this.domainForm.get('domain')!.valueChanges.subscribe(value => {
        if (this.domainForm.get('domain')!.valid) {
            this.core.customDomain.set(value || '');
        } else {
            this.core.customDomain.set('');
        }
    });
  }

  saveDomainSettings() {
    if (this.domainForm.invalid) return;
    const { domain, subscriptionDomain, certPath, keyPath } = this.domainForm.value;
    this.core.updateDomainSettings({
        domain: domain!, 
        subDomain: subscriptionDomain || '', 
        certPath: certPath!, 
        keyPath: keyPath!
    });
    this.successMessage.set(this.languageService.translate('settings.domain.saveSuccess'));
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  getCertificate() {
    const domainControl = this.domainForm.get('domain');
    if (domainControl?.invalid) {
      this.successMessage.set(this.languageService.translate('settings.domain.getCertError'));
      setTimeout(() => this.successMessage.set(''), 3000);
      return;
    }
    this.isRequestingCert.set(true);
    this.successMessage.set('');

    setTimeout(() => {
      const domainName = domainControl!.value!;
      const certPathValue = `/etc/letsencrypt/live/${domainName}/fullchain.pem`;
      const keyPathValue = `/etc/letsencrypt/live/${domainName}/privkey.pem`;
      
      this.domainForm.patchValue({ certPath: certPathValue, keyPath: keyPathValue });
      this.saveDomainSettings();
      
      this.isRequestingCert.set(false);
      this.successMessage.set(this.languageService.translate('settings.domain.getCertSuccess'));
      setTimeout(() => this.successMessage.set(''), 4000);
    }, 2500);
  }

  checkHealth() {
    this.isCheckingHealth.set(true);
    this.hasChecked.set(true);
    this.subdomainStatuses.update(statuses => statuses.map(s => ({ ...s, status: 'testing' })));

    const checkPromises = this.subdomainStatuses().map((sub, index) => {
        return new Promise<void>(resolve => {
            const delay = Math.random() * 1000 + 500;
            setTimeout(() => {
                const isFiltered = Math.random() < 0.2; // 20% chance of being filtered
                this.subdomainStatuses.update(statuses => {
                    const newStatuses = [...statuses];
                    newStatuses[index].status = isFiltered ? 'filtered' : 'healthy';
                    return newStatuses;
                });
                resolve();
            }, delay);
        });
    });

    Promise.all(checkPromises).then(() => {
        this.isCheckingHealth.set(false);
    });
  }

  pruneAndRegenerate() {
    // This will trigger the effect in the constructor to rebuild the list
    this.core.forceSubdomainRegeneration();
  }
}
