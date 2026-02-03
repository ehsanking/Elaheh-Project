import { Component, inject, signal, computed, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ElahehCoreService, Product, Order } from '../services/elaheh-core.service';
import { LanguageService, Language } from '../services/language.service';
import { LogoComponent } from './logo.component';
import { TermsComponent } from './terms.component';

@Component({
  selector: 'app-storefront',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LogoComponent, TermsComponent],
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans relative overflow-x-hidden" [dir]="languageService.currentLang() === 'fa' ? 'rtl' : 'ltr'">
      
      @if (showTerms()) {
          <app-terms (close)="showTerms.set(false)"></app-terms>
      } @else {

      <!-- Header -->
      <header class="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
            @if(core.brandLogo()) {
                <img [src]="core.brandLogo()" class="w-10 h-10 object-contain rounded-full bg-white/10 p-1">
            } @else {
                <div class="w-10 h-10 text-teal-400"><app-logo></app-logo></div>
            }
            <span class="text-xl font-bold tracking-tight text-white">{{ core.brandName() }}</span>
          </div>
          <div class="flex items-center gap-3">
             <button (click)="loginRequest.emit()" class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-teal-900/20">
                {{ languageService.translate('login.authenticate') }}
             </button>
          </div>
        </nav>
      </header>

      <main class="flex-1 z-10 pb-20">
        
        @if (viewMode() === 'products') {
            <!-- Hero -->
            <div class="relative py-20 px-6 text-center bg-gradient-to-b from-gray-800 to-gray-900">
                <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <h1 class="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight max-w-4xl mx-auto">
                    {{ languageService.translate('store.heroTitle') }}
                </h1>
                <p class="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                    {{ languageService.translate('store.heroDesc') }}
                </p>
                
                <!-- Sanctioned Apps Carousel -->
                <div class="mt-12 overflow-hidden relative max-w-5xl mx-auto group">
                    <p class="text-xs text-gray-500 uppercase tracking-widest mb-4 font-bold">{{ languageService.translate('store.sanctionedApps') }}</p>
                    <!-- Infinite Scroll Effect -->
                    <div class="flex overflow-hidden space-x-8 group-hover:pause">
                        <div class="flex space-x-8 animate-marquee whitespace-nowrap opacity-60 grayscale hover:grayscale-0 transition-all duration-500 items-center">
                             <!-- Binance Logo -->
                             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Binance_Logo.png/1280px-Binance_Logo.png?20201023063027" alt="Binance" class="h-10 mx-4 inline-block object-contain">
                             <img src="https://img.icons8.com/color/48/amazon-web-services.png" alt="AWS" class="w-12 h-12 mx-4 inline-block">
                             <img src="https://img.icons8.com/color/48/docker.png" alt="Docker" class="w-12 h-12 mx-4 inline-block">
                             <img src="https://img.icons8.com/color/48/spotify--v1.png" alt="Spotify" class="w-12 h-12 mx-4 inline-block">
                             <img src="https://img.icons8.com/color/48/adobe-creative-cloud--v1.png" alt="Adobe" class="w-12 h-12 mx-4 inline-block">
                             <img src="https://img.icons8.com/color/48/paypal.png" alt="PayPal" class="w-12 h-12 mx-4 inline-block">
                             <img src="https://img.icons8.com/color/48/gitlab.png" alt="GitLab" class="w-12 h-12 mx-4 inline-block">
                             <img src="https://img.icons8.com/color/48/google-cloud.png" alt="GCP" class="w-12 h-12 mx-4 inline-block">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Products Grid -->
            <div class="container mx-auto px-6 -mt-10">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                @for (product of core.products(); track product.id) {
                    <div class="bg-gray-800 rounded-2xl border border-gray-700 p-8 flex flex-col relative group hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-900/20">
                    @if (product.highlight) {
                        <div class="absolute -top-4 right-1/2 translate-x-1/2 bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg uppercase tracking-wider whitespace-nowrap">
                        {{ languageService.translate('store.bestValue') }}
                        </div>
                    }
                    
                    <h3 class="text-xl font-bold text-white mb-2 text-center">{{ product.title }}</h3>
                    <div class="text-sm text-gray-400 mb-6 text-center">{{ product.description }}</div>
                    
                    <div class="text-3xl font-extrabold text-white mb-2 text-center text-teal-400">
                        {{ product.price | number }} <span class="text-base font-normal text-gray-500">{{ core.currency() }}</span>
                    </div>
                    <div class="text-center text-sm text-gray-500 mb-8 border-b border-gray-700 pb-4">{{ product.durationDays }} {{ languageService.translate('common.duration') }} / {{ product.trafficGb }} GB</div>

                    <ul class="space-y-3 mb-8 flex-1">
                        @for (feature of product.features; track feature) {
                        <li class="flex items-center gap-3 text-gray-300 text-sm">
                            <svg class="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                            {{ feature }}
                        </li>
                        }
                    </ul>

                    <button (click)="openCheckout(product)" class="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg">
                        {{ languageService.translate('store.buy') }}
                    </button>
                    </div>
                }
                </div>
            </div>
        }

        @if (viewMode() === 'checkout' && selectedProduct()) {
            <div class="max-w-md mx-auto bg-gray-800 rounded-2xl border border-gray-700 p-8 mt-10 animate-in zoom-in-95 duration-300 shadow-2xl">
                <button (click)="viewMode.set('products')" class="text-gray-400 hover:text-white mb-6 flex items-center gap-2 text-sm">
                    <svg class="w-4 h-4 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    {{ languageService.translate('common.back') }}
                </button>

                <h2 class="text-xl font-bold text-white mb-6 text-center border-b border-gray-700 pb-4">{{ languageService.translate('store.checkoutTitle') }}</h2>
                
                <div class="bg-gray-900/50 p-4 rounded-lg mb-6 border border-gray-800 flex justify-between items-center">
                    <div>
                        <div class="font-bold text-white text-sm">{{ selectedProduct()!.title }}</div>
                        <div class="text-xs text-gray-400">{{ selectedProduct()!.durationDays }} Days</div>
                    </div>
                    <div class="text-teal-400 font-bold">{{ selectedProduct()!.price | number }} {{ core.currency() }}</div>
                </div>

                <form [formGroup]="checkoutForm" (ngSubmit)="processPayment()" class="space-y-5">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 mb-2">{{ languageService.translate('store.contactInfo') }}</label>
                        <div class="space-y-3">
                            <input formControlName="email" type="email" class="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-teal-500 outline-none transition-colors text-left" [placeholder]="languageService.translate('common.email')">
                            <input formControlName="telegram" type="text" class="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-teal-500 outline-none transition-colors text-left" [placeholder]="languageService.translate('common.telegram')">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-500 mb-2">{{ languageService.translate('store.paymentMethod') }}</label>
                        <div class="grid grid-cols-2 gap-3">
                            @for (gateway of activeGateways(); track gateway.id) {
                                <label class="cursor-pointer">
                                    <input type="radio" formControlName="gateway" [value]="gateway.id" class="peer sr-only">
                                    <div class="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-600 bg-gray-900 hover:bg-gray-800 peer-checked:border-teal-500 peer-checked:bg-teal-900/20 transition-all gap-2 h-24">
                                        <img [src]="gateway.logo" [alt]="gateway.name" class="h-8 object-contain">
                                        <span class="text-xs font-medium text-gray-300">{{ gateway.name }}</span>
                                        @if(gateway.merchantId) {
                                            <span class="text-[10px] text-green-400">Verified</span>
                                        }
                                    </div>
                                </label>
                            }
                        </div>
                        @if(activeGateways().length === 0) {
                            <p class="text-red-400 text-xs mt-2">No active payment gateways.</p>
                        }
                    </div>

                    <button type="submit" [disabled]="checkoutForm.invalid || isProcessing() || activeGateways().length === 0" class="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        @if (isProcessing()) {
                            <span class="text-sm">{{ languageService.translate('store.processing') }}</span>
                        } @else {
                            {{ languageService.translate('common.pay') }}
                        }
                    </button>
                </form>
            </div>
        }

        @if (viewMode() === 'receipt' && currentOrder()) {
            <div class="max-w-md mx-auto bg-gray-800 rounded-2xl border border-gray-700 p-8 text-center animate-in zoom-in-95 mt-10">
                @if (currentOrder()!.status === 'PAID') {
                    <div class="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 class="text-xl font-bold text-white mb-2">{{ languageService.translate('store.successTitle') }}</h2>
                    <p class="text-gray-400 mb-6 text-sm">{{ languageService.translate('store.successDesc') }}</p>
                    
                    <div class="bg-black/50 p-4 rounded-lg mb-6 text-right">
                        <div class="flex justify-between text-xs mb-2"><span class="text-gray-500">{{ languageService.translate('common.trackId') }}</span><span class="text-white font-mono">{{ currentOrder()!.transactionId }}</span></div>
                        <div class="flex justify-between text-xs"><span class="text-gray-500">{{ languageService.translate('common.username') }}</span><span class="text-white font-mono">u_{{ currentOrder()!.id }}</span></div>
                    </div>

                    <label class="block text-right text-xs font-bold text-gray-500 mb-2">{{ languageService.translate('common.subLink') }}</label>
                    <div class="flex gap-2 direction-ltr">
                        <button (click)="copyLink(currentOrder()!.generatedSubLink!)" class="bg-gray-700 hover:bg-gray-600 text-white px-4 rounded font-bold text-xs">{{ languageService.translate('common.copy') }}</button>
                        <input type="text" readonly [value]="currentOrder()!.generatedSubLink" class="flex-1 bg-gray-900 border border-gray-700 rounded p-3 text-teal-400 font-mono text-xs text-left">
                    </div>
                    
                    <button (click)="viewMode.set('products')" class="mt-8 text-gray-400 hover:text-white text-sm underline">{{ languageService.translate('common.back') }}</button>

                } @else {
                    <div class="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <h2 class="text-xl font-bold text-white mb-2">{{ languageService.translate('store.failTitle') }}</h2>
                    <p class="text-gray-400 mb-6 text-sm">{{ languageService.translate('store.failDesc') }}</p>
                    <button (click)="viewMode.set('checkout')" class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg text-sm">{{ languageService.translate('store.retry') }}</button>
                }
            </div>
        }

      </main>

      <footer class="border-t border-gray-800 bg-gray-900 py-10 mt-auto">
        <div class="container mx-auto px-6 text-center">
            
            <!-- Trust Badges Row -->
            <div class="flex flex-wrap justify-center gap-8 mb-8 items-center">
                <!-- Danesh Bonyan -->
                <div class="bg-white rounded-xl p-2 w-24 h-24 flex items-center justify-center shadow-lg shadow-white/5 opacity-80 hover:opacity-100 transition-opacity">
                    <img src="https://www.orummachine.com/wp-content/uploads/2023/09/header_logo-copy-856x1024.png" alt="Danesh Bonyan" class="max-h-full max-w-full object-contain">
                </div>
                <!-- Park Elm -->
                <div class="bg-white rounded-xl p-2 w-24 h-24 flex items-center justify-center shadow-lg shadow-white/5 opacity-80 hover:opacity-100 transition-opacity">
                    <img src="https://www.orummachine.com/wp-content/uploads/2023/09/park-elm-fanavari.png" alt="Science Park" class="max-h-full max-w-full object-contain">
                </div>
                <!-- ISO 9001 -->
                <div class="bg-white rounded-xl p-2 w-24 h-24 flex items-center justify-center shadow-lg shadow-white/5 opacity-80 hover:opacity-100 transition-opacity">
                    <img src="https://pars.host/wp-content/uploads//2025/06/ISO_9001.png" alt="ISO 9001" class="max-h-full max-w-full object-contain">
                </div>
                 <!-- Anjoman Senfi -->
                <div class="bg-white rounded-xl p-2 w-24 h-24 flex items-center justify-center shadow-lg shadow-white/5 opacity-80 hover:opacity-100 transition-opacity">
                    <img src="https://pars.host/wp-content/uploads//2025/06/anjooman-senfi.png" alt="Tech Association" class="max-h-full max-w-full object-contain">
                </div>
            </div>

            <div class="max-w-2xl mx-auto space-y-2">
                <p class="text-gray-500 text-xs">{{ languageService.translate('store.compliance') }}</p>
                <div class="inline-block border border-red-900/30 bg-red-900/10 px-3 py-1 rounded text-[10px] text-red-300">
                    {{ languageService.translate('store.noIllegal') }}
                </div>
            </div>
            
            <div class="flex justify-center gap-4 text-xs text-gray-600 mt-6">
                <button (click)="showTerms.set(true)" class="hover:text-gray-300 transition-colors underline">{{ languageService.translate('terms.title') }}</button>
                <span>|</span>
                <span>© 1403 {{ core.brandName() }}</span>
            </div>
        </div>
      </footer>
      }
    </div>
  `,
  styles: `
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-100%); }
    }
    .animate-marquee { animation: marquee 20s linear infinite; }
    .group:hover .animate-marquee { animation-play-state: paused; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorefrontComponent implements OnInit {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);
  fb: FormBuilder = inject(FormBuilder);

  @Output() loginRequest = new EventEmitter<void>();

  showLangDropdown = signal(false);
  viewMode = signal<'products' | 'checkout' | 'receipt'>('products');
  selectedProduct = signal<Product | null>(null);
  currentOrder = signal<Order | null>(null);
  isProcessing = signal(false);
  showTerms = signal(false);

  checkoutForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    telegram: ['', Validators.required],
    gateway: ['', Validators.required]
  });

  activeGateways = computed(() => this.core.paymentGateways().filter(g => g.isEnabled));

  ngOnInit() {
      // Force Persian if in Iran mode context by default
      if (this.core.serverRole() === 'iran') {
          this.languageService.setLanguage('fa');
      }
  }

  openCheckout(product: Product) {
    this.selectedProduct.set(product);
    this.viewMode.set('checkout');
    // Pre-select first gateway
    const firstGw = this.activeGateways()[0];
    if (firstGw) {
        this.checkoutForm.patchValue({ gateway: firstGw.id });
    }
  }

  processPayment() {
    if (this.checkoutForm.invalid || !this.selectedProduct()) return;
    
    this.isProcessing.set(true);
    const form = this.checkoutForm.value;
    
    // 1. Create Pending Order
    const order = this.core.createOrder(
        this.selectedProduct()!.id,
        form.email!,
        form.telegram!,
        form.gateway!
    );

    // 2. Simulate Redirect to Gateway (Delay)
    setTimeout(() => {
        // 3. Simulate Successful Callback
        const mockTxId = `TX-${Math.floor(Math.random() * 1000000)}`;
        const completedOrder = this.core.completeOrder(order.id, mockTxId);
        
        this.currentOrder.set(completedOrder);
        this.isProcessing.set(false);
        this.viewMode.set('receipt');
    }, 2500);
  }

  setLanguage(lang: Language) {
    this.languageService.setLanguage(lang);
    this.showLangDropdown.set(false);
  }

  copyLink(link: string) {
    navigator.clipboard.writeText(link);
  }
}