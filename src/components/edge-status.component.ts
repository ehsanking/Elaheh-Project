import { Component, inject, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';
import { LogoComponent } from './logo.component';

@Component({
  selector: 'app-edge-status',
  standalone: true,
  imports: [CommonModule, LogoComponent],
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <header class="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 sticky top-0 z-20">
        <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 text-teal-400">
              <app-logo></app-logo>
            </div>
            <span class="text-lg font-bold tracking-tight text-white">{{ languageService.translate('edgeStatus.title') }}</span>
          </div>
          <button (click)="logout.emit()" class="text-sm font-medium text-gray-300 hover:text-red-400 bg-red-900/30 hover:bg-red-900/50 px-4 py-1.5 rounded border border-red-800 transition-colors">
            {{ languageService.translate('nav.signOut') }}
          </button>
        </nav>
      </header>

      <main class="flex-1 container mx-auto px-6 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Status Card -->
            <div class="md:col-span-1 bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col gap-4">
                <div>
                    <h3 class="text-gray-400 text-sm font-uppercase font-bold tracking-wider mb-4">{{ languageService.translate('edgeStatus.connectionTitle') }}</h3>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg">
                            <span class="text-sm text-gray-400">{{ languageService.translate('edgeStatus.statusLabel') }}</span>
                            <span class="flex items-center gap-2 text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded border border-green-900">
                                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                {{ languageService.translate('edgeStatus.statusConnected') }}
                            </span>
                        </div>
                        <div class="font-mono text-sm space-y-2">
                            <div class="bg-gray-900/50 p-3 rounded-lg">
                                <div class="text-xs text-gray-500">Upstream (Germany)</div>
                                <div class="text-teal-400">{{ core.upstreamNode() }}</div>
                            </div>
                            <div class="bg-gray-900/50 p-3 rounded-lg">
                                <div class="text-xs text-gray-500">Downstream (Local)</div>
                                <div class="text-blue-400">{{ core.downstreamNode() }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                 <div>
                    <h3 class="text-gray-400 text-sm font-uppercase font-bold tracking-wider mb-4">{{ languageService.translate('edgeStatus.activeTunnel') }}</h3>
                     <div class="bg-gray-900/50 p-4 rounded-lg">
                        <div class="font-bold text-lg text-teal-400">{{ core.activeStrategy().providerName }}</div>
                        <div class="text-xs text-gray-500 font-mono">{{ core.activeStrategy().type }} / {{ core.activeStrategy().latencyMs }}ms RTT</div>
                        <div class="text-xs text-gray-400 mt-2 flex flex-wrap gap-2">
                            @for(feature of core.activeStrategy().features; track feature) {
                                <span class="bg-gray-700 px-2 py-0.5 rounded">{{ feature }}</span>
                            }
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Live Logs -->
            <div class="md:col-span-2 bg-black rounded-lg border border-gray-700 p-4 font-mono text-xs overflow-hidden flex flex-col min-h-[60vh]">
              <h3 class="text-gray-400 mb-2 border-b border-gray-800 pb-2">{{ languageService.translate('systemLogs') }}</h3>
              <div class="flex-1 overflow-y-auto space-y-2 pr-2">
                @for (log of core.logs(); track log.timestamp) {
                  <div class="flex gap-2"><span class="text-gray-500">[{{log.timestamp}}]</span><span [class.text-blue-400]="log.level === 'INFO'" [class.text-yellow-400]="log.level === 'WARN'" [class.text-red-500]="log.level === 'ERROR'" [class.text-green-400]="log.level === 'SUCCESS'">{{log.level}}</span><span class="text-gray-300">{{log.message}}</span></div>
                }
              </div>
            </div>
        </div>
      </main>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EdgeStatusComponent {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);

  @Output() logout = new EventEmitter<void>();
}
