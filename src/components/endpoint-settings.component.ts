
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElahehCoreService, EndpointType, EndpointStrategy } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-endpoint-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-900/50 p-6 rounded-lg border border-gray-700 mt-8">
      <div class="border-b border-gray-700 pb-2 mb-4">
          <h3 class="text-lg font-bold text-gray-200" [attr.data-tooltip]="languageService.translate('tooltips.settings.endpointStrategy')">{{ languageService.translate('settings.endpoint.title') }}</h3>
          <p class="text-sm text-gray-400 mt-1">{{ languageService.translate('settings.endpoint.description') }}</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button (click)="selectStrategy('CDN')" class="text-left p-4 rounded border transition-all" 
                [class.bg-teal-900]="selectedStrategy() === 'CDN'" 
                [class.border-teal-500]="selectedStrategy() === 'CDN'" 
                [class.bg-gray-800]="selectedStrategy() !== 'CDN'" 
                [class.border-gray-700]="selectedStrategy() !== 'CDN'"
                [attr.data-tooltip]="languageService.translate('tooltips.settings.endpointCDN')">
            <div class="font-bold text-white flex justify-between"><span>{{ languageService.translate('settings.endpoint.cdn') }}</span><span class="text-xs bg-green-900 text-green-300 px-2 rounded">{{ languageService.translate('settings.endpoint.cdnTag') }}</span></div>
            <div class="text-xs text-gray-400 mt-1">{{ languageService.translate('settings.endpoint.cdnDesc') }}</div>
        </button>
        <button (click)="selectStrategy('CLOUD')" class="text-left p-4 rounded border transition-all" 
                [class.bg-teal-900]="selectedStrategy() === 'CLOUD'" 
                [class.border-teal-500]="selectedStrategy() === 'CLOUD'" 
                [class.bg-gray-800]="selectedStrategy() !== 'CLOUD'" 
                [class.border-gray-700]="selectedStrategy() !== 'CLOUD'"
                [attr.data-tooltip]="languageService.translate('tooltips.settings.endpointCloud')">
            <div class="font-bold text-white flex justify-between"><span>{{ languageService.translate('settings.endpoint.cloud') }}</span><span class="text-xs bg-blue-900 text-blue-300 px-2 rounded">{{ languageService.translate('settings.endpoint.cloudTag') }}</span></div>
            <div class="text-xs text-gray-400 mt-1">{{ languageService.translate('settings.endpoint.cloudDesc') }}</div>
        </button>
        <button (click)="selectStrategy('VPS')" class="text-left p-4 rounded border transition-all" 
                [class.bg-teal-900]="selectedStrategy() === 'VPS'" 
                [class.border-teal-500]="selectedStrategy() === 'VPS'" 
                [class.bg-gray-800]="selectedStrategy() !== 'VPS'" 
                [class.border-gray-700]="selectedStrategy() !== 'VPS'"
                [attr.data-tooltip]="languageService.translate('tooltips.settings.endpointVPS')">
            <div class="font-bold text-white flex justify-between"><span>{{ languageService.translate('settings.endpoint.vps') }}</span><span class="text-xs bg-purple-900 text-purple-300 px-2 rounded">{{ languageService.translate('settings.endpoint.vpsTag') }}</span></div>
            <div class="text-xs text-gray-400 mt-1">{{ languageService.translate('settings.endpoint.vpsDesc') }}</div>
        </button>
        <button (click)="selectStrategy('EDGE')" class="text-left p-4 rounded border transition-all" 
                [class.bg-teal-900]="selectedStrategy() === 'EDGE'" 
                [class.border-teal-500]="selectedStrategy() === 'EDGE'" 
                [class.bg-gray-800]="selectedStrategy() !== 'EDGE'" 
                [class.border-gray-700]="selectedStrategy() !== 'EDGE'"
                [attr.data-tooltip]="languageService.translate('tooltips.settings.endpointEdge')">
            <div class="font-bold text-white flex justify-between"><span>{{ languageService.translate('settings.endpoint.edge') }}</span><span class="text-xs bg-orange-900 text-orange-300 px-2 rounded">{{ languageService.translate('settings.endpoint.edgeTag') }}</span></div>
            <div class="text-xs text-gray-400 mt-1">{{ languageService.translate('settings.endpoint.edgeDesc') }}</div>
        </button>
        <button (click)="selectStrategy('BLOCKCHAIN')" class="text-left p-4 rounded border transition-all" 
                [class.bg-indigo-900]="selectedStrategy() === 'BLOCKCHAIN'" 
                [class.border-indigo-500]="selectedStrategy() === 'BLOCKCHAIN'" 
                [class.bg-gray-800]="selectedStrategy() !== 'BLOCKCHAIN'" 
                [class.border-gray-700]="selectedStrategy() !== 'BLOCKCHAIN'">
            <div class="font-bold text-white flex justify-between"><span>{{ languageService.translate('settings.endpoint.blockchain') }}</span><span class="text-xs bg-pink-900 text-pink-300 px-2 rounded">Web3</span></div>
            <div class="text-xs text-gray-400 mt-1">{{ languageService.translate('settings.endpoint.blockchainDesc') }}</div>
        </button>
      </div>
      
      <div class="mt-4 flex justify-end items-center gap-4">
        @if (successMessage()) {
          <span class="text-green-400 text-sm animate-pulse font-bold">{{ successMessage() }}</span>
        }
        <button (click)="applyStrategy()" [disabled]="selectedStrategy() === core.activeStrategy().type" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors shadow-lg disabled:opacity-50">
            {{ languageService.translate('settings.endpoint.applyButton') }}
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EndpointSettingsComponent {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);

  selectedStrategy = signal<EndpointType>(this.core.activeStrategy().type);
  successMessage = signal<string>('');

  selectStrategy(type: EndpointType) {
    this.selectedStrategy.set(type);
  }

  applyStrategy() {
    const type = this.selectedStrategy();
    let name = 'Unknown', features: string[] = ['TLS 1.3'], latency = 50;

    switch(type) {
      case 'CDN': name = 'Cloudflare/Fastly CDN'; features = ['TLS 1.3', 'HTTP/3', 'DDoS Protection', 'Anycast']; latency = 25; break;
      case 'CLOUD': name = 'AWS/GCP Instance'; features = ['TLS 1.3', 'High Bandwidth', 'Dedicated IP']; latency = 40; break;
      case 'VPS': name = 'Hetzner Bare Metal'; features = ['TLS 1.3', 'TCP/BBR', 'Full Root']; latency = 55; break;
      case 'EDGE': name = 'Edge Compute Node'; features = ['TLS 1.3', 'Low Latency', 'Geo-distributed']; latency = 15; break;
      case 'BLOCKCHAIN': name = 'Ethereum Relay'; features = ['Decentralized', 'Immutable', 'Unstoppable']; latency = 200; break;
    }
    const strategy: EndpointStrategy = { type, providerName: name, features, latencyMs: latency };
    this.core.setEndpointStrategy(strategy);
    
    this.successMessage.set(this.languageService.translate('settings.endpoint.success'));
    setTimeout(() => this.successMessage.set(''), 3000);
  }
}