import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-doh-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-gray-900/50 p-6 rounded-lg border border-gray-700 mt-8">
      <h3 class="text-lg font-bold text-gray-200 mb-1">{{ languageService.translate('settings.doh.title') }}</h3>
      <p class="text-sm text-gray-400 mb-6">{{ languageService.translate('settings.doh.description') }}</p>

      <div class="flex items-center mb-6">
        <label for="doh-toggle" class="relative inline-flex items-center cursor-pointer" [attr.data-tooltip]="languageService.translate('tooltips.settings.dohEnable')">
          <input type="checkbox" id="doh-toggle" class="sr-only peer" 
                 [checked]="core.isDohEnabled()"
                 (change)="toggleDoh($event)">
          <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          <span class="ml-3 text-sm font-medium text-gray-300">{{ languageService.translate('settings.doh.enable') }}</span>
        </label>
      </div>

      @if(core.isDohEnabled()) {
        <div class="space-y-4">
          @if(core.dohStatus() === 'active') {
            <div class="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <label class="block text-gray-400 text-xs uppercase font-bold mb-2">{{ languageService.translate('settings.doh.activeUrl') }}</label>
              <div class="flex gap-2">
                <input type="text" readonly [value]="core.dohUrl()" class="w-full bg-black p-2 rounded-md font-mono text-sm text-teal-300 border border-gray-600">
                <button (click)="copyUrl(core.dohUrl()!)" class="px-4 py-2 text-sm rounded transition-colors"
                        [class.bg-green-700]="copied()" [class.text-white]="copied()"
                        [class.bg-gray-700]="!copied()" [class.text-gray-300]="!copied()" [class.hover:bg-gray-600]="!copied()">
                  {{ copied() ? languageService.translate('settings.doh.copied') : languageService.translate('settings.doh.copy') }}
                </button>
              </div>
            </div>
            <div class="flex justify-end">
              <button (click)="core.deactivateDohResolver()" class="bg-red-900/50 hover:bg-red-900/80 text-red-300 text-sm font-bold py-2 px-4 rounded transition-colors shadow-sm border border-red-800">
                {{ languageService.translate('settings.doh.deactivate') }}
              </button>
            </div>
          } @else {
            <form [formGroup]="dohForm" (ngSubmit)="activate()">
              <div>
                <label for="dohSubdomain" class="block text-gray-400 text-sm mb-1 uppercase font-bold" [attr.data-tooltip]="languageService.translate('tooltips.settings.dohSubdomain')">{{ languageService.translate('settings.doh.subdomain') }}</label>
                <div class="flex items-center gap-2">
                  <input id="dohSubdomain" formControlName="subdomain" type="text" class="bg-gray-800 border border-gray-600 rounded p-3 text-white focus:border-teal-500 outline-none w-32">
                  <span class="text-gray-500">.{{ core.customDomain() }}</span>
                </div>
              </div>
              <div class="mt-4 flex justify-end items-center gap-4">
                 <div class="flex items-center gap-2 text-sm">
                    @switch (core.dohStatus()) {
                      @case ('creating') {
                        <span class="w-3 h-3 rounded-full bg-yellow-500 animate-spin"></span> 
                        <span class="text-yellow-400">{{ languageService.translate('settings.doh.status.creating') }}</span>
                      }
                      @case ('failed') {
                        <span class="w-3 h-3 rounded-full bg-red-500"></span> 
                        <span class="text-red-400">{{ languageService.translate('settings.doh.status.failed') }}</span>
                      }
                      @default {
                        <span class="w-3 h-3 rounded-full bg-gray-500"></span> 
                        <span class="text-gray-400">{{ languageService.translate('settings.doh.status.inactive') }}</span>
                      }
                    }
                  </div>
                <button type="submit" [disabled]="dohForm.invalid || core.dohStatus() === 'creating' || !core.customDomain()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors shadow-lg disabled:opacity-50">
                  {{ core.dohStatus() === 'creating' ? languageService.translate('settings.doh.creatingButton') : languageService.translate('settings.doh.createButton') }}
                </button>
              </div>
            </form>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DohSettingsComponent implements OnInit {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);
  fb: FormBuilder = inject(FormBuilder);

  copied = signal(false);

  dohForm = this.fb.group({
    subdomain: ['dns', [Validators.required, Validators.pattern(/^[a-zA-Z0-9-]+$/)]]
  });

  ngOnInit(): void {
    this.dohForm.setValue({ subdomain: this.core.dohSubdomain() });
  }

  toggleDoh(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.core.isDohEnabled.set(true);
    } else {
      this.core.deactivateDohResolver();
    }
  }

  activate() {
    if (this.dohForm.valid) {
      const { subdomain } = this.dohForm.value;
      this.core.activateDohResolver(subdomain!);
    }
  }

  copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
    });
  }
}