import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-ssh-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-gray-900/50 p-6 rounded-lg border border-gray-700 mt-8">
        <div class="flex items-center gap-3 mb-6 border-b border-gray-700 pb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            <div>
                <h3 class="text-lg font-bold text-gray-200">{{ languageService.translate('settings.sshSettings.title') }}</h3>
                <p class="text-sm text-gray-400">{{ languageService.translate('settings.sshSettings.description') }}</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Local Forwarding Config -->
            <div class="bg-black/20 p-4 rounded-xl border border-gray-700">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="text-teal-400 font-bold text-sm">{{ languageService.translate('settings.sshSettings.localTitle') }}</h4>
                        <p class="text-xs text-gray-500">{{ languageService.translate('settings.sshSettings.localDesc') }}</p>
                    </div>
                    <div class="bg-gray-800 px-2 py-1 rounded text-xs font-mono text-gray-300">-L [bind_address:]port:host:hostport</div>
                </div>
                
                <form [formGroup]="localForm" (ngSubmit)="addLocalRule()">
                    <div class="space-y-3">
                        <div>
                            <label class="block text-gray-400 text-xs mb-1">{{ languageService.translate('settings.sshSettings.bindPort') }}</label>
                            <input formControlName="localPort" type="number" class="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm focus:border-teal-500 outline-none" placeholder="8080">
                        </div>
                        <div>
                            <label class="block text-gray-400 text-xs mb-1">{{ languageService.translate('settings.sshSettings.target') }}</label>
                            <input formControlName="target" type="text" class="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm focus:border-teal-500 outline-none" placeholder="localhost:80">
                        </div>
                        <button type="submit" [disabled]="localForm.invalid" class="w-full bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold py-2 rounded transition-colors disabled:opacity-50">
                            {{ languageService.translate('settings.sshSettings.addRule') }}
                        </button>
                    </div>
                </form>

                <div class="mt-4 pt-4 border-t border-gray-700">
                    <div class="text-xs font-bold text-gray-500 mb-2 uppercase">{{ languageService.translate('settings.sshSettings.useCase') }}</div>
                    <ul class="text-xs text-gray-400 list-disc list-inside space-y-1">
                        <li>Access internal admin panels securely.</li>
                        <li>Forward database ports (3306, 5432) to localhost.</li>
                    </ul>
                </div>
            </div>

            <!-- Remote Forwarding Config -->
            <div class="bg-black/20 p-4 rounded-xl border border-gray-700">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="text-purple-400 font-bold text-sm">{{ languageService.translate('settings.sshSettings.remoteTitle') }}</h4>
                        <p class="text-xs text-gray-500">{{ languageService.translate('settings.sshSettings.remoteDesc') }}</p>
                    </div>
                    <div class="bg-gray-800 px-2 py-1 rounded text-xs font-mono text-gray-300">-R [bind_address:]port:host:hostport</div>
                </div>

                <form [formGroup]="remoteForm" (ngSubmit)="addRemoteRule()">
                    <div class="space-y-3">
                        <div>
                            <label class="block text-gray-400 text-xs mb-1">{{ languageService.translate('settings.sshSettings.bindPort') }} (Remote)</label>
                            <input formControlName="remotePort" type="number" class="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm focus:border-purple-500 outline-none" placeholder="9000">
                        </div>
                        <div>
                            <label class="block text-gray-400 text-xs mb-1">{{ languageService.translate('settings.sshSettings.target') }} (Local)</label>
                            <input formControlName="target" type="text" class="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm focus:border-purple-500 outline-none" placeholder="localhost:3000">
                        </div>
                        <button type="submit" [disabled]="remoteForm.invalid" class="w-full bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold py-2 rounded transition-colors disabled:opacity-50">
                            {{ languageService.translate('settings.sshSettings.addRule') }}
                        </button>
                    </div>
                </form>

                <div class="mt-4 pt-4 border-t border-gray-700">
                    <div class="text-xs font-bold text-gray-500 mb-2 uppercase">{{ languageService.translate('settings.sshSettings.useCase') }}</div>
                    <ul class="text-xs text-gray-400 list-disc list-inside space-y-1">
                        <li>Expose local dev server to the internet via VPS.</li>
                        <li>Bypass inbound firewalls (Reverse Tunnel).</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SshSettingsComponent {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);
  fb: FormBuilder = inject(FormBuilder);

  localForm = this.fb.group({
    localPort: ['', [Validators.required, Validators.min(1)]],
    target: ['', Validators.required]
  });

  remoteForm = this.fb.group({
    remotePort: ['', [Validators.required, Validators.min(1)]],
    target: ['', Validators.required]
  });

  addLocalRule() {
    if (this.localForm.valid) {
      const { localPort, target } = this.localForm.value;
      this.core.addLog('SUCCESS', `Added Local Forwarding: -L ${localPort}:${target}`);
      this.localForm.reset();
    }
  }

  addRemoteRule() {
    if (this.remoteForm.valid) {
      const { remotePort, target } = this.remoteForm.value;
      this.core.addLog('SUCCESS', `Added Remote Forwarding: -R ${remotePort}:${target}`);
      this.remoteForm.reset();
    }
  }
}