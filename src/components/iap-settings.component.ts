
import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-iap-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-gray-900/50 p-6 rounded-lg border border-gray-700 mt-8">
        <div class="flex items-center gap-3 mb-4 border-b border-gray-700 pb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.7 5.27z"/>
            </svg>
            <div>
                <h3 class="text-lg font-bold text-gray-200" [attr.data-tooltip]="languageService.translate('tooltips.settings.iap')">{{ languageService.translate('settings.iap.title') }}</h3>
                <p class="text-sm text-gray-400">{{ languageService.translate('settings.iap.description') }}</p>
            </div>
        </div>

        <form [formGroup]="iapForm" (ngSubmit)="saveConfig()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-gray-400 text-xs uppercase font-bold mb-1">{{ languageService.translate('settings.iap.form.projectId') }}</label>
                    <input formControlName="projectId" type="text" class="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm focus:border-blue-500 outline-none" placeholder="my-gcp-project">
                </div>
                <div>
                    <label class="block text-gray-400 text-xs uppercase font-bold mb-1">{{ languageService.translate('settings.iap.form.zone') }}</label>
                    <input formControlName="zone" type="text" class="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm focus:border-blue-500 outline-none" placeholder="europe-west3-c">
                </div>
                <div>
                    <label class="block text-gray-400 text-xs uppercase font-bold mb-1">{{ languageService.translate('settings.iap.form.instance') }}</label>
                    <input formControlName="instanceName" type="text" class="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm focus:border-blue-500 outline-none" placeholder="instance-1">
                </div>
            </div>
            
            <!-- Info Cards -->
            <div class="grid grid-cols-3 gap-2 text-xs text-center mt-2">
                <div class="bg-gray-800 p-2 rounded border border-gray-700 text-gray-300">{{ languageService.translate('settings.iap.info.secure') }}</div>
                <div class="bg-gray-800 p-2 rounded border border-gray-700 text-gray-300">{{ languageService.translate('settings.iap.info.noPublicIp') }}</div>
                <div class="bg-gray-800 p-2 rounded border border-gray-700 text-gray-300">{{ languageService.translate('settings.iap.info.tcpFwd') }}</div>
            </div>

            <!-- Command Output -->
            <div class="mt-4 bg-black rounded-lg border border-gray-700 p-4 relative group">
                <div class="text-xs text-gray-500 mb-2 font-bold uppercase">{{ languageService.translate('settings.iap.command.title') }}</div>
                <p class="text-xs text-gray-400 mb-2">{{ languageService.translate('settings.iap.command.description') }}</p>
                <code class="block font-mono text-sm text-green-400 break-all bg-gray-900 p-2 rounded">{{ command() }}</code>
                <button type="button" (click)="copyCommand()" class="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {{ copied() ? languageService.translate('settings.iap.command.copied') : languageService.translate('settings.iap.command.copy') }}
                </button>
            </div>

            <div class="flex justify-end">
                <button type="submit" [disabled]="iapForm.invalid" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors shadow-lg disabled:opacity-50 text-sm">
                    {{ languageService.translate('common.saveChanges') }}
                </button>
            </div>
        </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IapSettingsComponent implements OnInit {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);
  fb: FormBuilder = inject(FormBuilder);

  iapForm = this.fb.group({
    projectId: ['', Validators.required],
    zone: ['', Validators.required],
    instanceName: ['', Validators.required]
  });

  command = signal('');
  copied = signal(false);

  ngOnInit() {
    const config = this.core.iapConfig();
    this.iapForm.setValue({
        projectId: config.projectId,
        zone: config.zone,
        instanceName: config.instanceName
    });
    this.updateCommand();

    this.iapForm.valueChanges.subscribe(() => this.updateCommand());
  }

  updateCommand() {
    const { projectId, zone, instanceName } = this.iapForm.value;
    // Command to start a tunnel on port 22 (SSH) or forward generic TCP
    this.command.set(`gcloud compute start-iap-tunnel ${instanceName} 22 --zone=${zone} --project=${projectId}`);
  }

  saveConfig() {
    if (this.iapForm.valid) {
        this.core.updateIapConfig(this.iapForm.value as any);
    }
  }

  copyCommand() {
    navigator.clipboard.writeText(this.command()).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
