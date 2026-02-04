
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElahehCoreService, User } from '../services/elaheh-core.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-subscription-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-100 font-sans p-6">
      <div class="max-w-2xl mx-auto">
        @if (user()) {
            <div class="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                <div class="bg-teal-900/30 p-6 border-b border-gray-700 flex justify-between items-center">
                    <div>
                        <h1 class="text-2xl font-bold text-white mb-2">Welcome, {{ user()?.username }}</h1>
                        <div class="flex gap-4 text-sm text-gray-300">
                            <span>Traffic: {{ user()?.usedGb }} / {{ user()?.quotaGb }} GB</span>
                            <span>Expires: {{ user()?.expiryDays }} Days</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-400 uppercase">Status</div>
                        <div class="text-green-400 font-bold uppercase">{{ user()?.status }}</div>
                    </div>
                </div>
                
                <div class="p-6 space-y-6">
                    @for (link of user()?.links; track link.alias) {
                        <div class="bg-black/30 rounded-lg border border-gray-700 p-4">
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
                    <p class="mb-2">Download Apps</p>
                    <div class="flex justify-center gap-4 flex-wrap">
                        <a href="https://play.google.com/store/apps/details?id=com.adguard.trusttunnel" target="_blank" class="text-blue-400 hover:underline">TrustTunnel</a>
                        <a href="https://openvpn.net/client-connect-vpn-for-windows/" target="_blank" class="text-blue-400 hover:underline">OpenVPN</a>
                        <a href="https://download.wireguard.com/windows-client/wireguard-installer.exe" target="_blank" class="text-blue-400 hover:underline">WireGuard</a>
                        <a href="https://play.google.com/store/apps/details?id=app.hiddify.com" target="_blank" class="text-blue-400 hover:underline">Hiddify</a>
                    </div>
                </div>
            </div>
        } @else {
            <div class="text-center mt-20 p-8 bg-gray-800 rounded-xl border border-gray-700">
                <h1 class="text-3xl font-bold text-white mb-2">Subscription Not Found</h1>
                <p class="text-gray-400">Please check your link or contact support.</p>
            </div>
        }
      </div>

      <!-- QR Modal -->
      @if (qrData()) {
          <div class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" (click)="qrData.set(null)">
              <div class="bg-white p-4 rounded-xl" (click)="$event.stopPropagation()">
                  <img [src]="qrData()" class="w-64 h-64">
                  <div class="text-center text-black font-bold mt-2">{{ qrTitle() }}</div>
                  <button (click)="qrData.set(null)" class="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded">Close</button>
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
        // In a real scenario, read from ActivatedRoute params.
        // For demo/simplicity, if users exist, show the first one to avoid "Empty Page" error.
        if (this.core.users().length > 0) {
            this.user.set(this.core.users()[0]);
        }
    }

    copyLink(url: string) {
        navigator.clipboard.writeText(url).then(() => {
            alert('Link Copied!');
        });
    }

    async showQr(url: string, title: string) {
        try {
            const data = await QRCode.toDataURL(url, { width: 300, margin: 2 });
            this.qrData.set(data);
            this.qrTitle.set(title);
        } catch(e) {
            console.error('QR Gen Error', e);
        }
    }
}
