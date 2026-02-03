import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ElahehCoreService, EndpointType, EndpointStrategy } from '../services/elaheh-core.service';
import { Language, LanguageService } from '../services/language.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DnsProvider {
  ip: string;
  name: string;
  status: 'untested' | 'testing' | 'optimal' | 'suboptimal' | 'failed';
  latency: number | null;
}

@Component({
  selector: 'app-setup-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      <h2 class="text-2xl font-bold text-teal-400 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        {{ languageService.translate('wizard.title') }}
      </h2>

      <!-- Progress Steps -->
      <div class="flex justify-between mb-8 border-b border-gray-700 pb-4">
        @for (step of steps(); track step.id) {
          <div class="flex items-center gap-2" [class.text-teal-400]="currentStep() >= step.id" [class.text-gray-600]="currentStep() < step.id" [class.hidden]="step.id === 5 && selectedRole() === 'iran'">
            <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold"
                 [class.border-teal-400]="currentStep() >= step.id"
                 [class.bg-teal-900]="currentStep() == step.id"
                 [class.border-gray-600]="currentStep() < step.id">
              {{step.id}}
            </div>
            <span>{{step.name}}</span>
          </div>
        }
      </div>

      <!-- Content Area -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 min-h-[500px] flex flex-col">
        
        <!-- Step 1: Role -->
        @if (currentStep() === 1) {
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-bold text-white">{{ languageService.translate('wizard.role.title') }}</h3>
                <p class="text-gray-400 mt-1">{{ languageService.translate('wizard.role.description') }}</p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button (click)="selectRole('external')" class="text-left p-6 rounded border-2 transition-all flex flex-col justify-center gap-2"
                [class.bg-teal-900]="selectedRole() === 'external'"
                [class.border-teal-500]="selectedRole() === 'external'"
                [class.bg-gray-700-50]="selectedRole() !== 'external'">
                <div class="text-lg font-bold text-white">{{ languageService.translate('wizard.role.germany') }}</div>
                <p class="text-sm text-gray-400">{{ languageService.translate('wizard.role.germanyDesc') }}</p>
              </button>
              <button (click)="selectRole('iran')" class="text-left p-6 rounded border-2 transition-all flex flex-col justify-center gap-2"
                [class.bg-teal-900]="selectedRole() === 'iran'"
                [class.border-teal-500]="selectedRole() === 'iran'"
                [class.bg-gray-700-50]="selectedRole() !== 'iran'">
                <div class="text-lg font-bold text-white">{{ languageService.translate('wizard.role.iran') }}</div>
                <p class="text-sm text-gray-400">{{ languageService.translate('wizard.role.iranDesc') }}</p>
              </button>
            </div>
            <div class="mt-auto pt-6 flex justify-end">
              <button (click)="nextStep()" [disabled]="!selectedRole()" class="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded transition-colors shadow-lg">{{ languageService.translate('wizard.role.next') }}</button>
            </div>
        }

        <!-- Intermediate Steps -->
        @if (currentStep() > 1 && currentStep() < 7) {
             <div class="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div class="animate-pulse mb-4 text-4xl">⚙️</div>
                <p class="mb-2">Configuring system parameters for Step {{currentStep()}}...</p>
                <p class="text-xs text-gray-500">(System Check, OS Detection, Optimization Analysis)</p>
                <div class="mt-8 flex gap-4">
                    <button (click)="prevStep()" class="bg-gray-700 text-white px-4 py-2 rounded">Back</button>
                    <button (click)="nextStep()" class="bg-teal-600 text-white px-4 py-2 rounded">Next</button>
                </div>
             </div>
        }

        <!-- Step 7: Final Config & Installation Command -->
        @if (currentStep() === 7) {
            <h3 class="text-xl font-bold text-white mb-4">{{ languageService.translate('wizard.finish.title') }}</h3>
            
            <div class="bg-black p-4 rounded-lg border border-gray-600 mb-6">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="text-yellow-400 font-bold">🚀 Installation Required</h4>
                    <span class="text-xs text-gray-500">install.sh</span>
                </div>
                <p class="text-gray-300 text-sm mb-4">Run this one-liner on your <strong>{{ selectedRole() === 'iran' ? 'Iran (Edge)' : 'External (Upstream)' }}</strong> server to deploy the Core:</p>
                
                <div class="relative">
                    <textarea readonly class="w-full h-24 bg-gray-900 p-3 rounded-md text-sm font-mono text-green-400 border border-gray-700 resize-none">{{ installCommand() }}</textarea>
                    <button (click)="copyCommand()" class="absolute top-2 right-2 text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded">Copy</button>
                </div>
                <div class="text-xs text-red-400 mt-2 font-bold flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    Important: You must push 'install.sh' to your GitHub repository main branch for this command to work!
                </div>
            </div>

            @if (selectedRole() === 'iran') {
                <div class="mb-6">
                    <label class="block text-gray-400 text-sm mb-2">{{ languageService.translate('wizard.finish.key') }}</label>
                    <div class="relative">
                        <input type="text" readonly [value]="edgeNodeKey()" class="w-full bg-black p-4 rounded-lg font-mono text-teal-300 border border-gray-600 pr-12">
                        <button (click)="copyKey(edgeNodeKey())" class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                    </div>
                </div>
            }

            <div class="text-center mt-auto">
                <button (click)="goToDashboard()" class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded transition-colors shadow-lg text-lg">
                    Go to Dashboard
                </button>
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
  selectedOS = signal<'rpm' | 'deb' | null>(null);
  
  isCheckingSystem = signal(false);
  checkLogs = signal<string[]>([]);
  isCheckComplete = signal(true); 
  dnsProviders = signal<DnsProvider[]>([]);
  isDnsTestingComplete = signal(true);
  selectedStrategy = signal<EndpointType | null>(null);
  isArchitectureConfirmed = signal(true);
  dohEnabledForSetup = signal(false);
  dohSubdomainForSetup = signal('dns');
  camouflageMode = signal<'AI_RESEARCH' | 'SHOP' | 'SEARCH_ENGINE' | null>('SHOP');
  
  edgeNodeKey = signal('');
  toastMessage = signal<string | null>(null);
  showLangDropdown = signal(false);

  steps = computed(() => [
    { id: 1, name: this.languageService.translate('wizard.steps.serverRole') },
    { id: 2, name: this.languageService.translate('wizard.steps.selectOS') },
    { id: 3, name: this.languageService.translate('wizard.steps.systemCheck') },
    { id: 4, name: this.languageService.translate('wizard.steps.endpoint') },
    { id: 5, name: this.languageService.translate('wizard.steps.doh') },
    { id: 6, name: this.languageService.translate('wizard.steps.camouflage') },
    { id: 7, name: this.languageService.translate('wizard.steps.finalConfig') },
  ]);

  installCommand = computed(() => {
      const role = this.selectedRole();
      const key = this.edgeNodeKey();
      
      // Public Repo One-Liner (Corrected)
      // Note: This relies on the 'install.sh' being present in the repo at the provided URL.
      const baseCmd = `bash <(curl -Ls https://raw.githubusercontent.com/EHSANKiNG/project-elaheh/main/install.sh)`;
      
      if (role === 'iran') {
          return `${baseCmd} --role edge --key ${key}`;
      } else {
          return `${baseCmd} --role upstream`;
      }
  });

  nextStep() {
    let next = this.currentStep() + 1;
    if (next === 5 && this.selectedRole() === 'iran') next++;
    this.currentStep.set(Math.min(next, 7));
    if (next === 7) this.finishSetup();
  }

  prevStep() {
    let prev = this.currentStep() - 1;
    if (prev === 5 && this.selectedRole() === 'iran') prev--;
    this.currentStep.set(Math.max(prev, 1));
  }

  selectRole(role: 'iran' | 'external') { this.selectedRole.set(role); }
  selectOS(os: 'rpm' | 'deb') { this.selectedOS.set(os); this.core.selectedOS.set(os); }
  
  runSystemCheck() { this.isCheckingSystem.set(true); setTimeout(() => { this.isCheckComplete.set(true); this.isDnsTestingComplete.set(true); }, 1000); }
  selectStrategy(type: EndpointType) { this.selectedStrategy.set(type); }
  confirmArchitecture() { this.isArchitectureConfirmed.set(true); }
  selectCamouflage(mode: any) { this.camouflageMode.set(mode); }

  finishSetup() {
    this.core.serverRole.set(this.selectedRole());
    this.core.isConfigured.set(true);
    if (this.core.serverRole() === 'iran') {
      this.edgeNodeKey.set(this.core.generateEdgeNodeKey());
    }
  }

  copyCommand() { navigator.clipboard.writeText(this.installCommand()); }
  copyKey(key: string) { navigator.clipboard.writeText(key); }
  
  setLanguage(lang: Language) { this.languageService.setLanguage(lang); this.showLangDropdown.set(false); }
  goToDashboard() { /* Handled by app.component state check */ }
}