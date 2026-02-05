
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { LogoComponent } from './logo.component';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-upstream-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LogoComponent],
  template: `
    <div class="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-6">
        <div class="w-full max-w-2xl">
            <!-- Header -->
            <div class="flex items-center justify-center gap-4 mb-8">
                <div class="w-16 h-16 text-teal-500"><app-logo></app-logo></div>
                <div class="text-center">
                    <h1 class="text-3xl font-bold tracking-widest text-white">ELAHEH UPSTREAM</h1>
                    <p class="text-xs text-gray-500 uppercase tracking-[0.2em] mt-1">Foreign Relay Node • Germany</p>
                </div>
            </div>

            <!-- Token Card -->
            <div class="bg-gray-800 rounded-xl border border-gray-700 p-8 shadow-2xl mb-8 relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-blue-500"></div>
                
                <h2 class="text-xl font-bold text-teal-400 mb-2">Connection Token</h2>
                <p class="text-sm text-gray-400 mb-6">Copy this token and paste it into the settings of your Iran server to establish the secure tunnel.</p>
                
                <div class="relative bg-black/50 p-4 rounded border border-gray-600 font-mono text-xs text-green-400 break-all shadow-inner">
                    {{ core.upstreamToken() }}
                    <button (click)="copyToken()" class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs transition-colors">
                        {{ copied() ? 'Copied!' : 'Copy' }}
                    </button>
                </div>
                
                <div class="mt-4 border-t border-gray-700 pt-4">
                    <button (click)="donateServer()" class="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                        <span>{{ languageService.translate('upstream.donateButton') }}</span>
                    </button>
                    <p class="text-xs text-gray-500 text-center mt-2">{{ languageService.translate('upstream.donateDesc') }}</p>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-4 mb-8">
                <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
                    <div class="text-xs text-gray-500 uppercase mb-1">Server Load</div>
                    <div class="text-2xl font-mono text-white">{{ core.serverLoad() }}%</div>
                </div>
                <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
                    <div class="text-xs text-gray-500 uppercase mb-1">Throughput</div>
                    <div class="text-2xl font-mono text-teal-400">{{ core.transferRateMbps() }} Mbps</div>
                </div>
            </div>

            <!-- Admin Settings -->
            <div class="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 class="text-sm font-bold text-gray-400 mb-3 uppercase">Admin Credentials</h3>
                <div class="space-y-2">
                    <input type="text" [(ngModel)]="newUsername" placeholder="New Username (optional)" class="w-full bg-gray-900 border border-gray-600 rounded p-2 text-xs text-white outline-none">
                    <input type="password" [(ngModel)]="newPassword" placeholder="New Password (optional)" class="w-full bg-gray-900 border border-gray-600 rounded p-2 text-xs text-white outline-none">
                    <input type="email" [(ngModel)]="newEmail" placeholder="Recovery Email (optional)" class="w-full bg-gray-900 border border-gray-600 rounded p-2 text-xs text-white outline-none">
                </div>
                <button (click)="updateCreds()" [disabled]="!newUsername && !newPassword && !newEmail" class="mt-2 w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-xs font-bold py-2 rounded transition-colors">
                    Update Credentials
                </button>
                @if(credsUpdated()) {
                    <div class="text-center text-[10px] text-green-400 mt-1">Credentials updated successfully.</div>
                }
                @if(updateError()) {
                    <div class="text-center text-[10px] text-red-400 mt-1">{{ updateError() }}</div>
                }
            </div>
            
            <div class="mt-8 text-center">
                <button (click)="core.isAuthenticated.set(false)" class="text-red-400 hover:text-red-300 text-sm underline">Log Out</button>
            </div>
        </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpstreamDashboardComponent {
    core = inject(ElahehCoreService);
    languageService = inject(LanguageService);
    copied = signal(false);
    
    newUsername = '';
    newPassword = '';
    newEmail = '';
    credsUpdated = signal(false);
    updateError = signal('');

    async donateServer() {
        const token = this.core.upstreamToken();
        if (!token) {
            alert('Token not available.');
            return;
        }

        const shareData = {
            title: 'Elaheh VPN Server Donation',
            text: `Here is my Elaheh VPN connection key. You can use this to bypass censorship.\n\nKey: ${token}`,
            url: window.location.origin
        };

        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                this.core.addLog('SUCCESS', 'Donation key shared successfully.');
            } catch (err) {
                // This can happen if the user cancels the share dialog
                this.core.addLog('WARN', 'Sharing was cancelled or failed.');
            }
        } else {
            // Fallback for browsers that don't support the Share API
            this.core.addLog('INFO', 'Share API not supported, copying to clipboard instead.');
            this.copyToken();
            alert('Your browser does not support sharing. The key has been copied to your clipboard instead.');
        }
    }

    copyToken() {
        if(this.core.upstreamToken()) {
            navigator.clipboard.writeText(this.core.upstreamToken()!);
            this.copied.set(true);
            setTimeout(() => this.copied.set(false), 2000);
        }
    }

    updateCreds() {
        this.updateError.set('');
        if ((this.newUsername && !this.newPassword) || (!this.newUsername && this.newPassword)) {
            this.updateError.set('Both username and password are required to change them.');
            return;
        }

        let updated = false;
        if (this.newUsername && this.newPassword) {
            this.core.updateAdminCredentials(this.newUsername, this.newPassword);
            updated = true;
        }
        if (this.newEmail) {
            this.core.updateAdminEmail(this.newEmail);
            updated = true;
        }

        if (updated) {
            this.credsUpdated.set(true);
            setTimeout(() => this.credsUpdated.set(false), 3000);
            this.newUsername = '';
            this.newPassword = '';
            this.newEmail = '';
        }
    }
}
