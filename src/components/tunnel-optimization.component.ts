
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElahehCoreService, TunnelProvider, EndpointStrategy } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-tunnel-optimization',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-900/50 p-6 rounded-lg border border-gray-700 mt-8">
      <div class="border-b border-gray-700 pb-2 mb-4">
          <h3 class="text-lg font-bold text-gray-200" [attr.data-tooltip]="languageService.translate('tooltips.settings.tunnelOptimization')">{{ languageService.translate('tunnel.title') }}</h3>
          <p class="text-sm text-gray-400 mt-1">{{ languageService.translate('tunnel.description') }}</p>
      </div>

      <!-- Controls -->
      <div class="flex justify-between items-center mb-6 bg-gray-800 p-3 rounded-lg border border-gray-700">
          <div class="flex items-center gap-4">
              <div class="flex items-center gap-1 bg-gray-700 p-1 rounded-lg">
                <button type="button" (click)="core.setTunnelMode('auto')"
                        class="px-3 py-1 text-sm font-medium rounded-md transition-colors w-28"
                        [class.bg-teal-600]="core.tunnelMode() === 'auto'"
                        [class.text-white]="core.tunnelMode() === 'auto'"
                        [class.text-gray-400]="core.tunnelMode() !== 'auto'"
                        [class.hover:bg-gray-600]="core.tunnelMode() !== 'auto'"
                        [attr.data-tooltip]="languageService.translate('tooltips.settings.autoPilot')">
                    {{ languageService.translate('tunnel.autoPilot') }}
                </button>
                <button type="button" (click)="core.setTunnelMode('manual')"
                        class="px-3 py-1 text-sm font-medium rounded-md transition-colors w-28"
                        [class.bg-teal-600]="core.tunnelMode() === 'manual'"
                        [class.text-white]="core.tunnelMode() === 'manual'"
                        [class.text-gray-400]="core.tunnelMode() !== 'manual'"
                        [class.hover:bg-gray-600]="core.tunnelMode() !== 'manual'"
                        [attr.data-tooltip]="languageService.translate('tooltips.settings.manualMode')">
                    {{ languageService.translate('tunnel.manual') }}
                </button>
              </div>
              @if (core.isAutoTestEnabled()) {
                  <div class="text-xs text-gray-400 font-mono">
                      {{ languageService.translate('tunnel.nextTest') }} <span class="text-teal-400 font-bold">{{ formatSeconds(core.nextAutoTestSeconds()) }}</span>
                  </div>
              } @else {
                  <div class="text-xs text-gray-500 font-mono italic">
                      {{ languageService.translate('tunnel.disabled') }}
                  </div>
              }
          </div>
          
          <button type="button" (click)="core.runTunnelAnalysis()" [disabled]="core.isTestingTunnels()"
                  class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait text-white font-bold py-2 px-4 rounded transition-colors shadow-lg text-sm flex items-center gap-2">
              @if(core.isTestingTunnels()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ languageService.translate('tunnel.analyzing') }}</span>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                   <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                </svg>
                <span>{{ languageService.translate('tunnel.testNow') }}</span>
              }
          </button>
      </div>

      <div class="space-y-3">
        @for(provider of core.tunnelProviders(); track provider.id) {
          <div class="p-4 rounded-lg flex items-center justify-between transition-all border"
            [class.bg-gray-800]="provider.status !== 'optimal'"
            [class.border-gray-700]="provider.status !== 'optimal' && provider.status !== 'testing'"
            [ngClass]="{'bg-teal-900/50': provider.status === 'optimal'}"
            [class.border-teal-500]="provider.status === 'optimal'"
            [class.border-blue-700]="provider.status === 'testing'">
            
            <div class="flex items-center gap-4 flex-1">
              <div class="w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold flex-shrink-0"
                   [class.bg-gray-700]="provider.status === 'untested' || provider.status === 'suboptimal'"
                   [class.bg-blue-800]="provider.status === 'testing'"
                   [class.bg-green-800]="provider.status === 'optimal'"
                   [class.bg-red-800]="provider.status === 'failed'">
                @switch(provider.status) {
                  @case('testing') { <div class="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div> }
                  @case('optimal') { <span class="text-green-300">✓</span> }
                  @case('suboptimal') { <span class="text-yellow-300">!</span> }
                  @case('failed') { <span class="text-red-300">✗</span> }
                  @default { <span class="text-gray-400">?</span> }
                }
              </div>
              <div>
                <div class="font-bold text-white">{{ provider.name }}</div>
                <div class="text-xs text-gray-400">{{ provider.type }}</div>
              </div>
            </div>

            <div class="flex items-center gap-4">
                <div class="text-right w-36">
                  @if(provider.latencyMs !== null) {
                    <div class="text-sm font-mono text-gray-200">{{ provider.latencyMs }}ms <span class="text-gray-500">/</span> {{ provider.jitterMs }} Jitter</div>
                    <div class="text-xs mt-1 capitalize"
                      [class.text-green-400]="provider.status === 'optimal'"
                      [class.text-yellow-400]="provider.status === 'suboptimal'"
                    >{{ provider.status }}</div>
                  } @else if (provider.status === 'failed') {
                    <div class="text-sm font-mono text-red-400">{{ languageService.translate('tunnel.failed') }}</div>
                  } @else if (provider.status === 'testing') {
                    <div class="text-sm font-mono text-blue-400 animate-pulse">{{ languageService.translate('tunnel.pinging') }}</div>
                  } @else {
                    <div class="text-sm font-mono text-gray-500">{{ languageService.translate('tunnel.awaiting') }}</div>
                  }
                </div>

                <div class="w-24 text-right">
                    @if (core.tunnelMode() === 'manual' && provider.status !== 'optimal') {
                        <button type="button" (click)="activateProvider(provider)"
                                [disabled]="provider.status === 'failed' || provider.status === 'untested' || provider.status === 'testing'"
                                class="bg-gray-700 hover:bg-gray-600 text-teal-400 px-3 py-1 rounded text-xs uppercase font-bold tracking-wider shadow border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ languageService.translate('tunnel.activate') }}
                        </button>
                    }
                </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TunnelOptimizationComponent {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);

  formatSeconds(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  activateProvider(provider: TunnelProvider) {
    if (!provider.latencyMs) return;

    let strategy: EndpointStrategy;
    
    // Define features based on type
    let features = ['TLS 1.3'];
    if (provider.type === 'CDN') features = ['TLS 1.3', 'HTTP/3', 'DDoS Protection', 'Anycast'];
    else if (provider.type === 'VPS') features = ['TLS 1.3', 'TCP/BBR', 'Lowest Latency'];
    else if (provider.type === 'CLOUD') features = ['TLS 1.3', 'Auto-Routing'];
    else features = ['TLS 1.3', 'Standard Encryption'];

    strategy = {
        type: provider.type,
        providerName: provider.name,
        features: features,
        latencyMs: provider.latencyMs
    };

    this.core.setEndpointStrategy(strategy, true); // manual = true
    
    // Also update provider status visually
    this.core.tunnelProviders.update(providers => 
      providers.map(p => {
        if (p.id === provider.id) return { ...p, status: 'optimal' };
        if (p.status !== 'failed') return { ...p, status: 'suboptimal' };
        return p;
      })
    );
  }
}
