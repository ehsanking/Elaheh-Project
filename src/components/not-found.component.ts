import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
        <h1 class="text-6xl font-bold text-teal-500 mb-4">404</h1>
        <h2 class="text-2xl font-bold mb-4">{{ languageService.translate('notFound.title') }}</h2>
        <p class="text-gray-400 mb-8">{{ languageService.translate('notFound.desc') }}</p>
        <button (click)="goHome.emit()" class="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded border border-gray-700 transition-colors">
            {{ languageService.translate('notFound.home') }}
        </button>
    </div>
  `
})
export class NotFoundComponent {
    languageService = inject(LanguageService);
    @Output() goHome = new EventEmitter<void>();
}
