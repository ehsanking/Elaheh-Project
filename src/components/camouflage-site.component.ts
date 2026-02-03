import { Component, inject, signal, computed, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';
import { CommonModule } from '@angular/common';
import { LogoComponent } from './logo.component';

@Component({
  selector: 'app-camouflage-site',
  standalone: true,
  imports: [CommonModule, LogoComponent],
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <header class="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 sticky top-0 z-20">
        <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 text-teal-400">
              <app-logo></app-logo>
            </div>
            <span class="text-lg font-bold tracking-tight text-white">{{ languageService.translate('camouflageSite.title') }}</span>
          </div>
          <div class="hidden md:flex items-center gap-6">
            <a href="#" class="text-gray-300 hover:text-teal-400 transition-colors">{{ languageService.translate('camouflageSite.navHome') }}</a>
            <a href="#" class="text-gray-300 hover:text-teal-400 transition-colors">{{ languageService.translate('camouflageSite.navApi') }}</a>
            <a href="#" class="text-gray-300 hover:text-teal-400 transition-colors">{{ languageService.translate('camouflageSite.navContact') }}</a>
          </div>
          <div class="flex items-center gap-4">
            <div class="relative">
              <button (click)="showLangDropdown.set(!showLangDropdown())" class="flex items-center gap-2 text-sm text-gray-300 hover:text-white bg-black/30 px-3 py-1.5 rounded border border-gray-700"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3"></path></svg><span>{{ languageService.getCurrentLanguageName() }}</span><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button>
              @if(showLangDropdown()) {
                <div class="fixed inset-0 z-20" (click)="showLangDropdown.set(false)"></div>
                <div class="absolute top-full right-0 mt-2 w-36 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-30">
                  <button (click)="setLanguage('en')" class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2">🇬🇧 English</button>
                  <button (click)="setLanguage('fa')" class="w-full text-left rtl:text-right px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2">🇮🇷 فارسی</button>
                  <button (click)="setLanguage('zh')" class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2">🇨🇳 中文</button>
                  <button (click)="setLanguage('ru')" class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2">🇷🇺 Русский</button>
                </div>
              }
            </div>
            <button (click)="loginRequest.emit()" class="text-sm font-medium text-gray-300 hover:text-white bg-black/30 px-4 py-1.5 rounded border border-gray-700">{{ languageService.translate('camouflageSite.login') }}</button>
            <button (click)="signupRequest.emit()" class="text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 px-4 py-1.5 rounded">{{ languageService.translate('camouflageSite.signup') }}</button>
          </div>
        </nav>
      </header>
      <main class="flex-1 container mx-auto px-6 py-16 text-center flex flex-col items-center justify-center">
        <h1 class="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">Pioneering the Future of <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Language AI</span></h1>
        <div class="text-sm font-mono p-2 rounded bg-gray-800 border border-gray-700 text-gray-400 mb-6 inline-flex items-center gap-2"><span class="font-bold text-gray-300">{{ languageService.translate('camouflageSite.status') }}:</span><span class="animate-pulse">{{ statusMessage() }}</span></div>
        <p class="text-lg text-gray-400 max-w-3xl mx-auto mb-8">{{ core.camouflageContent() }}</p>
        <button (click)="signupRequest.emit()" class="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">{{ languageService.translate('camouflageSite.getStarted') }}</button>
      </main>
      <footer class="bg-gray-800 border-t border-gray-700 mt-auto"><div class="container mx-auto px-6 py-4 text-center text-gray-500 text-sm">{{ languageService.translate('camouflageSite.footer') }}</div></footer>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CamouflageSiteComponent {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);
  showLangDropdown = signal(false);

  @Output() loginRequest = new EventEmitter<void>();
  @Output() signupRequest = new EventEmitter<void>();

  statusMessage = computed(() => {
    if (this.core.camouflageJobStatus() === 'IDLE') {
        return this.languageService.translate('camouflageSite.statusIdle');
    }
    switch (this.core.camouflageProfile()) {
        case 'AI_TRAINING': return this.languageService.translate('camouflageSite.statusRunningAI');
        case 'DATA_SYNC': return this.languageService.translate('camouflageSite.statusRunningData');
        case 'MEDIA_FETCH': return this.languageService.translate('camouflageSite.statusRunningMedia');
        default: return 'Processing...';
    }
  });

  setLanguage(lang: 'en' | 'fa' | 'zh' | 'ru'): void {
    this.languageService.setLanguage(lang);
    this.showLangDropdown.set(false);
  }
}