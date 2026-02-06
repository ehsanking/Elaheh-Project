
import { Component, inject, OnInit, signal, ChangeDetectionStrategy, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElahehCoreService, User } from '../services/elaheh-core.service';
import { toDataURL } from 'qrcode';

@Component({
  selector: 'app-subscription-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-100 font-sans p-6">
      <div class="max-w-2xl mx-auto">
        @if (user()) {
            <div class="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                <div class="p-6 border-b border-gray-700">
                    <div class="flex flex-col md:flex-row gap-6 items-center">
                        <div class="w-32 h-32 flex-shrink-0">
                            <canvas id="usageChart"></canvas>
                        </div>
                        <div class="flex-1">
                            <h1 class="text-2xl font-bold text-white mb-2">Welcome, {{ user()?.username }}</h1>
                            <div class="flex flex-col md:flex-row gap-x-4 gap-y-1 text-sm text-gray-300">
                                <span>Traffic: {{ user()?.usedGb | number:'1.2-2' }} / {{ user()?.quotaGb }} GB</span>
                                <span>Expires: {{ user()?.expiryDays }} Days</span>
                                <span class="flex items-center gap-2">Status: 
                                    <span class="px-2 py-0.5 rounded-full text-xs font-bold" 
                                        [class.bg-green-900]="user()?.status === 'active'" [class.text-green-300]="user()?.status === 'active'"
                                        [class.bg-yellow-900]="user()?.status === 'expired'" [class.text-yellow-300]="user()?.status === 'expired'"
                                        [class.bg-red-900]="user()?.status === 'banned'" [class.text-red-300]="user()?.status === 'banned'">
                                        {{ user()?.status }}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="p-6 space-y-6">
                    @for (link of user()?.links; track link.alias) {
                        <div class="bg-black/30 rounded-lg border border-gray-700 p-4 transition-colors hover:border-teal-500/50">
                            <div class="flex justify-between items-center mb-3">
                                <div>
                                    <span class="font-bold text-teal-400 block">{{ link.alias }}</span>
                                    <span class="text-xs text-gray-500">{{ link.description }}</span>
                                </div>
                                <span class="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 uppercase font-mono">{{ link.protocol }}</span>
                            </div>
                            <div class="flex gap-3">
                                <button (click)="copyLink(link.url)" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm font-bold transition-colors border border-gray-600">
                                    Copy Link
                                </button>
                                <button (click)="showQr(link.url, link.alias)" class="bg-gray-700 hover:bg-gray-600 text-white px-4 rounded transition-colors border border-gray-600">
                                    QR
                                </button>
                            </div>
                        </div>
                    }
                </div>
                
                <div class="bg-gray-900 p-4 text-center text-xs text-gray-500 border-t border-gray-700">
                    <p class="mb-2 uppercase font-bold tracking-widest">Download Official Apps</p>
                    <div class="flex justify-center gap-4 flex-wrap">
                        <a href="https://play.google.com/store/apps/details?id=com.adguard.trusttunnel" target="_blank" class="text-blue-400 hover:underline">TrustTunnel</a>
                        <a href="https://openvpn.net/client-connect-vpn-for-windows/" target="_blank" class="text-blue-400 hover:underline">OpenVPN</a>
                        <a href="https://download.wireguard.com/windows-client/wireguard-installer.exe" target="_blank" class="text-blue-400 hover:underline">WireGuard</a>
                        <a href="https://play.google.com/store/apps/details?id=app.hiddify.com" target="_blank" class="text-blue-400 hover:underline">Hiddify</a>
                    </div>
                </div>
            </div>
        } @else {
            <div class="text-center mt-20 p-8 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl">
                <h1 class="text-3xl font-bold text-white mb-2">Subscription Not Found</h1>
                <p class="text-gray-400">Please check your link or contact support.</p>
                <div class="mt-6 text-sm text-gray-600">ID: {{ urlId() }}</div>
            </div>
        }
      </div>

      <!-- QR Modal -->
      @if (qrData()) {
          <div class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm" (click)="qrData.set(null)">
              <div class="bg-white p-6 rounded-xl shadow-2xl" (click)="$event.stopPropagation()">
                  <img [src]="qrData()" class="w-64 h-64 mix-blend-multiply">
                  <div class="text-center text-black font-bold mt-4">{{ qrTitle() }}</div>
                  <button (click)="qrData.set(null)" class="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded font-bold">Close</button>
              </div>
          </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionPageComponent implements OnInit, AfterViewInit, OnDestroy {
    core = inject(ElahehCoreService);
    user = signal<User | undefined>(undefined);
    qrData = signal<string | null>(null);
    qrTitle = signal('');
    urlId = signal('');
    private chart: any;

    ngOnInit() {
        const parts = window.location.href.split('/sub/');
        const id = parts.length > 1 ? parts[1] : '';
        this.urlId.set(id);

        if (id) {
            const found = this.core.users().find(u => u.id === id);
            if (found) this.user.set(found);
        }
        
        if (!this.user() && this.core.users().length > 0) {
            this.user.set(this.core.users()[0]);
        }
    }

    ngAfterViewInit(): void {
        if (this.user()) {
            this.loadChartScript();
        }
    }
    
    ngOnDestroy(): void {
        if (this.chart) {
            this.chart.destroy();
        }
    }

    loadChartScript() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => this.initChart();
        if((window as any).Chart) {
            this.initChart();
        } else {
            document.head.appendChild(script);
        }
    }

    initChart() {
        const Chart = (window as any).Chart;
        if (!Chart || !this.user()) return;
        
        const ctx = (document.getElementById('usageChart') as HTMLCanvasElement)?.getContext('2d');
        if (ctx) {
            const userData = this.user()!;
            const used = userData.usedGb;
            const quota = userData.quotaGb;
            const remaining = Math.max(0, quota - used);
            const usedPercent = (used / quota * 100).toFixed(1);

            const data = {
                labels: ['Used', 'Remaining'],
                datasets: [{
                    data: [used, remaining],
                    backgroundColor: ['#2dd4bf', '#374151'], // Teal, Gray
                    borderColor: '#1f2937',
                    borderWidth: 4,
                    hoverOffset: 4
                }]
            };

            this.chart = new Chart(ctx, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false },
                        title: {
                            display: true,
                            text: `${usedPercent}%`,
                            position: 'bottom',
                            color: '#e5e7eb',
                            font: { size: 24, weight: 'bold', family: 'monospace' }
                        }
                    }
                }
            });
        }
    }

    copyLink(url: string) {
        navigator.clipboard.writeText(url).then(() => {
            alert('Link Copied!');
        });
    }

    async showQr(url: string, title: string) {
        try {
            const data = await toDataURL(url, { width: 300, margin: 2 });
            this.qrData.set(data);
            this.qrTitle.set(title);
        } catch(e) {
            console.error('QR Gen Error', e);
        }
    }
}
