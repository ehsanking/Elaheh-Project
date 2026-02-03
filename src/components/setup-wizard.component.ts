import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ElahehCoreService } from '../services/elaheh-core.service';
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
                <button (click)="showLangDropdown.set(!showLangDropdown())" class="flex items-center gap-2 text-sm text-gray-300 hover:text-white bg-black/30 hover:bg-black/50 px-3 py-2 rounded border border-gray-600 transition-colors">
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
                  <button (click)="selectRole('external')" class="p-6 rounded-xl border-2 flex flex-col gap-3 transition-all hover:bg-gray-700 group text-left rtl:text-right" 
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

                  <button (click)="selectRole('iran')" class="p-6 rounded-xl border-2 flex flex-col gap-3 transition-all hover:bg-gray-700 group text-left rtl:text-right" 
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
                  <button (click)="nextStep()" [disabled]="!selectedRole()" class="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg flex items-center gap-2">
                    {{ languageService.translate('wizard.role.next') }}
                    <svg class="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
            </div>
        }

        <!-- Step 2: Code Generation -->
        @if (currentStep() === 2) {
            <div class="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 class="text-xl font-bold text-white mb-2">{{ languageService.translate('wizard.finish.title') }}</h3>
                <p class="text-gray-400 mb-6">{{ languageService.translate('wizard.finish.description') }}</p>
                
                <div class="bg-black p-4 rounded-lg border border-gray-600 mb-6 relative group">
                    <div class="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
                        <h4 class="text-green-400 font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                           <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                           BASH
                        </h4>
                    </div>
                    
                    <div class="relative">
                        <textarea readonly class="w-full h-24 bg-transparent p-2 rounded-md text-xs font-mono text-gray-300 border-none resize-none outline-none focus:ring-0 whitespace-pre scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent" (click)="$event.target.select()">{{ installCommand() }}</textarea>
                        <button (click)="copyCommand()" class="absolute top-0 right-0 text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-600 transition-colors flex items-center gap-2">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            {{ languageService.translate('common.copy') }}
                        </button>
                    </div>
                </div>
                
                @if(selectedRole() === 'iran') {
                    <div class="bg-yellow-900/20 p-4 rounded border border-yellow-700/50 mb-6">
                         <p class="text-yellow-400 text-xs font-bold mb-1 uppercase tracking-wide">⚠ Important:</p>
                         <p class="text-yellow-200 text-xs opacity-80 mb-2">This key links your Edge Node to the Core Panel. Keep it secret.</p>
                         <div class="bg-black/50 p-3 rounded text-xs font-mono text-gray-300 border border-yellow-900/30 break-all select-all">{{ edgeNodeKey() }}</div>
                    </div>
                }

                <div class="mt-auto flex justify-between items-center">
                    <button (click)="currentStep.set(1)" class="text-gray-400 hover:text-white flex items-center gap-2 text-sm px-4 py-2">
                        <svg class="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                        {{ languageService.translate('common.back') }}
                    </button>
                    <button (click)="finishSetup()" class="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg transform hover:scale-105">
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
  showLangDropdown = signal(false);

  installCommand = computed(() => {
    const role = this.selectedRole();
    if (!role) return '';

    const baseUrl = "bash <(curl -Ls https://raw.githubusercontent.com/ehsanking/Elaheh-Project/main/install.sh)";
    
    if (role === 'iran') {
      const key = this.edgeNodeKey();
      return `${baseUrl} --role iran --key ${key}`;
    } else {
      return `${baseUrl} --role external`;
    }
  });

  selectRole(role: 'iran' | 'external') { this.selectedRole.set(role); }

  nextStep() {
    this.currentStep.set(2);
    if (this.selectedRole() === 'iran') {
        this.edgeNodeKey.set(this.core.generateEdgeNodeKey());
    }
  }

  finishSetup() {
    this.core.serverRole.set(this.selectedRole());
    this.core.isConfigured.set(true);
  }

  copyCommand() { navigator.clipboard.writeText(this.installCommand()); }

  setLanguage(lang: 'en' | 'fa' | 'zh' | 'ru') {
      this.languageService.setLanguage(lang);
      this.showLangDropdown.set(false);
  }
}