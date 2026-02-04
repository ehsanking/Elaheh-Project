
import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
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
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 min-h-[500px] flex flex-col shadow-2xl relative">
        
        <!-- Header: Title & Language Switcher -->
        <div class="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 text-teal-500 bg-teal-900/30 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-white tracking-tight">{{ languageService.translate('wizard.title') }}</h2>
            </div>

            <!-- Language Switcher -->
            <div class="relative">
                <button type="button" (click)="showLangDropdown.set(!showLangDropdown())" class="flex items-center gap-2 text-sm text-gray-300 hover:text-white bg-black/30 hover:bg-black/50 px-3 py-2 rounded border border-gray-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                    <span>{{ languageService.getCurrentLanguageName() }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                </button>
                
                @if(showLangDropdown()) {
                    <div class="fixed inset-0 z-10" (click)="showLangDropdown.set(false)"></div>
                    <div class="absolute top-full right-0 mt-2 w-40 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-20 overflow-hidden">
                        <button (click)="setLanguage('en')" class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white flex items-center gap-2">🇬🇧 English</button>
                        <button (click)="setLanguage('fa')" class="w-full text-right px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white flex items-center gap-2 justify-end">🇮🇷 فارسی</button>
                        <button (click)="setLanguage('zh')" class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white flex items-center gap-2">🇨🇳 中文</button>
                        <button (click)="setLanguage('ru')" class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white flex items-center gap-2">🇷🇺 Русский</button>
                    </div>
                }
            </div>
        </div>
        
        <!-- Step 1: Role Selection -->
        @if (currentStep() === 1) {
            <div class="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 class="text-xl font-bold text-white mb-2">{{ languageService.translate('wizard.role.title') }}</h3>
                <p class="text-gray-400 mb-8">{{ languageService.translate('wizard.role.description') }}</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <button type="button" (click)="selectRole('external')" class="p-6 rounded-xl border-2 flex flex-col gap-3 transition-all hover:bg-gray-700 group text-left rtl:text-right" 
                    [class.border-teal-500]="selectedRole() === 'external'" 
                    [class.bg-teal-900/20]="selectedRole() === 'external'"
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

                  <button type="button" (click)="selectRole('iran')" class="p-6 rounded-xl border-2 flex flex-col gap-3 transition-all hover:bg-gray-700 group text-left rtl:text-right" 
                    [class.border-teal-500]="selectedRole() === 'iran'" 
                    [class.bg-teal-900/20]="selectedRole() === 'iran'"
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
                    </div>
                  </button>
                </div>

                <div class="mt-auto flex justify-end">
                  <button type="button" (click)="nextStep()" [disabled]="!selectedRole()" class="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg flex items-center gap-2">
                    {{ languageService.translate('wizard.role.next') }}
                    <svg class="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
            </div>
        }

        <!-- Step 2: Key Generation OR Config Display -->
        @if (currentStep() === 2) {
            <div class="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                @if(selectedRole() === 'iran') {
                    <!-- IRAN SERVER: Show Identity Token -->
                    <h3 class="text-xl font-bold text-white mb-2">{{ languageService.translate('wizard.finish.identityKeyTitle') }}</h3>
                    <p class="text-gray-400 mb-6">{{ languageService.translate('wizard.finish.identityKeyDesc') }}</p>
                    
                    <div class="bg-black/40 p-6 rounded-lg border border-teal-500/30 mb-6 relative group">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-teal-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                {{ languageService.translate('wizard.finish.tokenLabel') }}
                            </span>
                        </div>
                        
                        <div class="relative bg-black p-4 rounded border border-gray-700 font-mono text-sm break-all text-green-400 shadow-inner">
                            {{ edgeNodeKey() }}
                            <button type="button" (click)="copyKey()" class="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded transition-colors group-hover:opacity-100 opacity-80" [title]="languageService.translate('common.copy')">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                        </div>
                        <p class="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            {{ languageService.translate('wizard.finish.secureWarning') }}
                        </p>
                    </div>
                } @else {
                    <!-- EXTERNAL SERVER: Ask for Iran Key & Validation -->
                    <h3 class="text-xl font-bold text-white mb-2">{{ languageService.translate('wizard.external.enterKeyTitle') }}</h3>
                    <p class="text-gray-400 mb-6">{{ languageService.translate('wizard.external.enterKeyDesc') }}</p>
                    
                    <div class="bg-black/20 p-6 rounded-lg border border-teal-900/50 mb-6">
                        <label class="block text-teal-400 text-xs font-bold uppercase mb-2">
                            {{ languageService.translate('wizard.external.keyLabel') }}
                        </label>
                        <div class="flex gap-3">
                            <div class="relative flex-1">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                </div>
                                <input type="text" [(ngModel)]="iranKeyInput" (input)="resetVerification()" class="w-full bg-gray-900 border border-gray-600 rounded p-3 pl-10 text-white font-mono text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors" [placeholder]="languageService.translate('wizard.external.placeholder')">
                            </div>
                            <button type="button" (click)="verifyKey()" [disabled]="!iranKeyInput() || isVerifying()" class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded border border-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                                @if(isVerifying()) {
                                    <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                } @else {
                                    {{ languageService.translate('wizard.external.verifyBtn') }}
                                }
                            </button>
                        </div>
                        
                        <!-- Validation Status -->
                        @if (verificationError()) {
                            <div class="mt-3 p-3 bg-red-900/30 border border-red-800 rounded flex items-center gap-2 text-red-300 text-xs animate-in fade-in slide-in-from-top-2">
                                <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {{ verificationError() }}
                            </div>
                        }

                        @if (verifiedNode()) {
                            <div class="mt-4 p-4 bg-green-900/20 border border-green-800 rounded animate-in fade-in slide-in-from-top-2">
                                <div class="flex items-center gap-2 mb-3 text-green-400 text-sm font-bold border-b border-green-800/50 pb-2">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {{ languageService.translate('wizard.external.verifiedTitle') }}
                                </div>
                                <div class="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span class="text-gray-500 block">{{ languageService.translate('wizard.external.nodeIp') }}</span>
                                        <span class="text-white font-mono">{{ verifiedNode()!.ip }}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-500 block">{{ languageService.translate('wizard.external.nodeLoc') }}</span>
                                        <span class="text-white">{{ verifiedNode()!.location }}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-500 block">{{ languageService.translate('wizard.external.provider') }}</span>
                                        <span class="text-white">{{ verifiedNode()!.provider }}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-500 block">{{ languageService.translate('wizard.external.latency') }}</span>
                                        <span class="text-green-400 font-mono">{{ verifiedNode()!.latency }}</span>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                }

                <div class="mt-auto flex justify-between items-center">
                    <button type="button" (click)="currentStep.set(1)" class="text-gray-400 hover:text-white flex items-center gap-2 text-sm px-4 py-2">
                        <svg class="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                        {{ languageService.translate('common.back') }}
                    </button>
                    <button type="button" (click)="finishSetup()" [disabled]="selectedRole() === 'external' && !verifiedNode()" class="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg transform hover:scale-105">
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
export class SetupWizardComponent {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);

  currentStep = signal(1);
  selectedRole = signal<'iran' | 'external' | null>(null);
  edgeNodeKey = signal('');
  iranKeyInput = signal('');
  showLangDropdown = signal(false);

  // Verification State
  isVerifying = signal(false);
  verificationError = signal<string | null>(null);
  verifiedNode = signal<EdgeNodeInfo | null>(null);

  selectRole(role: 'iran' | 'external') { this.selectedRole.set(role); }

  nextStep() {
    this.currentStep.set(2);
    if (this.selectedRole() === 'iran') {
        this.edgeNodeKey.set(this.core.generateSecureEdgeKey());
    }
  }

  resetVerification() {
      this.verifiedNode.set(null);
      this.verificationError.set(null);
  }

  verifyKey() {
      if (!this.iranKeyInput()) return;
      
      this.isVerifying.set(true);
      this.verificationError.set(null);
      this.verifiedNode.set(null);

      this.core.verifyEdgeIdentity(this.iranKeyInput())
        .then(node => {
            this.verifiedNode.set(node);
        })
        .catch(err => {
            this.verificationError.set(err || 'Unknown verification error.');
        })
        .finally(() => {
            this.isVerifying.set(false);
        });
  }

  finishSetup() {
    if (this.selectedRole() === 'external') {
        this.core.registerEdgeNode(this.iranKeyInput());
    }
    this.core.serverRole.set(this.selectedRole());
    this.core.isConfigured.set(true);
  }

  copyKey() { navigator.clipboard.writeText(this.edgeNodeKey()); }

  setLanguage(lang: 'en' | 'fa' | 'zh' | 'ru') {
      this.languageService.setLanguage(lang);
      this.showLangDropdown.set(false);
  }
}
