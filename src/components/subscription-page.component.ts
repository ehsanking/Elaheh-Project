import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElahehCoreService, User } from '../services/elaheh-core.service';
import QRCode from 'qrcode';

@Component({
  selector: 'app-subscription-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-100 font-sans p-6">
      <div class="max-w-2xl mx-auto">
        @if (user()) {
            <div class="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                <div class="bg-teal-900/30 p-6 border-b border-gray-700">
                    <h1 class="text-2xl font-bold text-white mb-2">Welcome, {{ user()?.username }}</h1>
                    <div class="flex gap-4 text-sm text-gray-300">
                        <span>Traffic: {{ user()?.usedGb }} / {{ user()?.quotaGb }} GB</span>
                        <span>Expires: {{ user()?.expiryDays }} Days</span>
                    </div>
                </div>
                
                <div class="p-6 space-y-6">
                    @for (link of user()?.links; track link.alias) {
                        <div class="bg-black/30 rounded-lg border border-gray-700 p-4">
                            <div class="flex justify-between items-center mb-3">
                                <span class="font-bold text-teal-400">{{ link.alias }}</span>
                                <span class="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 uppercase">{{ getProtocol(link.url) }}</span>
                            </div>
                            <div class="flex gap-3">
                                <button (click)="copyLink(link.url)" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm font-bold transition-colors">
                                    Copy Link
                                </button>
                                <button (click)="showQr(link.url, link.alias)" class="bg-gray-700 hover:bg-gray-600 text-white px-4 rounded transition-colors">
                                    QR
                                </button>
                            </div>
                        </div>
                    }
                </div>
                
                <div class="bg-gray-900 p-4 text-center text-xs text-gray-500">
                    Powered by Project Elaheh v1.0.0
                </div>
            </div>
        } @else {
            <div class="text-center mt-20">
                <h1 class="text-4xl font-bold text-gray-700">Invalid Subscription Link</h1>
            </div>
        }
      </div>

      <!-- QR Modal -->
      @if (qrData()) {
          <div class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" (click)="qrData.set(null)">
              <div class="bg-white p-4 rounded-xl" (click)="$event.stopPropagation()">
                  <img [src]="qrData()" class="w-64 h-64">
                  <div class="text-center text-black font-bold mt-2">{{ qrTitle() }}</div>
              </div>
          </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionPageComponent implements OnInit {
    core = inject(ElahehCoreService);
    user = signal<User | undefined>(undefined);
    qrData = signal<string | null>(null);
    qrTitle = signal('');

    ngOnInit() {
        // In a real app, we'd use ActivatedRoute to get the ID. 
        // Here we simulate by taking the first user for demo purposes or handling via state.
        this.user.set(this.core.users()[0]); 
    }

    getProtocol(url: string) {
        if (url.startsWith('vmess')) return 'vmess';
        if (url.startsWith('vless')) return 'vless';
        return 'unknown';
    }

    copyLink(url: string) {
        navigator.clipboard.writeText(url);
        alert('Copied!');
    }

    async showQr(url: string, title: string) {
        try {
            const data = await QRCode.toDataURL(url, { width: 300 });
            this.qrData.set(data);
            this.qrTitle.set(title);
        } catch(e) {}
    }
}