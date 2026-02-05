
import { Component, inject, OnInit, OnDestroy, signal, effect, ChangeDetectionStrategy, computed, untracked } from '@angular/core';
import { ElahehCoreService, LogEntry } from '../services/elaheh-core.service';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
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
  
  // AI Analysis State
  isAnalyzingLogs = signal(false);
  showAiAnalysisModal = signal(false);
  aiAnalysisResult = signal('');
  aiAnalysisError = signal('');

  lastRun = computed(() => {
    const now = this.timer();
    const lastUpdate = this.core.lastCamouflageUpdate();
    if (!lastUpdate) return this.languageService.translate('dashboard.camouflage.never');
    
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

  sortedProtocols = computed(() => {
      const usage = this.core.protocolUsage();
      // FIX: Explicitly cast to Number to prevent potential type errors during sorting.
      return Object.entries(usage).sort((a, b) => Number(b[1]) - Number(a[1]));
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
      // Safely read signals for effect triggering
      const transferRate = this.core.transferRateMbps();
      const jobStatus = this.core.camouflageJobStatus();
      const jitter = this.core.jitterMs();
      const latency = this.core.activeStrategy().latencyMs;
      
      // Execute chart updates safely
      untracked(() => {
          this.updateChartData(transferRate, jobStatus);
          this.updateStabilityData(latency, jitter);
      });
    });
  }

  ngOnInit(): void {
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
  
  async analyzeLogs() {
      this.isAnalyzingLogs.set(true);
      this.showAiAnalysisModal.set(true);
      this.aiAnalysisResult.set('');
      this.aiAnalysisError.set('');

      try {
          const result = await this.core.analyzeLogsWithAi(this.core.logs());
          this.aiAnalysisResult.set(result);
      } catch (e) {
          console.error(e);
          this.aiAnalysisError.set(this.languageService.translate('dashboard.ai.analysisError'));
      } finally {
          this.isAnalyzingLogs.set(false);
      }
  }

  private initCharts(): void {
    const Chart = (window as any).Chart;
    if (!Chart) return;
    
    // 1. Throughput Chart
    const ctx = (document.getElementById('trafficChart') as HTMLCanvasElement)?.getContext('2d');
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
    const ctx2 = (document.getElementById('stabilityChart') as HTMLCanvasElement)?.getContext('2d');
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
    
    const realTraffic = transferRate + (Math.random() * 20 - 10);
    this.chart.data.datasets[0].data.shift();
    this.chart.data.datasets[0].data.push(Math.max(0, realTraffic));
    
    let camouflageTraffic = 0;
    if(jobStatus === 'RUNNING') {
        camouflageTraffic = Math.random() * 50 + 20;
    }
    this.chart.data.datasets[1].data.shift();
    this.chart.data.datasets[1].data.push(camouflageTraffic);

    requestAnimationFrame(() => {
        if(this.chart) this.chart.update('quiet');
    });
  }

  private updateStabilityData(latency: number, jitter: number): void {
      if(!this.stabilityChart) return;

      const currentLatency = latency + (Math.random() * 5 - 2.5);
      this.stabilityChart.data.datasets[0].data.shift();
      this.stabilityChart.data.datasets[0].data.push(currentLatency);

      this.stabilityChart.data.datasets[1].data.shift();
      this.stabilityChart.data.datasets[1].data.push(jitter);

      requestAnimationFrame(() => {
          if(this.stabilityChart) this.stabilityChart.update('quiet');
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
