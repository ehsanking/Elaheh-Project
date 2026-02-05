
import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-two-factor-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-gray-900/50 p-6 rounded-lg border border-red-500/30">
        <div class="flex items-center gap-3 mb-4 border-b border-gray-700 pb-4">
            <svg class="w-6 h-6 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5.023L2.352 5.093c.124.044.223.13.284.244l.056.103c.08.15.123.314.123.483 0 .15-.038.29-.11.41a.539.539 0 01-.22.253l-.089.049a12.025 12.025 0 01-2.062 1.342c-.044.028-.09.053-.137.076a.538.538 0 01-.284.053l-.103-.004A12.032 12.032 0 010 10a11.954 11.954 0 012.166 4.977l.187.07c.124.044.223.13.284.244l.056.103a.539.539 0 01.123.483c0 .15-.038.29-.11.41a.539.539 0 01-.22.253l-.089.049a12.025 12.025 0 01-2.062 1.342c-.044.028-.09.053-.137.076a.538.538 0 01-.284.053l-.103-.004A12.032 12.032 0 010 10c0 6.627 5.373 12 12 12s12-5.373 12-12S18.627 0 12 0C7.79 0 4.155 1.705 1.944 4.532A.538.538 0 011.8 4.252l-.089-.049a.539.539 0 01-.22-.253c-.072-.12-.11-.26-.11-.41a.538.538 0 01.123-.483l.056-.103a.538.538 0 01.284-.244L2.093 2.6c.047-.023.093-.048.137-.076A12.025 12.025 0 014.29 1.182l.089-.049a.539.539 0 01.22-.253c.072-.12.11-.26.11-.41a.538.538 0 01-.123-.483l-.056-.103a.538.538 0 01-.284-.244L4.234.187A11.954 11.954 0 0110 0a12 12 0 0110 10c0 6.627-5.373 12-12 12S0 16.627 0 10a12.032 12.032 0 01.766-4.032l.103.004a.538.538 0 01.284-.053c.047-.023.093-.048.137-.076a12.025 12.025 0 012.062-1.342l.089-.049a.539.539 0 01.22-.253c.072-.12.11-.26.11-.41a.538.538 0 01-.123-.483l-.056-.103a.538.538 0 01-.284-.244L3.066 2.352A11.954 11.954 0 0110 1.944zM12 2a8 8 0 100 16 8 8 0 000-16zM6 10a4 4 0 118 0 4 4 0 01-8 0z" clip-rule="evenodd" />
            </svg>
            <div>
                <h3 class="text-lg font-bold text-gray-200">{{ languageService.translate('settings.security.tfa.title') }}</h3>
                <p class="text-sm text-gray-400">{{ languageService.translate('settings.security.tfa.description') }}</p>
            </div>
        </div>

        @if(core.is2faEnabled()) {
            <div class="text-center p-6 bg-black/30 rounded-lg">
                <p class="text-green-400 font-bold mb-4">2FA is currently ACTIVE.</p>
                <button (click)="disable2FA()" class="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-6 rounded text-sm transition-colors">
                    {{ languageService.translate('settings.security.tfa.disable') }}
                </button>
            </div>
        } @else {
            <div class="flex items-center justify-center mb-6">
                <button (click)="startSetup()" [disabled]="setupStep() !== 'idle'" class="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded text-sm transition-colors">
                    {{ languageService.translate('settings.security.tfa.enable') }}
                </button>
            </div>

            @if(setupStep() !== 'idle') {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-700">
                    <!-- QR Code and Manual Key -->
                    <div class="space-y-4">
                        <div>
                            <h4 class="font-bold text-gray-300">{{ languageService.translate('settings.security.tfa.step1') }}</h4>
                            <p class="text-xs text-gray-500 mb-2">{{ languageService.translate('settings.security.tfa.step1Desc') }}</p>
                            <div class="bg-white p-2 rounded-lg inline-block">
                                <img [src]="qrCodeUrl()" alt="QR Code" class="w-40 h-40">
                            </div>
                        </div>
                         <div>
                            <h4 class="font-bold text-gray-300">{{ languageService.translate('settings.security.tfa.step2') }}</h4>
                            <p class="text-xs text-gray-500 mb-2">{{ languageService.translate('settings.security.tfa.step2Desc') }}</p>
                            <div class="bg-black/50 p-2 rounded border border-gray-600 font-mono text-xs text-gray-300 break-all">
                                {{ core.twoFactorSecret() }}
                            </div>
                        </div>
                    </div>
                    <!-- Verification -->
                    <div class="bg-gray-800 p-6 rounded-lg border border-gray-600 self-start">
                         <h4 class="font-bold text-gray-300">{{ languageService.translate('settings.security.tfa.step3') }}</h4>
                        <p class="text-xs text-gray-500 mb-4">{{ languageService.translate('settings.security.tfa.step3Desc') }}</p>
                        
                        <div class="flex gap-2">
                            <input type="text" [(ngModel)]="verificationCode" placeholder="{{ languageService.translate('settings.security.tfa.enterCode') }}" maxlength="6"
                                   class="flex-1 bg-gray-900 border border-gray-500 rounded p-3 text-white text-center text-lg tracking-[0.3em] outline-none focus:border-red-500">
                            <button (click)="verifyAndEnable()" [disabled]="verificationCode.length < 6 || isVerifying()" class="bg-red-600 hover:bg-red-700 text-white font-bold px-4 rounded transition-colors disabled:opacity-50">
                                {{ isVerifying() ? languageService.translate('settings.security.tfa.verifying') : languageService.translate('settings.security.tfa.verifyButton') }}
                            </button>
                        </div>
                        @if(verificationError()) {
                            <p class="text-red-400 text-xs mt-2 text-center">{{ verificationError() }}</p>
                        }
                    </div>
                </div>
            }
        }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TwoFactorAuthComponent implements OnInit {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);
  
  setupStep = signal<'idle' | 'generating' | 'verify'>('idle');
  qrCodeUrl = signal('');
  verificationCode = '';
  isVerifying = signal(false);
  verificationError = signal('');

  ngOnInit() {}

  async startSetup() {
    this.setupStep.set('generating');
    this.verificationError.set('');
    this.verificationCode = '';
    const secret = this.core.generateNew2faSecret();
    const otpAuthUrl = `otpauth://totp/ElahehPanel:${this.core.adminUsername()}?secret=${secret}&issuer=ElahehProject`;
    
    try {
        this.qrCodeUrl.set(await QRCode.toDataURL(otpAuthUrl));
        this.setupStep.set('verify');
    } catch (err) {
        console.error(err);
        this.setupStep.set('idle');
    }
  }

  verifyAndEnable() {
    this.isVerifying.set(true);
    this.verificationError.set('');
    // SIMULATION: In a real app, you'd verify the code against the secret.
    // Here we just check if it's a 6-digit number.
    setTimeout(() => {
        if (this.verificationCode.length === 6 && /^\d{6}$/.test(this.verificationCode)) {
            this.core.is2faEnabled.set(true);
            this.core.addLog('SUCCESS', '2FA has been enabled for the admin account.');
            this.setupStep.set('idle');
        } else {
            this.verificationError.set(this.languageService.translate('settings.security.tfa.fail'));
        }
        this.isVerifying.set(false);
    }, 1000);
  }

  disable2FA() {
    if (confirm('Are you sure you want to disable 2FA?')) {
        this.core.is2faEnabled.set(false);
        this.core.twoFactorSecret.set('');
        this.core.addLog('WARN', '2FA has been disabled for the admin account.');
    }
  }
}
