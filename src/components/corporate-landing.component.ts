import { Component, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoComponent } from './logo.component';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-corporate-landing',
  standalone: true,
  imports: [CommonModule, LogoComponent],
  template: `
    <div class="min-h-screen bg-gray-900 text-white flex flex-col font-sans" [dir]="languageService.currentLang() === 'fa' ? 'rtl' : 'ltr'">
      <!-- Header -->
      <header class="absolute top-0 left-0 right-0 z-20">
        <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 text-teal-400"><app-logo></app-logo></div>
            <span class="text-xl font-bold tracking-tight">ELAHEH AI</span>
          </div>
          <button (click)="loginRequest.emit()" class="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-sm font-bold py-2 px-6 rounded-lg border border-white/20 transition-colors">
            Client Portal
          </button>
        </nav>
      </header>

      <!-- Main Content -->
      <main class="flex-1 flex items-center justify-center text-center relative">
        <!-- Background Grid -->
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] opacity-[0.02]"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>

        <div class="z-10 p-6">
          <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
            Decentralized AI Infrastructure
          </h1>
          <h2 class="text-lg md:text-xl font-light text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-8">
            Global Edge Computing • Powered by Hetzner Cloud
          </h2>
          <p class="max-w-2xl mx-auto text-gray-400 mb-10">
            We provide robust, scalable, and secure cloud solutions for next-generation AI applications, leveraging a global network of high-performance nodes from our partners in Singapore and Germany.
          </p>
          <button (click)="loginRequest.emit()" class="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-4 px-10 rounded-lg shadow-lg transform hover:scale-105 transition-all">
            Access Your Services
          </button>
        </div>
      </main>

      <!-- Footer -->
      <footer class="bg-transparent text-center p-6 text-xs text-gray-600 z-10">
        <p>&copy; 2024 Elaheh AI Solutions, Singapore. Partnered with Hetzner Online GmbH.</p>
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorporateLandingComponent {
  @Output() loginRequest = new EventEmitter<void>();
  languageService = inject(LanguageService);
}
