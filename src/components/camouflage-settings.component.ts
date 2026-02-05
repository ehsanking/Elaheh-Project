
import { Component, inject, computed, ChangeDetectionStrategy, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElahehCoreService, CamouflageProfile } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-camouflage-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-gray-900/50 p-6 rounded-lg border border-gray-700 mt-8">
      <div class="border-b border-gray-700 pb-2 mb-4">
          <h3 class="text-lg font-bold text-gray-200">{{ languageService.translate('settings.camouflage.title') }}</h3>
          <p class="text-sm text-gray-400 mt-1">{{ languageService.translate('settings.camouflage.description') }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Profile Selection -->
        <div>
          <label class="block text-gray-400 text-sm mb-2 font-bold" [attr.data-tooltip]="languageService.translate('tooltips.settings.camouflageProfile')">{{ languageService.translate('settings.camouflage.profile') }}</label>
          <div class="space-y-2">
            <div>
              <label class="flex items-center p-3 rounded-lg border cursor-pointer transition-all"
                [ngClass]="{
                  'border-teal-500 bg-teal-900/20': core.camouflageProfile() === 'AI_TRAINING',
                  'border-gray-700': core.camouflageProfile() !== 'AI_TRAINING'
                }">
                <input type="radio" name="camouflageProfile" value="AI_TRAINING" 
                       [ngModel]="core.camouflageProfile()"
                       (ngModelChange)="setProfile($event)"
                       class="sr-only">
                <span class="text-2xl mr-3">🧠</span>
                <span class="text-sm text-gray-200">{{ languageService.translate('settings.camouflage.profileDesc.ai') }}</span>
              </label>
            </div>
             <div>
              <label class="flex items-center p-3 rounded-lg border cursor-pointer transition-all"
                [ngClass]="{
                  'border-teal-500 bg-teal-900/20': core.camouflageProfile() === 'DATA_SYNC',
                  'border-gray-700': core.camouflageProfile() !== 'DATA_SYNC'
                }">
                <input type="radio" name="camouflageProfile" value="DATA_SYNC" 
                       [ngModel]="core.camouflageProfile()"
                       (ngModelChange)="setProfile($event)"
                       class="sr-only">
                <span class="text-2xl mr-3">🔄</span>
                <span class="text-sm text-gray-200">{{ languageService.translate('settings.camouflage.profileDesc.data') }}</span>
              </label>
            </div>
             <div>
              <label class="flex items-center p-3 rounded-lg border cursor-pointer transition-all"
                [ngClass]="{
                  'border-teal-500 bg-teal-900/20': core.camouflageProfile() === 'MEDIA_FETCH',
                  'border-gray-700': core.camouflageProfile() !== 'MEDIA_FETCH'
                }">
                <input type="radio" name="camouflageProfile" value="MEDIA_FETCH"
                       [ngModel]="core.camouflageProfile()"
                       (ngModelChange)="setProfile($event)"
                       class="sr-only">
                <span class="text-2xl mr-3">🎬</span>
                <span class="text-sm text-gray-200">{{ languageService.translate('settings.camouflage.profileDesc.media') }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Frequency & Status -->
        <div class="space-y-6">
          <div>
            <label class="block text-gray-400 text-sm mb-2 font-bold" [attr.data-tooltip]="languageService.translate('tooltips.settings.camouflageFrequency')">{{ languageService.translate('settings.camouflage.frequency') }}</label>
            <input type="range" min="0" max="100" 
              [ngModel]="core.camouflageFrequency()"
              (ngModelChange)="setFrequency($event)"
              class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer">
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>{{ languageService.translate('settings.camouflage.lessFrequent') }}</span>
              <span>{{ languageService.translate('settings.camouflage.moreFrequent') }}</span>
            </div>
          </div>

          <div class="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 class="text-gray-400 text-sm font-bold mb-2">{{ languageService.translate('settings.camouflage.status') }}</h4>
            <div class="font-mono text-sm">
                @if (core.camouflageJobStatus() === 'IDLE') {
                    <div class="flex items-center gap-2 text-green-400">
                        <span class="w-3 h-3 rounded-full bg-green-500"></span>
                        <span>{{ languageService.translate('dashboard.camouflage.idle') }}</span>
                    </div>
                } @else {
                    <div class="flex items-center gap-2 text-yellow-400 animate-pulse">
                        <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span>{{ languageService.translate('dashboard.camouflage.running') }}</span>
                    </div>
                }
                <div class="text-xs text-gray-500 mt-2">
                    {{ languageService.translate('dashboard.camouflage.lastRun') }}: <span class="text-gray-400">{{ lastRun() }}</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CamouflageSettingsComponent implements OnInit, OnDestroy {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);

  private timer = signal(Date.now());
  private timerInterval: any;

  ngOnInit(): void {
    this.timerInterval = setInterval(() => this.timer.set(Date.now()), 1000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  lastRun = computed(() => {
    this.timer();
    const lastUpdate = this.core.lastCamouflageUpdate();
    if (!lastUpdate) {
      return this.languageService.translate('dashboard.camouflage.never');
    }
    const now = this.timer();
    const seconds = Math.round((now - lastUpdate.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  });

  setProfile(profile: CamouflageProfile) {
    this.core.camouflageProfile.set(profile);
  }

  setFrequency(value: number) {
    this.core.camouflageFrequency.set(value);
  }
}
