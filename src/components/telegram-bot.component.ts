
import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ElahehCoreService, TelegramBotConfig } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-telegram-bot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-gray-900/50 p-6 rounded-lg border border-indigo-500/30">
        <div class="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
            <svg class="w-7 h-7 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.64 12c-.88-.25-.89-1.37.2-1.64l16.4-5.99c.78-.26 1.45.16 1.18 1.31l-3.35 15.64c-.24.87-1.01 1.08-1.74.54l-4.71-3.41l-2.22 2.15c-.21.21-.4.32-.67.32z"/></svg>
            <div>
                <h3 class="text-lg font-bold text-gray-200">{{ languageService.translate('settings.telegram.title') }}</h3>
                <p class="text-sm text-gray-400">{{ languageService.translate('settings.telegram.description') }}</p>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Form -->
            <form [formGroup]="botForm" (ngSubmit)="saveSettings()" class="space-y-6">
                <div>
                    <label class="block text-gray-400 text-xs uppercase font-bold mb-2">{{ languageService.translate('settings.telegram.token') }}</label>
                    <input formControlName="token" type="password" class="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white text-sm focus:border-indigo-500 outline-none font-mono" placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11">
                </div>

                <div>
                    <label class="block text-gray-400 text-xs uppercase font-bold mb-2">{{ languageService.translate('settings.telegram.adminId') }}</label>
                    <input formControlName="adminChatId" type="text" class="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white text-sm focus:border-indigo-500 outline-none" placeholder="123456789">
                </div>

                <div class="space-y-4">
                    <label class="flex items-center cursor-pointer group">
                        <div class="relative">
                            <input type="checkbox" formControlName="isEnabled" class="sr-only peer">
                            <div class="w-10 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                        <span class="ml-3 text-sm text-gray-300 group-hover:text-white transition-colors">{{ languageService.translate('settings.telegram.enableBot') }}</span>
                    </label>

                     <label class="flex items-center cursor-pointer group">
                        <div class="relative">
                            <input type="checkbox" formControlName="proxyEnabled" class="sr-only peer">
                            <div class="w-10 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                        <span class="ml-3 text-sm text-gray-300 group-hover:text-white transition-colors">{{ languageService.translate('settings.telegram.enableProxy') }}</span>
                     </label>
                </div>
                
                <div class="pt-4 border-t border-gray-700 flex justify-between items-center">
                    <button type="button" (click)="testConnection()" [disabled]="botForm.invalid || isTesting()" class="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded text-sm transition-colors border border-gray-600">
                        {{ isTesting() ? languageService.translate('settings.telegram.testing') : languageService.translate('settings.telegram.test') }}
                    </button>
                    <button type="submit" [disabled]="botForm.invalid" class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded text-sm transition-colors">
                        {{ languageService.translate('common.saveChanges') }}
                    </button>
                </div>

                @if(testStatus() !== 'idle') {
                    <div class="p-3 rounded text-sm text-center"
                         [class.bg-green-900]="testStatus() === 'success'" [class.text-green-300]="testStatus() === 'success'"
                         [class.bg-red-900]="testStatus() === 'failed'" [class.text-red-300]="testStatus() === 'failed'">
                         {{ testStatus() === 'success' ? languageService.translate('settings.telegram.testSuccess') : languageService.translate('settings.telegram.testFail') }}
                    </div>
                }
            </form>
            
            <!-- Instructions -->
            <div class="bg-black/20 p-4 rounded-xl border border-gray-700 space-y-4 text-xs text-gray-400">
                <h4 class="font-bold text-gray-200">{{ languageService.translate('settings.telegram.instructionsTitle') }}</h4>
                <p [innerHTML]="languageService.translate('settings.telegram.instructions1')"></p>
                <p [innerHTML]="languageService.translate('settings.telegram.instructions2')"></p>
                @if(core.serverRole() === 'iran') {
                    <div class="p-3 rounded border border-yellow-700 bg-yellow-900/30 text-yellow-300">
                        <p class="font-bold">{{ languageService.translate('settings.telegram.proxyNoteTitle') }}</p>
                        <p class="text-xs mt-1">{{ languageService.translate('settings.telegram.proxyNote') }}</p>
                    </div>
                }
            </div>
        </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TelegramBotComponent implements OnInit {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);
  fb: FormBuilder = inject(FormBuilder);
  
  isTesting = signal(false);
  testStatus = signal<'idle' | 'success' | 'failed'>('idle');

  botForm = this.fb.nonNullable.group({
    token: ['', Validators.required],
    adminChatId: ['', Validators.required],
    isEnabled: [false],
    proxyEnabled: [true]
  });

  ngOnInit() {
    this.botForm.patchValue(this.core.telegramBotConfig());
  }

  async testConnection() {
    if (this.botForm.invalid) return;
    this.isTesting.set(true);
    this.testStatus.set('idle');
    
    const config = this.botForm.getRawValue();
    
    const success = await this.core.testTelegramBot(config);

    this.testStatus.set(success ? 'success' : 'failed');
    this.isTesting.set(false);
    setTimeout(() => this.testStatus.set('idle'), 4000);
  }

  saveSettings() {
    if (this.botForm.valid) {
        const config = this.botForm.getRawValue();
        this.core.updateTelegramBotConfig(config);
        this.core.addLog('SUCCESS', '[Telegram] Bot settings saved.');
    }
  }
}
