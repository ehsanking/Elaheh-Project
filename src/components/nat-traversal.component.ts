import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-nat-traversal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-gray-900/50 p-6 rounded-lg border border-gray-700 mt-8">
        <div class="flex items-center gap-3 mb-6 border-b border-gray-700 pb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm0-10h2v8h-2V6z"/>
            </svg>
            <div>
                <h3 class="text-lg font-bold text-gray-200">{{ languageService.translate('settings.nat.title') }}</h3>
                <p class="text-sm text-gray-400">{{ languageService.translate('settings.nat.description') }}</p>
            </div>
        </div>

        <form [formGroup]="natForm" (ngSubmit)="saveConfig()" class="space-y-8">
            
            <!-- Network Matrix (Top Prominent Section) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black rounded-xl border border-gray-800 p-6 shadow-2xl relative overflow-hidden">
                <!-- Abstract Background -->
                <div class="absolute -right-10 -top-10 w-40 h-40 bg-orange-900/20 rounded-full blur-3xl"></div>

                <!-- Column 1: Connection Status -->
                <div class="flex flex-col items-center justify-center p-4 border-r border-gray-800 last:border-r-0">
                    <div class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{{ languageService.translate('settings.nat.status') }}</div>
                    <div class="text-xl font-bold" 
                        [class.text-yellow-400]="core.natStatus() === 'Detecting'"
                        [class.text-green-400]="core.natStatus() === 'Connected'"
                        [class.text-blue-400]="core.natStatus() === 'Relaying'"
                        [class.text-gray-400]="core.natStatus() === 'Idle'">
                        
                        @if(core.natStatus() === 'Detecting') {
                            <span class="flex items-center gap-2">
                                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Detecting...
                            </span>
                        } @else if(core.natStatus() === 'Connected') {
                            <span class="flex items-center gap-2">
                                <span class="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                                Connected
                            </span>
                        } @else {
                            {{ core.natStatus() }}
                        }
                    </div>
                </div>

                <!-- Column 2: NAT Type -->
                <div class="flex flex-col items-center justify-center p-4 border-r border-gray-800 last:border-r-0">
                    <div class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Detected NAT Type</div>
                    <div class="px-3 py-1 rounded-md font-mono text-sm font-bold"
                         [class.bg-green-900]="core.detectedNatType().includes('Full Cone')"
                         [class.text-green-300]="core.detectedNatType().includes('Full Cone')"
                         [class.bg-red-900]="core.detectedNatType().includes('Symmetric')"
                         [class.text-red-300]="core.detectedNatType().includes('Symmetric')"
                         [class.bg-gray-800]="core.detectedNatType() === 'Unknown'"
                         [class.text-gray-400]="core.detectedNatType() === 'Unknown'">
                        {{ core.detectedNatType() }}
                    </div>
                </div>

                <!-- Column 3: Public IP -->
                <div class="flex flex-col items-center justify-center p-4 border-r border-gray-800 last:border-r-0">
                    <div class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Public IP</div>
                    <div class="font-mono text-lg text-teal-400 tracking-wider">
                        {{ core.detectedPublicIp() }}
                    </div>
                </div>
            </div>

            <!-- Action Bar -->
            <div class="flex justify-end">
                 <button type="button" (click)="core.runNatTypeDetection()" class="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-gray-600 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    {{ languageService.translate('settings.nat.detectionBtn') }}
                </button>
            </div>

            <!-- Mode Selection with Detailed Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label class="cursor-pointer group relative">
                    <input type="radio" formControlName="mode" value="STUN" class="peer sr-only">
                    <div class="h-full p-5 rounded-xl border-2 border-gray-700 bg-gray-800 peer-checked:border-orange-500 peer-checked:bg-orange-900/10 transition-all hover:border-gray-600">
                        <div class="font-bold text-lg text-gray-200 group-hover:text-white">{{ languageService.translate('settings.nat.modes.stun') }}</div>
                        <div class="text-xs font-mono text-orange-400 mt-1 mb-3">Direct P2P via UDP</div>
                        <p class="text-xs text-gray-400 leading-relaxed">{{ languageService.translate('settings.nat.modes.stunDesc') }}</p>
                    </div>
                    <div class="absolute top-4 right-4 w-4 h-4 rounded-full border-2 border-gray-600 peer-checked:border-orange-500 peer-checked:bg-orange-500 transition-colors"></div>
                </label>

                <label class="cursor-pointer group relative">
                    <input type="radio" formControlName="mode" value="TURN" class="peer sr-only">
                    <div class="h-full p-5 rounded-xl border-2 border-gray-700 bg-gray-800 peer-checked:border-orange-500 peer-checked:bg-orange-900/10 transition-all hover:border-gray-600">
                        <div class="font-bold text-lg text-gray-200 group-hover:text-white">{{ languageService.translate('settings.nat.modes.turn') }}</div>
                        <div class="text-xs font-mono text-orange-400 mt-1 mb-3">Relay Server (Fallback)</div>
                        <p class="text-xs text-gray-400 leading-relaxed">{{ languageService.translate('settings.nat.modes.turnDesc') }}</p>
                    </div>
                    <div class="absolute top-4 right-4 w-4 h-4 rounded-full border-2 border-gray-600 peer-checked:border-orange-500 peer-checked:bg-orange-500 transition-colors"></div>
                </label>

                <label class="cursor-pointer group relative">
                    <input type="radio" formControlName="mode" value="REVERSE_TUNNEL" class="peer sr-only">
                    <div class="h-full p-5 rounded-xl border-2 border-gray-700 bg-gray-800 peer-checked:border-orange-500 peer-checked:bg-orange-900/10 transition-all hover:border-gray-600">
                        <div class="font-bold text-lg text-gray-200 group-hover:text-white">{{ languageService.translate('settings.nat.modes.reverse') }}</div>
                        <div class="text-xs font-mono text-orange-400 mt-1 mb-3">Active Heartbeat</div>
                        <p class="text-xs text-gray-400 leading-relaxed">{{ languageService.translate('settings.nat.modes.reverseDesc') }}</p>
                    </div>
                    <div class="absolute top-4 right-4 w-4 h-4 rounded-full border-2 border-gray-600 peer-checked:border-orange-500 peer-checked:bg-orange-500 transition-colors"></div>
                </label>
            </div>

            <!-- Configuration Inputs -->
            <div class="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-6">
                <!-- Common Config -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1">{{ languageService.translate('settings.nat.stunServer') }}</label>
                        <input formControlName="stunServer" type="text" class="w-full bg-black/30 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-orange-500 outline-none transition-colors">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1">{{ languageService.translate('settings.nat.keepAlive') }}</label>
                        <input formControlName="keepAliveIntervalSec" type="number" class="w-full bg-black/30 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-orange-500 outline-none transition-colors">
                    </div>
                </div>

                <!-- TURN Specific Config -->
                @if (natForm.get('mode')?.value === 'TURN') {
                    <div class="border-t border-gray-700 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div class="mb-4 text-xs text-yellow-400 flex items-center gap-2 bg-yellow-900/20 p-2 rounded border border-yellow-800 w-fit">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            {{ languageService.translate('settings.nat.warning') }}
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label class="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1">{{ languageService.translate('settings.nat.turnServer') }}</label>
                                <input formControlName="turnServer" type="text" class="w-full bg-black/30 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-orange-500 outline-none transition-colors" placeholder="turn:relay.example.com:3478">
                            </div>
                            <div>
                                <label class="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1">{{ languageService.translate('settings.nat.turnUser') }}</label>
                                <input formControlName="turnUser" type="text" class="w-full bg-black/30 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-orange-500 outline-none transition-colors" placeholder="username">
                            </div>
                            <div>
                                <label class="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1">{{ languageService.translate('settings.nat.turnPass') }}</label>
                                <input formControlName="turnCredential" type="password" class="w-full bg-black/30 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-orange-500 outline-none transition-colors" placeholder="credential/secret">
                            </div>
                        </div>
                    </div>
                }

                <div class="pt-2 border-t border-gray-700 flex justify-between items-center">
                    <label class="flex items-center cursor-pointer group">
                        <div class="relative">
                            <input type="checkbox" formControlName="holePunchingEnabled" class="sr-only peer">
                            <div class="w-10 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </div>
                        <span class="ml-3 text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{{ languageService.translate('settings.nat.holePunching') }}</span>
                    </label>

                    <button type="submit" [disabled]="natForm.invalid" class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg disabled:opacity-50 hover:shadow-orange-900/50">
                        {{ languageService.translate('settings.nat.save') }}
                    </button>
                </div>
            </div>
        </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NatTraversalComponent implements OnInit {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);
  fb: FormBuilder = inject(FormBuilder);

  natForm = this.fb.group({
    mode: ['REVERSE_TUNNEL', Validators.required],
    stunServer: ['stun.l.google.com:19302', Validators.required],
    turnServer: [''],
    turnUser: [''],
    turnCredential: [''],
    keepAliveIntervalSec: [25, [Validators.required, Validators.min(5)]],
    holePunchingEnabled: [true]
  });

  ngOnInit() {
    const config = this.core.natConfig();
    this.natForm.patchValue({
        mode: config.mode,
        stunServer: config.stunServer,
        turnServer: config.turnServer,
        turnUser: config.turnUser,
        turnCredential: config.turnCredential,
        keepAliveIntervalSec: config.keepAliveIntervalSec,
        holePunchingEnabled: config.holePunchingEnabled
    });
  }

  saveConfig() {
    if (this.natForm.valid) {
        this.core.updateNatConfig(this.natForm.value as any);
    }
  }
}