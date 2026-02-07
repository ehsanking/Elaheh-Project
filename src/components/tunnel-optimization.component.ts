

import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElahehCoreService, TunnelProvider, EndpointStrategy } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tunnel-optimization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-gray-900/50 p-6 rounded-lg border border-gray-700 mt-8">
      <div class="border-b border-gray-700 pb-2 mb-4 flex justify-between items-start">
          <div>
            <h3 class="text-lg font-bold text-gray-200" [attr.data-tooltip]="languageService.translate('tooltips.settings.tunnelOptimization')">{{ languageService.translate('tunnel.title') }}</h3>
            <p class="text-sm text-gray-400 mt-1">{{ languageService.translate('tunnel.description') }}</p>
          </div>
          <button (click)="openAiModal()" class="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" /></svg>
             Ask AI for Advice
          </button>
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
          <div [class]="'p-4 rounded-lg flex items-center justify-between transition-all border ' + (provider.status === 'optimal' ? 'bg-teal-900/50 border-teal-500' : 'bg-gray-800') + (provider.status === 'testing' ? ' border-blue-700' : ' border-gray-700')">
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
                      [class.text-yellow-400]="provider.status === 'suboptimal'">
                      {{ provider.status }}
                    </div>
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

    <!-- AI Modal -->
    @if(showAiModal()) {
      <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4" (click)="closeAiModal()">
        <div class="bg-gray-800 border border-gray-600 rounded-lg w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]" (click)="$event.stopPropagation()">
            <div class="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.61V16a1 1 0 001 1h.01a1 1 0 001-1V9.61l6.394-2.69a1 1 0 000-1.84l-7-3zM10 8.39L4.606 5.91 10 3.53 15.394 5.91 10 8.39z" /></svg>
                    Gemini Optimization Assistant
                </h3>
                <button (click)="closeAiModal()" class="text-gray-400 hover:text-white">✕</button>
            </div>
            <div class="p-6 flex-1 overflow-y-auto">
                <label class="text-sm text-gray-400 mb-2 block">Describe your network issue or goal:</label>
                <textarea [(ngModel)]="aiPrompt" placeholder="e.g., 'My connection for gaming is unstable, suggest the best protocol and camouflage settings.'"
                          class="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors h-24"></textarea>
                
                @if(isThinking()) {
                    <div class="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700 text-center">
                        <div class="animate-pulse text-indigo-400 font-mono text-sm">Gemini is thinking...</div>
                    </div>
                }
                @if(aiResponse()) {
                    <div class="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <p class="text-sm text-gray-300 whitespace-pre-wrap">{{ aiResponse() }}</p>
                    </div>
                }
            </div>
             <div class="p-4 border-t border-gray-700 flex justify-end gap-3">
                <button (click)="closeAiModal()" class="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
                <button (click)="askAi()" [disabled]="isThinking() || !aiPrompt()" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-sm disabled:opacity-50">
                  {{ isThinking() ? 'Generating...' : 'Generate Advice' }}
                </button>
              </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TunnelOptimizationComponent {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);

  showAiModal = signal(false);
  aiPrompt = signal('');
  aiResponse = signal('');
  isThinking = signal(false);

  formatSeconds(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  activateProvider(provider: TunnelProvider) {
    if (!provider.latencyMs) return;

    let strategy: EndpointStrategy;
    
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
    
    this.core.tunnelProviders.update(providers => 
      providers.map(p => {
        if (p.id === provider.id) return { ...p, status: 'optimal' };
        if (p.status !== 'failed') return { ...p, status: 'suboptimal' };
        return p;
      })
    );
  }

  openAiModal() {
    this.showAiModal.set(true);
  }

  closeAiModal() {
    this.showAiModal.set(false);
    this.aiPrompt.set('');
    this.aiResponse.set('');
    this.isThinking.set(false);
  }

  async askAi() {
    if (!this.aiPrompt()) return;
    this.isThinking.set(true);
    this.aiResponse.set('');
    const response = await this.core.getAiOptimizationAdvice(this.aiPrompt());
    this.aiResponse.set(response);
    this.isThinking.set(false);
  }
}