
import { Component, inject, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElahehCoreService, GameProfile } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-application-camouflage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-gray-900/50 p-6 rounded-lg border border-gray-700 mt-8">
      <div class="border-b border-gray-700 pb-2 mb-4">
          <h3 class="text-lg font-bold text-gray-200">{{ languageService.translate('settings.appCamouflage.title') }}</h3>
          <p class="text-sm text-gray-400 mt-1">{{ languageService.translate('settings.appCamouflage.description') }}</p>
      </div>

      <div class="flex items-center mb-6">
        <label for="app-camo-toggle" class="relative inline-flex items-center cursor-pointer" [attr.data-tooltip]="languageService.translate('tooltips.settings.appCamoEnable')">
          <input type="checkbox" id="app-camo-toggle" class="sr-only peer" 
                 [checked]="core.applicationCamouflageEnabled()"
                 (change)="setEnabled($event)">
          <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          <span class="ml-3 text-sm font-medium text-gray-300">{{ languageService.translate('settings.appCamouflage.enable') }}</span>
        </label>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6" [class.opacity-50]="!core.applicationCamouflageEnabled()" [class.pointer-events-none]="!core.applicationCamouflageEnabled()">
        <!-- Profile Selection -->
        <div>
          <label class="block text-gray-400 text-sm mb-2 font-bold" [attr.data-tooltip]="languageService.translate('tooltips.settings.appCamoProfile')">{{ languageService.translate('settings.appCamouflage.profile') }}</label>
          <div class="space-y-2">
            
            <button type="button" (click)="setProfile('COD_MOBILE')" class="w-full flex items-center p-3 rounded-lg border cursor-pointer transition-all"
              [class.border-teal-500]="core.applicationCamouflageProfile() === 'COD_MOBILE'"
              [class.bg-teal-900/20]="core.applicationCamouflageProfile() === 'COD_MOBILE'"
              [class.border-gray-700]="core.applicationCamouflageProfile() !== 'COD_MOBILE'">
              <span class="text-2xl mr-3">🔫</span>
              <div class="text-left rtl:text-right">
                <div class="text-sm text-gray-200 font-bold">{{ languageService.translate('settings.appCamouflage.codm') }}</div>
                <div class="text-xs text-gray-500">{{ languageService.translate('settings.appCamouflage.codmDesc') }}</div>
              </div>
            </button>

            <button type="button" (click)="setProfile('PUBG')" class="w-full flex items-center p-3 rounded-lg border cursor-pointer transition-all"
              [class.border-teal-500]="core.applicationCamouflageProfile() === 'PUBG'"
              [class.bg-teal-900/20]="core.applicationCamouflageProfile() === 'PUBG'"
              [class.border-gray-700]="core.applicationCamouflageProfile() !== 'PUBG'">
              <span class="text-2xl mr-3">🍳</span>
              <div class="text-left rtl:text-right">
                <div class="text-sm text-gray-200 font-bold">{{ languageService.translate('settings.appCamouflage.pubg') }}</div>
                <div class="text-xs text-gray-500">{{ languageService.translate('settings.appCamouflage.pubgDesc') }}</div>
              </div>
            </button>

             <button type="button" (click)="setProfile('CLASH_ROYALE')" class="w-full flex items-center p-3 rounded-lg border cursor-pointer transition-all"
              [class.border-teal-500]="core.applicationCamouflageProfile() === 'CLASH_ROYALE'"
              [class.bg-teal-900/20]="core.applicationCamouflageProfile() === 'CLASH_ROYALE'"
              [class.border-gray-700]="core.applicationCamouflageProfile() !== 'CLASH_ROYALE'">
              <span class="text-2xl mr-3">👑</span>
              <div class="text-left rtl:text-right">
                <div class="text-sm text-gray-200 font-bold">{{ languageService.translate('settings.appCamouflage.clash') }}</div>
                <div class="text-xs text-gray-500">{{ languageService.translate('settings.appCamouflage.clashDesc') }}</div>
              </div>
            </button>

             <button type="button" (click)="setProfile('MMORPG')" class="w-full flex items-center p-3 rounded-lg border cursor-pointer transition-all"
              [class.border-teal-500]="core.applicationCamouflageProfile() === 'MMORPG'"
              [class.bg-teal-900/20]="core.applicationCamouflageProfile() === 'MMORPG'"
              [class.border-gray-700]="core.applicationCamouflageProfile() !== 'MMORPG'">
              <span class="text-2xl mr-3">🐲</span>
              <div class="text-left rtl:text-right">
                <div class="text-sm text-gray-200 font-bold">{{ languageService.translate('settings.appCamouflage.mmorpg') }}</div>
                <div class="text-xs text-gray-500">{{ languageService.translate('settings.appCamouflage.mmorpgDesc') }}</div>
              </div>
            </button>

          </div>
        </div>

        <!-- Status -->
        <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 h-fit">
            <h4 class="text-gray-400 text-sm font-bold mb-2">{{ languageService.translate('settings.appCamouflage.liveStatus') }}</h4>
            <div class="font-mono text-sm">
                @if (core.applicationCamouflageStatus() === 'Idle' || !core.applicationCamouflageEnabled()) {
                    <div class="flex items-center gap-2 text-gray-500">
                        <span class="w-3 h-3 rounded-full bg-gray-600"></span>
                        <span>{{ languageService.translate('dashboard.camouflage.idle') }}</span>
                    </div>
                } @else {
                    <div class="flex items-center gap-2 text-yellow-400 animate-pulse">
                        <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span>{{ core.applicationCamouflageStatus() }}...</span>
                    </div>
                }
            </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationCamouflageComponent implements OnInit, OnDestroy {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);

  private statusInterval: any;

  ngOnInit(): void {
    this.statusInterval = setInterval(() => {
      if (this.core.applicationCamouflageEnabled()) {
        const statuses = [
          'Processing (AI)', 
          'Processing (Data Sync)', 
          'Processing (Media)', 
          'Idle', 
          'Idle',
          'Idle'
        ];
        const randomIndex = Math.floor(Math.random() * statuses.length);
        this.core.applicationCamouflageStatus.set(statuses[randomIndex]);
      } else {
        if (this.core.applicationCamouflageStatus() !== 'Idle') {
          this.core.applicationCamouflageStatus.set('Idle');
        }
      }
    }, 4500);
  }

  ngOnDestroy(): void {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
  }

  setEnabled(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const currentProfile = this.core.applicationCamouflageProfile();
    
    if (isChecked && !currentProfile) {
      this.core.updateApplicationCamouflage(true, 'COD_MOBILE');
    } else {
      this.core.updateApplicationCamouflage(isChecked, currentProfile);
    }

    if (!isChecked) {
        this.core.applicationCamouflageStatus.set('Idle');
    }
  }

  setProfile(profile: GameProfile) {
    if (this.core.applicationCamouflageEnabled()) {
      this.core.updateApplicationCamouflage(true, profile);
    }
  }
}
