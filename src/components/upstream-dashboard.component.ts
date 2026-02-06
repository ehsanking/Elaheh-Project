
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { LogoComponent } from './logo.component';

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
                
                @if(!isDonationMode()) {
                    <h2 class="text-xl font-bold text-teal-400 mb-2">Connection Token</h2>
                    <p class="text-sm text-gray-400 mb-6">Copy this token and paste it into the settings of your Iran server to establish the secure tunnel.</p>
                    
                    <div class="relative bg-black/50 p-4 rounded border border-gray-600 font-mono text-xs text-green-400 break-all shadow-inner">
                        {{ core.upstreamToken() }}
                        <button (click)="copyToken()" class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs transition-colors">
                            {{ copied() ? 'Copied!' : 'Copy' }}
                        </button>
                    </div>
                } @else {
                    <!-- DONATION MODE UI -->
                    <div class="animate-in fade-in">
                        <h2 class="text-xl font-bold text-pink-400 mb-2 flex items-center gap-2">
                            <span class="text-2xl">❤️</span> Server Donation Mode
                        </h2>
                        <p class="text-sm text-gray-300 mb-4 bg-pink-900/20 p-3 rounded border border-pink-900/50">
                            Thank you for supporting internet freedom! By sharing this key, you allow censorship-affected users to tunnel securely through this node.
                            <br><br>
                            <strong class="text-white">Security Note:</strong> All traffic routed through this server is encrypted (XTLS/TLS). You cannot see user activity, and no logs are stored, protecting you from liability.
                        </p>
                        
                        <div class="relative bg-black/50 p-4 rounded border border-pink-600/50 font-mono text-xs text-pink-300 break-all shadow-inner">
                            {{ core.upstreamToken() }}
                            <button (click)="copyToken()" class="absolute top-2 right-2 bg-pink-700 hover:bg-pink-600 text-white px-3 py-1 rounded text-xs transition-colors">
                                {{ copied() ? 'Copied!' : 'Copy Key' }}
                            </button>
                        </div>
                    </div>
                }
                
                <div class="mt-4 flex justify-between items-center border-t border-gray-700 pt-4">
                    <button (click)="toggleDonationMode()" class="text-xs flex items-center gap-2 px-3 py-1 rounded transition-colors" [class.text-pink-400]="!isDonationMode()" [class.hover:bg-pink-900/20]="!isDonationMode()" [class.text-teal-400]="isDonationMode()">
                        @if(!isDonationMode()) {
                            <span>❤️ Donate This Server</span>
                        } @else {
                            <span>🔙 Standard View</span>
                        }
                    </button>

                    <div class="flex flex-col gap-1 text-right">
                        <div class="flex items-center gap-2 text-xs text-green-400 justify-end">
                            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span class="font-bold">Active Ports:</span>
                        </div>
                        <div class="text-[10px] text-gray-400 font-mono">
                            <span class="text-teal-500">OVPN:</span> 110, 510 | <span class="text-teal-500">WG:</span> 1414, 53133
                        </div>
                    </div>
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
                <div class="grid grid-cols-2 gap-2">
                    <input type="text" [(ngModel)]="newUsername" placeholder="New Username" class="bg-gray-900 border border-gray-600 rounded p-2 text-xs text-white outline-none">
                    <input type="password" [(ngModel)]="newPassword" placeholder="New Password" class="bg-gray-900 border border-gray-600 rounded p-2 text-xs text-white outline-none">
                </div>
                <button (click)="updateCreds()" [disabled]="!newUsername || !newPassword" class="mt-2 w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-xs font-bold py-2 rounded transition-colors">
                    Update Credentials
                </button>
                @if(credsUpdated()) {
                    <div class="text-center text-[10px] text-green-400 mt-1">Credentials updated successfully.</div>
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
    copied = signal(false);
    isDonationMode = signal(false);
    
    newUsername = '';
    newPassword = '';
    credsUpdated = signal(false);

    toggleDonationMode() {
        this.isDonationMode.update(v => !v);
    }

    copyToken() {
        if(this.core.upstreamToken()) {
            navigator.clipboard.writeText(this.core.upstreamToken()!);
            this.copied.set(true);
            setTimeout(() => this.copied.set(false), 2000);
        }
    }

    updateCreds() {
        if (this.newUsername && this.newPassword) {
            this.core.updateAdminCredentials(this.newUsername, this.newPassword);
            this.credsUpdated.set(true);
            setTimeout(() => this.credsUpdated.set(false), 3000);
            this.newUsername = '';
            this.newPassword = '';
        }
    }
}
