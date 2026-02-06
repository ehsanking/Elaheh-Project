
import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-tls-camouflage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-gray-900/50 p-6 rounded-lg border border-gray-700 mt-8">
      <div class="border-b border-gray-700 pb-2 mb-4">
          <h3 class="text-lg font-bold text-gray-200">{{ languageService.translate('settings.tlsCamouflage.title') }}</h3>
          <p class="text-sm text-gray-400 mt-1">{{ languageService.translate('settings.tlsCamouflage.description') }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <!-- Configuration -->
        <div class="space-y-6">
          <label for="tls-camo-toggle" class="relative inline-flex items-center cursor-pointer" [attr.data-tooltip]="languageService.translate('tooltips.settings.tlsCamouflageEnable')">
            <input type="checkbox" id="tls-camo-toggle" class="sr-only peer" 
                   [checked]="core.tlsCamouflageEnabled()"
                   (change)="setEnabled($event)">
            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            <span class="ml-3 text-sm font-medium text-gray-300">{{ languageService.translate('settings.tlsCamouflage.enable') }}</span>
          </label>
          
          <div [class.opacity-50]="!core.tlsCamouflageEnabled()" [class.pointer-events-none]="!core.tlsCamouflageEnabled()">
            <label class="block text-gray-400 text-sm mb-2 font-bold" [attr.data-tooltip]="languageService.translate('tooltips.settings.tlsCamouflageSni')">{{ languageService.translate('settings.tlsCamouflage.targetSni') }}</label>
            <input type="text" [(ngModel)]="sniInput" class="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white focus:border-teal-500 outline-none transition-colors" placeholder="www.google.com">
            
            <div class="mt-3">
              <p class="text-xs text-gray-500 mb-2">{{ languageService.translate('settings.tlsCamouflage.presets') }}</p>
              <div class="flex flex-wrap gap-2">
                <button (click)="setSni('www.google.com')" class="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full">Google</button>
                <button (click)="setSni('www.bing.com')" class="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full">Bing</button>
                <button (click)="setSni('www.apple.com')" class="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full">Apple</button>
                <button (click)="setSni('cdn.microsoft.com')" class="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full">Microsoft</button>
              </div>
            </div>
            
            <button (click)="applyChanges()" class="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded transition-colors shadow-lg">
                {{ languageService.translate('common.saveChanges') }}
            </button>
          </div>
        </div>

        <!-- Status -->
        <div class="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 class="text-gray-400 text-sm font-bold mb-2">{{ languageService.translate('settings.tlsCamouflage.liveStatus') }}</h4>
            <div class="font-mono text-sm">
                @switch (core.tlsCamouflageStatus()) {
                  @case('active') {
                    <div class="flex items-center gap-2 text-green-400">
                        <span class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                        <span>{{ languageService.translate('common.active') }}</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-2">
                      SNI: <span class="text-gray-400">{{ core.tlsCamouflageSni() }}</span>
                    </div>
                  }
                  @case('inactive') {
                    <div class="flex items-center gap-2 text-gray-500">
                        <span class="w-3 h-3 rounded-full bg-gray-600"></span>
                        <span>Inactive</span>
                    </div>
                  }
                  @case('error') {
                     <div class="flex items-center gap-2 text-red-400">
                        <span class="w-3 h-3 rounded-full bg-red-500"></span>
                        <span>Error</span>
                    </div>
                     <div class="text-xs text-red-400 mt-2">Invalid SNI.</div>
                  }
                }
            </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TlsCamouflageComponent implements OnInit {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);
  
  sniInput = signal('');

  ngOnInit(): void {
    this.sniInput.set(this.core.tlsCamouflageSni());
  }

  setEnabled(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (!isChecked) {
      // If user unchecks, immediately disable it
      this.core.updateTlsCamouflage(false, this.sniInput());
    } else {
      // If user checks, enable it, but don't save SNI until they click "Apply"
      this.core.tlsCamouflageEnabled.set(true);
    }
  }
  
  setSni(preset: string) {
    this.sniInput.set(preset);
  }

  applyChanges() {
    // This button applies changes only if the toggle is on.
    // If toggle is off, it's already been handled by setEnabled.
    if (this.core.tlsCamouflageEnabled()) {
        this.core.updateTlsCamouflage(true, this.sniInput());
    }
  }
}
