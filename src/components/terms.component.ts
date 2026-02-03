import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 flex flex-col max-h-[90vh]">
            <div class="p-6 border-b border-gray-700 flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ languageService.translate('terms.title') }}</h2>
                <button (click)="close.emit()" class="text-gray-500 hover:text-white text-2xl">×</button>
            </div>
            
            <div class="p-6 overflow-y-auto text-gray-700 dark:text-gray-300 text-sm leading-relaxed space-y-4 text-justify" [dir]="languageService.currentLang() === 'fa' ? 'rtl' : 'ltr'">
                <p class="font-bold">{{ languageService.translate('terms.intro') }}</p>
                
                <div class="bg-red-900/20 border border-red-800 p-4 rounded text-red-200">
                    {{ languageService.translate('terms.law1') }}
                </div>

                <p>{{ languageService.translate('terms.law2') }}</p>
                <p>{{ languageService.translate('terms.law3') }}</p>
                <p>{{ languageService.translate('terms.law4') }}</p>
                
                <div class="mt-6 p-4 bg-gray-900 rounded border border-gray-700 text-xs text-gray-400">
                    <p>Compliance: ISO 27001 (Information Security), ISO 9001 (Quality Management)</p>
                    <p>Operating under the regulations of the Supreme Council of Cyberspace (I.R. Iran).</p>
                </div>
            </div>

            <div class="p-6 border-t border-gray-700 flex justify-end">
                <button (click)="close.emit()" class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-8 rounded transition-colors">
                    {{ languageService.translate('terms.accept') }}
                </button>
            </div>
        </div>
    </div>
  `
})
export class TermsComponent {
    languageService = inject(LanguageService);
    @Output() close = new EventEmitter<void>();
}