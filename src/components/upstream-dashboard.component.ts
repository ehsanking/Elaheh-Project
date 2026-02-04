
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { LogoComponent } from './logo.component';

@Component({
  selector: 'app-upstream-dashboard',
  standalone: true,
  imports: [CommonModule, LogoComponent],
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
                
                <div class="mt-4 flex items-center gap-2 text-xs text-gray-500">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>Ready for incoming connections on ports 110 (TCP) & 1414 (UDP)</span>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
                    <div class="text-xs text-gray-500 uppercase mb-1">Server Load</div>
                    <div class="text-2xl font-mono text-white">{{ core.serverLoad() }}%</div>
                </div>
                <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
                    <div class="text-xs text-gray-500 uppercase mb-1">Throughput</div>
                    <div class="text-2xl font-mono text-teal-400">{{ core.transferRateMbps() }} Mbps</div>
                </div>
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

    copyToken() {
        if(this.core.upstreamToken()) {
            navigator.clipboard.writeText(this.core.upstreamToken()!);
            this.copied.set(true);
            setTimeout(() => this.copied.set(false), 2000);
        }
    }
}
