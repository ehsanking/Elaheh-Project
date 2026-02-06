import { Component, inject, signal, ChangeDetectionStrategy, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../services/language.service';
import { LogoComponent } from './logo.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, LogoComponent],
  template: `
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 z-10 relative">
      @if (showClose) {
        <!-- Close button -->
        <button (click)="closeLogin.emit()" class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      }

      @switch (view()) {
        @case ('login') {
          <div>
            <div class="flex flex-col items-center mb-8">
              <div class="w-20 h-20 mb-4 text-teal-500 dark:text-teal-400">
                <app-logo></app-logo>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-wider mb-2">PROJECT ELAHEH</h1>
              <p class="text-teal-600 dark:text-teal-400 text-sm font-mono">{{ languageService.translate('login.title') }}</p>
            </div>
            <div class="space-y-4">
              @if (core.isDefaultAdminCredentials()) {
                <div class="text-amber-700 dark:text-amber-300 text-xs text-center bg-amber-100 dark:bg-amber-900/30 p-2 rounded border border-amber-200 dark:border-amber-800">
                  Default admin credentials are in use. Please change them after logging in.
                </div>
              }
              <div>
                <label class="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold mb-2">{{ languageService.translate('login.adminUser') }}</label>
                <input type="text" [(ngModel)]="username" 
                  class="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white focus:border-teal-500 dark:focus:border-teal-400 focus:ring-1 focus:ring-teal-500 dark:focus:ring-teal-400 outline-none transition-all placeholder-gray-500 dark:placeholder-gray-600"
                  [placeholder]="languageService.translate('login.placeholderUser')">
              </div>
              <div>
                <div class="flex justify-between items-center mb-2">
                  <label class="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">{{ languageService.translate('login.passphrase') }}</label>
                  <button (click)="setView('reset')" class="text-xs text-blue-500 dark:text-blue-400 hover:underline">{{ languageService.translate('login.forgotPassword.forgotLink') }}</button>
                </div>
                <input type="password" [(ngModel)]="password"
                  class="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white focus:border-teal-500 dark:focus:border-teal-400 focus:ring-1 focus:ring-teal-500 dark:focus:ring-teal-400 outline-none transition-all placeholder-gray-500 dark:placeholder-gray-600"
                  [placeholder]="languageService.translate('login.placeholderPass')">
              </div>

              <!-- CAPTCHA Section -->
              <div>
                <label class="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold mb-2">CAPTCHA</label>
                <div class="flex items-center gap-2 mb-2">
                  <canvas #captchaCanvas width="150" height="40" class="rounded-lg border border-gray-600 bg-gray-900"></canvas>
                  <button type="button" (click)="refreshCaptcha()" class="p-2 text-gray-400 hover:text-white bg-gray-700 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" /></svg>
                  </button>
                </div>
                <input type="text" [(ngModel)]="captchaInput" 
                  class="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white focus:border-teal-500 dark:focus:border-teal-400 focus:ring-1 focus:ring-teal-500 dark:focus:ring-teal-400 outline-none transition-all"
                  placeholder="Enter text from image">
              </div>

              @if (errorMsg()) {
                <div class="text-red-600 dark:text-red-400 text-sm text-center bg-red-100 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-900">
                  {{ errorMsg() }}
                </div>
              }
              <button (click)="attemptLogin()" 
                class="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-[1.02] transition-all">
                {{ languageService.translate('login.authenticate') }}
              </button>
            </div>
            <div class="mt-6 text-center text-xs text-gray-400 dark:text-gray-600 font-mono">
              System ID: EL-TUNNEL-V4 (Auto-Discovery)<br>
              {{ languageService.translate('login.statusLabel') }}: ENCRYPTED
            </div>
          </div>
        }
        @case ('reset') {
          <div>
            <h2 class="text-2xl font-bold text-center text-white mb-2">{{ languageService.translate('login.forgotPassword.title') }}</h2>
            <p class="text-center text-gray-400 text-sm mb-6">{{ languageService.translate('login.forgotPassword.description') }}</p>
            <div class="space-y-6">
              <div>
                <label class="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold mb-2">Email</label>
                <input type="email" [(ngModel)]="resetEmail" 
                  class="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white focus:border-teal-500 dark:focus:border-teal-400 focus:ring-1 focus:ring-teal-500 dark:focus:ring-teal-400 outline-none transition-all"
                  placeholder="admin@example.com">
              </div>
              <button (click)="requestPasswordReset()" [disabled]="!resetEmail()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all disabled:opacity-50">
                {{ languageService.translate('login.forgotPassword.sendButton') }}
              </button>
            </div>
            <div class="mt-6 text-center">
              <button (click)="setView('login')" class="text-sm text-gray-400 hover:underline">{{ languageService.translate('login.forgotPassword.backToLogin') }}</button>
            </div>
          </div>
        }
        @case ('reset_sent') {
          <div class="text-center py-8">
            <div class="w-16 h-16 bg-green-900/50 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 class="text-xl font-bold text-white mb-2">{{ languageService.translate('login.forgotPassword.successTitle') }}</h2>
            <p class="text-gray-400 text-sm mb-6">{{ languageService.translate('login.forgotPassword.successMessage') }}</p>
            <button (click)="setView('login')" class="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition-colors">
              {{ languageService.translate('login.forgotPassword.backToLogin') }}
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements AfterViewInit {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);
  
  username = signal('');
  password = signal('');
  captchaInput = signal('');
  errorMsg = signal('');
  resetEmail = signal('');

  view = signal<'login' | 'reset' | 'reset_sent'>('login');

  @Output() closeLogin = new EventEmitter<void>();
  @Input() showClose = false;

  @ViewChild('captchaCanvas') captchaCanvas!: ElementRef<HTMLCanvasElement>;
  private captchaText = '';

  ngAfterViewInit(): void {
    if (this.view() === 'login') {
      setTimeout(() => this.refreshCaptcha(), 0);
    }
  }

  private generateCaptchaText(length = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous characters
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  refreshCaptcha(): void {
    if (!this.captchaCanvas) return;
    this.captchaText = this.generateCaptchaText();
    const canvas = this.captchaCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1f2937'; // bg-gray-800
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text with distortion
    const textChars = this.captchaText.split('');
    const charWidth = canvas.width / (textChars.length + 1);
    textChars.forEach((char, i) => {
      ctx.font = `${Math.random() * 10 + 25}px "Courier New", monospace`;
      ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 70%)`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const x = charWidth * (i + 1);
      const y = canvas.height / 2 + (Math.random() * 10 - 5);
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(char, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    });

    // Add noise lines
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.strokeStyle = `rgba(107, 114, 128, 0.3)`; // gray-500
      ctx.stroke();
    }
  }

  attemptLogin() {
    if (this.captchaInput().toUpperCase() !== this.captchaText.toUpperCase()) {
      this.errorMsg.set('Invalid CAPTCHA.');
      this.refreshCaptcha();
      this.captchaInput.set('');
      return;
    }

    const success = this.core.login(this.username(), this.password());
    if (!success) {
      this.errorMsg.set(this.languageService.translate('login.error'));
      this.password.set('');
      this.captchaInput.set('');
      this.refreshCaptcha();
    }
  }

  setView(newView: 'login' | 'reset' | 'reset_sent') {
    this.errorMsg.set('');
    this.password.set('');
    if (newView === 'login') {
      this.resetEmail.set('');
    }
    this.view.set(newView);
  }

  requestPasswordReset() {
    if (this.resetEmail()) {
      this.core.addLog('INFO', `Password reset requested for email: ${this.resetEmail()}`);
      this.setView('reset_sent');
    }
  }
}
