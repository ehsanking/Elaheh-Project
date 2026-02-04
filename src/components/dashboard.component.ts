
import { Component, inject, OnInit, OnDestroy, signal, effect, ChangeDetectionStrategy, computed } from '@angular/core';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Top Row: Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      
      <!-- Card 1: User Overview -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-lg relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600" [attr.data-tooltip]="languageService.translate('tooltips.dashboard.userCard')">
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-teal-500 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>
        <h3 class="text-gray-500 dark:text-gray-400 text-sm font-uppercase font-bold tracking-wider">{{ languageService.translate('dashboard.userBase') }}</h3>
        <div class="text-3xl font-mono text-gray-900 dark:text-white mt-1">{{ core.userStats().total }} <span class="text-sm text-gray-400 dark:text-gray-500 font-sans">{{ languageService.translate('dashboard.totalUsers') }}</span></div>
        <div class="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <span class="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded border border-green-200 dark:border-green-900/50"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>{{ core.userStats().active }} {{ languageService.translate('common.active') }}</span>
          <span class="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-900/50"><span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>{{ core.userStats().expired }} {{ languageService.translate('common.expired') }}</span>
          <span class="flex items-center gap-1 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded border border-red-200 dark:border-red-900/50"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>{{ core.userStats().banned }} {{ languageService.translate('common.banned') }}</span>
        </div>
      </div>

      <!-- Card 2: Active Connections -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-lg group relative transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600" [attr.data-tooltip]="languageService.translate('tooltips.dashboard.connectionsCard')">
         <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
        <h3 class="text-gray-500 dark:text-gray-400 text-sm font-uppercase font-bold tracking-wider">{{ languageService.translate('dashboard.liveConnections') }}</h3>
        <div class="text-3xl font-mono text-gray-900 dark:text-white mt-1 animate-pulse">{{ core.activeConnections() }}</div>
        <div class="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1"><svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>{{ languageService.translate('dashboard.tunnelEstablished') }}</div>
      </div>

      <!-- Card 3: Data Volume -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-lg relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600" [attr.data-tooltip]="languageService.translate('tooltips.dashboard.dataCard')">
         <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2-2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg></div>
        <div class="flex justify-between items-baseline">
            <div>
              <h3 class="text-gray-500 dark:text-gray-400 text-sm font-uppercase font-bold tracking-wider">{{ languageService.translate('dashboard.totalData') }}</h3>
              <div class="text-3xl font-mono text-gray-900 dark:text-white mt-1">{{ core.totalDataTransferred() | number:'1.2-2' }} <span class="text-lg text-gray-500 dark:text-gray-400">GB</span></div>
            </div>
            <div class="text-right">
              <div class="text-xl font-mono text-purple-600 dark:text-purple-400 animate-pulse">{{ core.transferRateMbps() | number:'1.1-1' }}</div>
              <div class="text-xs text-gray-400 dark:text-gray-500">Mbps</div>
            </div>
        </div>
        <div class="text-xs text-gray-400 dark:text-gray-500 mt-2">{{ languageService.translate('dashboard.encryptedPayload') }}</div>
      </div>

      <!-- Card 4: Camouflage Status -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600" [attr.data-tooltip]="languageService.translate('tooltips.dashboard.camouflageCard')">
        <h3 class="text-gray-500 dark:text-gray-400 text-sm font-uppercase font-bold tracking-wider">{{ languageService.translate('dashboard.camouflage.title') }}</h3>
        <div class="text-lg font-bold text-teal-600 dark:text-teal-400 mt-1 truncate">{{ languageService.translate('settings.camouflage.profileDesc.' + core.camouflageProfile().split('_')[0].toLowerCase()) }}</div>
        <div class="flex flex-col gap-1 mt-2 text-xs font-mono">
            <div><span class="text-gray-400 dark:text-gray-500">{{ languageService.translate('dashboard.camouflage.jobStatus') }}:</span> 
                @if(core.camouflageJobStatus() === 'RUNNING') {
                    <span class="text-yellow-500 dark:text-yellow-400 animate-pulse">{{ languageService.translate('dashboard.camouflage.running') }}</span>
                } @else {
                    <span class="text-green-500 dark:text-green-400">{{ languageService.translate('dashboard.camouflage.idle') }}</span>
                }
            </div>
             <div><span class="text-gray-400 dark:text-gray-500">{{ languageService.translate('dashboard.camouflage.lastRun') }}:</span> <span class="text-gray-600 dark:text-gray-300">{{ lastRun() }}</span></div>
        </div>
      </div>
    </div>

    <!-- Middle Row: Throughput & Connection Quality -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      <!-- Traffic Graph Simulation -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-gray-900 dark:text-white font-bold mb-4 flex justify-between items-center" [attr.data-tooltip]="languageService.translate('tooltips.dashboard.trafficChart')"><span>{{ languageService.translate('dashboard.simulatedTraffic') }}</span>
          <div class="flex gap-2 flex-wrap justify-end">
            @if(core.optimalDnsResolver()) {
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded">{{ languageService.translate('dashboard.optimalDns') }}: {{ core.optimalDnsResolver() }}</span>
            }
            <span class="text-xs font-mono text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded">{{ languageService.translate('dashboard.avgRTT') }}: ~{{core.activeStrategy().latencyMs}}ms</span>
            @if (core.activeStrategy().features.includes('TLS 1.3')) {
              <span class="flex items-center gap-1 text-xs font-mono text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900 px-2 py-1 rounded"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>{{ languageService.translate('dashboard.tlsActive') }}</span>
            } @else {
              <span class="flex items-center gap-1 text-xs font-mono text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 px-2 py-1 rounded"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>{{ languageService.translate('dashboard.tlsInactive') }}</span>
            }
          </div>
        </h3>
        <div class="h-64 relative">
          <canvas id="trafficChart"></canvas>
        </div>
      </div>

      <!-- Network Health & Connection Quality -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between">
         <div>
            <h3 class="text-gray-900 dark:text-white font-bold mb-4">{{ languageService.translate('dashboard.networkHealth') }}</h3>
            
            <!-- Connection Quality Indicator -->
            <div class="text-center py-6">
                <div class="relative inline-flex items-center justify-center w-24 h-24 mb-3">
                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path class="text-gray-200 dark:text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" />
                        <path [attr.stroke-dasharray]="qualityScore() + ', 100'"
                              class="transition-all duration-1000 ease-out"
                              [class.text-green-500]="core.connectionQuality() === 'Excellent'"
                              [class.text-blue-500]="core.connectionQuality() === 'Good'"
                              [class.text-yellow-500]="core.connectionQuality() === 'Fair'"
                              [class.text-red-500]="core.connectionQuality() === 'Poor'"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" />
                    </svg>
                    <div class="absolute flex flex-col items-center">
                        <span class="text-2xl font-bold text-gray-900 dark:text-white">
                            @if(core.connectionQuality() === 'Excellent') { A+ }
                            @else if(core.connectionQuality() === 'Good') { B }
                            @else if(core.connectionQuality() === 'Fair') { C }
                            @else { D }
                        </span>
                    </div>
                </div>
                <div class="text-lg font-bold"
                     [class.text-green-600]="core.connectionQuality() === 'Excellent'"
                     [class.dark:text-green-400]="core.connectionQuality() === 'Excellent'"
                     [class.text-blue-600]="core.connectionQuality() === 'Good'"
                     [class.dark:text-blue-400]="core.connectionQuality() === 'Good'"
                     [class.text-yellow-600]="core.connectionQuality() === 'Fair'"
                     [class.dark:text-yellow-400]="core.connectionQuality() === 'Fair'"
                     [class.text-red-600]="core.connectionQuality() === 'Poor'"
                     [class.dark:text-red-400]="core.connectionQuality() === 'Poor'">
                    {{ languageService.translate('dashboard.quality.' + core.connectionQuality()) }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">{{ languageService.translate('dashboard.connectionQuality') }}</div>
            </div>
         </div>

         <!-- Metrics -->
         <div class="space-y-4">
            <!-- Packet Loss -->
            <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-red-100 dark:bg-red-900/20 rounded-md text-red-600 dark:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ languageService.translate('dashboard.packetLoss') }}</div>
                        <div class="font-mono font-bold text-gray-900 dark:text-white">{{ core.packetLossRate() }}%</div>
                    </div>
                </div>
                <!-- Mini trend -->
                <span class="text-xs" [class.text-green-500]="core.packetLossRate() < 1" [class.text-red-500]="core.packetLossRate() >= 1">
                    {{ core.packetLossRate() < 1 ? '▼' : '▲' }}
                </span>
            </div>

            <!-- Jitter -->
            <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-md text-purple-600 dark:text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                    </div>
                    <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ languageService.translate('dashboard.jitter') }}</div>
                        <div class="font-mono font-bold text-gray-900 dark:text-white">{{ core.jitterMs() }} ms</div>
                    </div>
                </div>
                 <span class="text-xs" [class.text-green-500]="core.jitterMs() < 20" [class.text-yellow-500]="core.jitterMs() >= 20 && core.jitterMs() < 50" [class.text-red-500]="core.jitterMs() >= 50">
                    {{ core.jitterMs() < 20 ? '● Stable' : '▲ High' }}
                </span>
            </div>
         </div>
      </div>
    </div>

    <!-- Bottom Row: Jitter Chart & Geo Distribution -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Stability Chart -->
        <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-gray-900 dark:text-white font-bold mb-4">{{ languageService.translate('dashboard.stabilityChart') }}</h3>
            <div class="h-64 relative">
                <canvas id="stabilityChart"></canvas>
            </div>
        </div>

        <!-- Geo Distribution -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
            <h3 class="text-gray-900 dark:text-white font-bold mb-4">{{ languageService.translate('dashboard.geoDist.title') }}</h3>
            <div class="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                @for (item of core.geoDistribution(); track item.code) {
                    <div class="group">
                        <div class="flex justify-between items-end mb-1 text-sm">
                            <span class="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <span class="text-lg">{{ getFlagEmoji(item.code) }}</span> {{ item.country }}
                            </span>
                            <span class="font-mono text-xs text-gray-500 dark:text-gray-400">{{ item.count }} {{ languageService.translate('dashboard.geoDist.users') }} ({{ item.percent }}%)</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div class="bg-teal-500 h-2 rounded-full transition-all duration-1000" [style.width.%]="item.percent"></div>
                        </div>
                    </div>
                }
            </div>
        </div>
    </div>

    <!-- System Logs -->
    <div class="bg-gray-100 dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-4 font-mono text-xs overflow-hidden flex flex-col">
      <h3 class="text-gray-500 dark:text-gray-400 mb-2 border-b border-gray-200 dark:border-gray-800 pb-2">{{ languageService.translate('systemLogs') }}</h3>
      <div class="flex-1 overflow-y-auto space-y-2 pr-2 h-40">
        @for (log of core.logs(); track log.timestamp) {
          <div class="flex gap-2"><span class="text-gray-400 dark:text-gray-500">[{{log.timestamp}}]</span><span [class.text-blue-500]="log.level === 'INFO'" [class.dark:text-blue-400]="log.level === 'INFO'" [class.text-yellow-500]="log.level === 'WARN'" [class.dark:text-yellow-400]="log.level === 'WARN'" [class.text-red-600]="log.level === 'ERROR'" [class.dark:text-red-500]="log.level === 'ERROR'" [class.text-green-600]="log.level === 'SUCCESS'" [class.dark:text-green-400]="log.level === 'SUCCESS'">{{log.level}}</span><span class="text-gray-700 dark:text-gray-300">{{log.message}}</span></div>
        }
      </div>
    </div>
  `,
  styles: `
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 4px; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);
  private chart: any; // Throughput Chart
  private stabilityChart: any; // Jitter/Latency Chart
  
  private timer = signal(Date.now());
  private timerInterval: any;

  lastRun = computed(() => {
    this.timer(); // Depend on the timer signal
    const lastUpdate = this.core.lastCamouflageUpdate();
    if (!lastUpdate) return this.languageService.translate('dashboard.camouflage.never');
    
    const now = this.timer();
    const seconds = Math.round((now - lastUpdate.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  });

  qualityScore = computed(() => {
      const q = this.core.connectionQuality();
      if (q === 'Excellent') return 100;
      if (q === 'Good') return 75;
      if (q === 'Fair') return 50;
      return 25;
  });
  
  chartOptions = computed(() => {
    const isDark = this.core.theme() === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#9ca3af' : '#6b7280';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: { color: textColor, font: { size: 10 } }
        }
      },
      elements: { point: { radius: 0 } }
    };
  });

  stabilityChartOptions = computed(() => {
    const isDark = this.core.theme() === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#9ca3af' : '#6b7280';

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: { 
          legend: { 
              display: true,
              labels: { color: textColor, font: { size: 10 }, boxWidth: 10 }
          } 
      },
      scales: {
        x: { display: false },
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: { color: textColor, font: { size: 10 } },
          title: { display: true, text: 'Latency (ms)', color: textColor, font: {size: 9} }
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          ticks: { color: textColor, font: { size: 10 } },
          title: { display: true, text: 'Jitter (ms)', color: textColor, font: {size: 9} }
        },
      },
      elements: { point: { radius: 0 } }
    };
  });

  constructor() {
    effect(() => {
      // Re-render charts on theme change
      if (this.chart) {
        const newOptions = this.chartOptions();
        this.chart.options.scales.y.grid.color = newOptions.scales.y.grid.color;
        this.chart.options.scales.y.ticks.color = newOptions.scales.y.ticks.color;
        this.chart.update();
      }
      if (this.stabilityChart) {
          const newOptions = this.stabilityChartOptions();
          this.stabilityChart.options.scales.y.grid.color = newOptions.scales.y.grid.color;
          this.stabilityChart.options.scales.y.ticks.color = newOptions.scales.y.ticks.color;
          this.stabilityChart.options.plugins.legend.labels.color = newOptions.plugins.legend.labels.color;
          this.stabilityChart.update();
      }
    });

    effect(() => {
      // Update data
      const transferRate = this.core.transferRateMbps();
      const jobStatus = this.core.camouflageJobStatus();
      const jitter = this.core.jitterMs();
      const latency = this.core.activeStrategy().latencyMs;
      
      this.updateChartData(transferRate, jobStatus);
      this.updateStabilityData(latency, jitter);
    });
  }

  ngOnInit(): void {
    // Dynamically load Chart.js if not present (handled in index.html but safety check)
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => this.initCharts();
    if((window as any).Chart) {
        this.initCharts();
    } else {
        document.head.appendChild(script);
    }
    
    this.timerInterval = setInterval(() => this.timer.set(Date.now()), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
    if (this.chart) this.chart.destroy();
    if (this.stabilityChart) this.stabilityChart.destroy();
  }

  private initCharts(): void {
    const Chart = (window as any).Chart;
    if (!Chart) return;
    
    // 1. Throughput Chart
    const ctx = (document.getElementById('trafficChart') as HTMLCanvasElement)?.getContext('d');
    if (ctx) {
        const labels = Array.from({ length: 30 }, (_, i) => `${(30 - i) * 2}s`);
        const data = {
        labels: labels,
        datasets: [
            {
            label: 'Real-time',
            data: Array(30).fill(0),
            borderColor: 'rgba(59, 130, 246, 0.8)', // blue-500
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            },
            {
            label: 'Camouflage',
            data: Array(30).fill(0),
            borderColor: 'rgba(22, 163, 74, 0.6)', // green-600
            backgroundColor: 'rgba(22, 163, 74, 0.1)',
            fill: true,
            tension: 0.4,
            borderDash: [5, 5],
            }
        ]
        };

        this.chart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: this.chartOptions()
        });
    }

    // 2. Stability Chart
    const ctx2 = (document.getElementById('stabilityChart') as HTMLCanvasElement)?.getContext('d');
    if (ctx2) {
        const labels = Array.from({ length: 30 }, (_, i) => ``);
        const data2 = {
            labels: labels,
            datasets: [
                {
                    label: 'Latency',
                    data: Array(30).fill(45), // Default baseline
                    borderColor: 'rgba(20, 184, 166, 0.8)', // teal-500
                    backgroundColor: 'transparent',
                    yAxisID: 'y',
                    tension: 0.2,
                    pointRadius: 0
                },
                {
                    label: 'Jitter',
                    data: Array(30).fill(5),
                    borderColor: 'rgba(168, 85, 247, 0.8)', // purple-500
                    backgroundColor: 'transparent',
                    yAxisID: 'y1',
                    borderDash: [2, 2],
                    tension: 0.1,
                    pointRadius: 0
                }
            ]
        };
        
        this.stabilityChart = new Chart(ctx2, {
            type: 'line',
            data: data2,
            options: this.stabilityChartOptions()
        });
    }
  }

  private updateChartData(transferRate: number, jobStatus: 'IDLE' | 'RUNNING'): void {
    if (!this.chart) return;
    
    requestAnimationFrame(() => {
      if (!this.chart) return; 
      
      const realTraffic = transferRate + (Math.random() * 20 - 10);
      this.chart.data.datasets[0].data.shift();
      this.chart.data.datasets[0].data.push(Math.max(0, realTraffic));
      
      let camouflageTraffic = 0;
      if(jobStatus === 'RUNNING') {
          camouflageTraffic = Math.random() * 50 + 20;
      }
      this.chart.data.datasets[1].data.shift();
      this.chart.data.datasets[1].data.push(camouflageTraffic);

      this.chart.update('quiet');
    });
  }

  private updateStabilityData(latency: number, jitter: number): void {
      if(!this.stabilityChart) return;

      requestAnimationFrame(() => {
          if (!this.stabilityChart) return;

          // Latency with small jitter
          const currentLatency = latency + (Math.random() * 5 - 2.5);
          this.stabilityChart.data.datasets[0].data.shift();
          this.stabilityChart.data.datasets[0].data.push(currentLatency);

          this.stabilityChart.data.datasets[1].data.shift();
          this.stabilityChart.data.datasets[1].data.push(jitter);

          this.stabilityChart.update('quiet');
      });
  }

  getFlagEmoji(countryCode: string): string {
      const codePoints = countryCode
          .toUpperCase()
          .split('')
          .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
  }
}