
import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ElahehCoreService, EdgeNodeInfo } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-setup-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-5xl mx-auto font-sans" [dir]="languageService.currentLang() === 'fa' ? 'rtl' : 'ltr'">
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 min-h-[600px] flex flex-col shadow-2xl relative">
        
        <!-- Header -->
        <div class="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 text-teal-500 bg-teal-900/30 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                    </svg>
                </div>
                <h2 class="text-3xl font-bold text-white tracking-tight">{{ languageService.translate('wizard.title') }}</h2>
            </div>
            <!-- Progress Indicator -->
            <div class="flex gap-2">
                <div class="h-2 w-8 rounded-full transition-all" [class.bg-teal-500]="currentStep() >= 1" [class.bg-gray-700]="currentStep() < 1"></div>
                <div class="h-2 w-8 rounded-full transition-all" [class.bg-teal-500]="currentStep() >= 2" [class.bg-gray-700]="currentStep() < 2"></div>
                <div class="h-2 w-8 rounded-full transition-all" [class.bg-teal-500]="currentStep() >= 3" [class.bg-gray-700]="currentStep() < 3"></div>
                <div class="h-2 w-8 rounded-full transition-all" [class.bg-teal-500]="currentStep() >= 4" [class.bg-gray-700]="currentStep() < 4"></div>
            </div>
        </div>
        
        <!-- Step 1: Language Selection -->
        @if (currentStep() === 1) {
            <div class="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 class="text-xl font-bold text-white mb-2 text-center">Select Language / انتخاب زبان</h3>
                <p class="text-gray-400 mb-8 text-center">Please choose your preferred language to continue.</p>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
                    <button type="button" (click)="selectLanguage('en')" class="p-6 bg-gray-700 hover:bg-teal-900 border border-gray-600 hover:border-teal-500 rounded-xl transition-all flex flex-col items-center gap-2 group">
                        <span class="text-4xl">🇬🇧</span>
                        <span class="font-bold text-white group-hover:text-teal-400">English</span>
                    </button>
                    <button type="button" (click)="selectLanguage('fa')" class="p-6 bg-gray-700 hover:bg-teal-900 border border-gray-600 hover:border-teal-500 rounded-xl transition-all flex flex-col items-center gap-2 group">
                        <span class="text-4xl">🇮🇷</span>
                        <span class="font-bold text-white group-hover:text-teal-400">فارسی</span>
                    </button>
                    <button type="button" (click)="selectLanguage('zh')" class="p-6 bg-gray-700 hover:bg-teal-900 border border-gray-600 hover:border-teal-500 rounded-xl transition-all flex flex-col items-center gap-2 group">
                        <span class="text-4xl">🇨🇳</span>
                        <span class="font-bold text-white group-hover:text-teal-400">中文</span>
                    </button>
                    <button type="button" (click)="selectLanguage('ru')" class="p-6 bg-gray-700 hover:bg-teal-900 border border-gray-600 hover:border-teal-500 rounded-xl transition-all flex flex-col items-center gap-2 group">
                        <span class="text-4xl">🇷🇺</span>
                        <span class="font-bold text-white group-hover:text-teal-400">Русский</span>
                    </button>
                </div>
            </div>
        }

        <!-- Step 2: Branding -->
        @if (currentStep() === 2) {
            <div class="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 class="text-xl font-bold text-white mb-2">{{ languageService.translate('wizard.branding.title') }}</h3>
                <p class="text-gray-400 mb-8">{{ languageService.translate('wizard.branding.description') }}</p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <!-- Left side: inputs -->
                    <div class="space-y-6">
                        <div>
                            <label class="block text-gray-300 text-sm font-bold mb-2">{{ languageService.translate('wizard.branding.siteTitle') }}</label>
                            <input type="text" [(ngModel)]="siteTitle" class="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-teal-500 outline-none" placeholder="My VPN Service">
                        </div>
                        <div>
                            <label class="block text-gray-300 text-sm font-bold mb-2">{{ languageService.translate('wizard.branding.logoUrl') }}</label>
                            <input type="text" [(ngModel)]="logoUrl" class="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-teal-500 outline-none" placeholder="https://example.com/logo.png">
                            <span class="text-xs text-gray-500 text-center block my-2">OR</span>
                            <label for="logo-upload" class="w-full text-center cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors block">
                                {{ languageService.translate('wizard.branding.upload') }}
                            </label>
                            <input id="logo-upload" type="file" (change)="onLogoSelected($event)" class="hidden" accept=".png,.jpg,.jpeg,.svg,.webp,.gif">
                        </div>
                    </div>

                    <!-- Right side: preview -->
                    <div class="flex flex-col items-center justify-center bg-gray-900/50 p-6 rounded-lg border-2 border-dashed border-gray-700 h-full">
                        <span class="text-xs text-gray-500 mb-4">{{ languageService.translate('wizard.branding.preview') }}</span>
                        <div class="flex items-center gap-4 bg-gray-800 p-4 rounded-lg border border-gray-600 min-w-[250px] justify-center">
                            @if (logoUrl()) {
                                <img [src]="logoUrl()" alt="Logo Preview" class="w-12 h-12 rounded-full object-contain bg-white/10 p-1 flex-shrink-0">
                            } @else {
                                <div class="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-500 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                            }
                            <span class="text-lg font-bold text-white truncate">{{ siteTitle() || 'Brand Name' }}</span>
                        </div>
                    </div>
                </div>

                <div class="mt-auto flex justify-between">
                  <button type="button" (click)="currentStep.set(1)" class="text-gray-400 hover:text-white">{{ languageService.translate('common.back') }}</button>
                  <button type="button" (click)="currentStep.set(3)" [disabled]="!siteTitle()" class="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                    {{ languageService.translate('common.next') }}
                  </button>
                </div>
            </div>
        }

        <!-- Step 3: Role Selection -->
        @if (currentStep() === 3) {
            <div class="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-xl font-bold text-white mb-2">{{ languageService.translate('wizard.role.title') }}</h3>
                    <!-- IP Location Indicator -->
                    @if (detectedLocation()) {
                        <div class="text-xs bg-gray-900 border border-gray-600 px-3 py-1 rounded flex items-center gap-2">
                            <span class="text-gray-400">Detected:</span>
                            <span class="font-bold text-white">{{ detectedLocation()?.country || 'Unknown' }}</span>
                            @if(detectedLocation()?.countryCode) {
                                <img [src]="'https://flagcdn.com/16x12/' + detectedLocation()?.countryCode?.toLowerCase() + '.png'" alt="flag">
                            }
                        </div>
                    }
                </div>
                <p class="text-gray-400 mb-8">{{ languageService.translate('wizard.role.description') }}</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <!-- External -->
                  <button type="button" (click)="selectRole('external')" class="p-6 rounded-xl border-2 flex flex-col gap-3 transition-all hover:bg-gray-700 group text-left rtl:text-right" 
                    [class.border-teal-500]="selectedRole() === 'external'" 
                    [ngClass]="{'bg-teal-900/20': selectedRole() === 'external'}"
                    [class.border-gray-600]="selectedRole() !== 'external'">
                    <div class="flex justify-between items-start">
                        <div class="p-3 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors">
                            <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        @if(selectedRole() === 'external') { <div class="w-4 h-4 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div> }
                    </div>
                    <div>
                        <div class="text-lg font-bold text-white">{{ languageService.translate('wizard.role.germany') }}</div>
                        <p class="text-xs text-gray-400 mt-1">{{ languageService.translate('wizard.role.germanyDesc') }}</p>
                    </div>
                  </button>

                  <!-- Iran -->
                  <button type="button" (click)="selectRole('iran')" class="p-6 rounded-xl border-2 flex flex-col gap-3 transition-all hover:bg-gray-700 group text-left rtl:text-right" 
                    [class.border-teal-500]="selectedRole() === 'iran'" 
                    [ngClass]="{'bg-teal-900/20': selectedRole() === 'iran'}"
                    [class.border-gray-600]="selectedRole() !== 'iran'">
                    <div class="flex justify-between items-start">
                        <div class="p-3 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors">
                            <svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        @if(selectedRole() === 'iran') { <div class="w-4 h-4 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div> }
                    </div>
                    <div>
                        <div class="text-lg font-bold text-white">{{ languageService.translate('wizard.role.iran') }}</div>
                        <p class="text-xs text-gray-400 mt-1">{{ languageService.translate('wizard.role.iranDesc') }}</p>
                        @if(detectedLocation()?.countryCode === 'IR') {
                            <div class="mt-2 text-xs text-green-400 font-bold bg-green-900/20 px-2 py-1 rounded inline-block animate-pulse">Recommended (Detected)</div>
                        }
                    </div>
                  </button>
                </div>

                <div class="mt-auto flex justify-between">
                  <button type="button" (click)="currentStep.set(2)" class="text-gray-400 hover:text-white">{{ languageService.translate('common.back') }}</button>
                  <button type="button" (click)="nextStep()" [disabled]="!selectedRole()" class="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                    {{ languageService.translate('common.next') }}
                  </button>
                </div>
            </div>
        }

        <!-- Step 4: Connection Logic -->
        @if (currentStep() === 4) {
            <div class="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                @if(selectedRole() === 'external') {
                    <!-- EXTERNAL SERVER: GENERATE TOKEN -->
                    <h3 class="text-xl font-bold text-white mb-2">{{ languageService.translate('wizard.external.genKeyTitle') }}</h3>
                    <p class="text-gray-400 mb-6">{{ languageService.translate('wizard.external.genKeyDesc') }}</p>
                    
                    <div class="bg-black/40 p-6 rounded-lg border border-teal-500/30 mb-6 relative group">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-teal-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                {{ languageService.translate('wizard.external.tokenLabel') }}
                            </span>
                        </div>
                        
                        <div class="relative bg-black p-4 rounded border border-gray-700 font-mono text-sm break-all text-green-400 shadow-inner">
                            {{ generatedToken() }}
                            <button type="button" (click)="copyToken()" class="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded transition-colors group-hover:opacity-100 opacity-80">
                                {{ languageService.translate('common.copy') }}
                            </button>
                        </div>
                        <p class="text-xs text-yellow-500 mt-2">{{ languageService.translate('wizard.external.genKeyNote') }}</p>
                    </div>
                } @else {
                    <!-- IRAN SERVER: INPUT TOKEN -->
                    <h3 class="text-xl font-bold text-white mb-2">{{ languageService.translate('wizard.iran.enterKeyTitle') }}</h3>
                    <p class="text-gray-400 mb-6">{{ languageService.translate('wizard.iran.enterKeyDesc') }}</p>
                    
                    <div class="bg-black/20 p-6 rounded-lg border border-teal-900/50 mb-6">
                        <label class="block text-teal-400 text-xs font-bold uppercase mb-2">
                            {{ languageService.translate('wizard.iran.keyLabel') }}
                        </label>
                        <div class="flex gap-3">
                            <input type="text" [(ngModel)]="iranKeyInput" class="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white font-mono text-sm focus:border-teal-500 outline-none" [placeholder]="languageService.translate('wizard.iran.placeholder')">
                            <button type="button" (click)="verifyKey()" [disabled]="!iranKeyInput() || isVerifying()" class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded border border-gray-600 flex items-center gap-2">
                                @if(isVerifying()) {
                                    <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                } @else {
                                    {{ languageService.translate('wizard.iran.verifyBtn') }}
                                }
                            </button>
                        </div>
                        
                        @if (verifiedNode()) {
                            <div class="mt-4 p-4 bg-green-900/20 border border-green-800 rounded animate-in fade-in">
                                <div class="text-green-400 text-sm font-bold">{{ languageService.translate('wizard.iran.verified') }}</div>
                                <div class="text-gray-400 text-xs mt-1">Target: {{ verifiedNode()!.hostname }} ({{ verifiedNode()!.ip }})</div>
                            </div>
                        }
                    </div>
                }

                <div class="mt-auto flex justify-between items-center">
                    <button type="button" (click)="currentStep.set(3)" class="text-gray-400 hover:text-white">{{ languageService.translate('common.back') }}</button>
                    <button type="button" (click)="finishSetup()" [disabled]="selectedRole() === 'iran' && !verifiedNode()" class="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg disabled:opacity-50">
                        {{ languageService.translate('wizard.finish.doneButton') }}
                    </button>
                </div>
            </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupWizardComponent implements OnInit {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);

  currentStep = signal(1);
  selectedRole = signal<'iran' | 'external' | null>(null);
  
  // Branding
  siteTitle = signal('');
  logoUrl = signal('');

  // Config Logic
  generatedToken = signal('');
  iranKeyInput = signal('');
  
  detectedLocation = signal<any>(null);
  isVerifying = signal(false);
  verifiedNode = signal<EdgeNodeInfo | null>(null);

  async ngOnInit() {
      const data = await this.core.fetchIpLocation();
      if (data && data.status === 'success') {
          this.detectedLocation.set(data);
          if (data.countryCode === 'IR') {
              this.selectedRole.set('iran');
          }
      }
  }

  selectLanguage(lang: 'en' | 'fa' | 'zh' | 'ru') {
      this.languageService.setLanguage(lang);
      this.currentStep.set(2);
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
        const allowedExtensions = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
            alert('Invalid file type. Please upload a valid image (PNG, JPG, SVG, WEBP, GIF).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            this.logoUrl.set(base64);
        };
        reader.readAsDataURL(file);
    }
  }

  selectRole(role: 'iran' | 'external') { this.selectedRole.set(role); }

  nextStep() {
    this.currentStep.update(s => s + 1);
    if (this.currentStep() === 4 && this.selectedRole() === 'external') {
        this.generatedToken.set(this.core.generateConnectionToken());
    }
  }

  verifyKey() {
      if (!this.iranKeyInput()) return;
      this.isVerifying.set(true);
      
      setTimeout(() => {
          const parsed = this.core.parseConnectionToken(this.iranKeyInput());
          if (parsed) {
              this.verifiedNode.set({
                  ip: parsed.host,
                  hostname: parsed.host,
                  location: 'Germany (Parsed)',
                  latency: '0ms',
                  provider: 'Upstream'
              });
          } else {
              alert('Invalid Token Format');
          }
          this.isVerifying.set(false);
      }, 1000);
  }

  finishSetup() {
    this.core.updateBranding(this.siteTitle(), this.logoUrl() || null, this.core.currency());

    if (this.selectedRole() === 'iran') {
        this.core.connectToUpstream(this.iranKeyInput());
    }
    
    this.core.serverRole.set(this.selectedRole());
    this.core.isConfigured.set(true);
  }

  copyToken() { navigator.clipboard.writeText(this.generatedToken()); }
}
