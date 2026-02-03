import { Component, inject, signal, computed, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ElahehCoreService, Product, Order, PaymentGateway } from '../services/elaheh-core.service';
import { LanguageService, Language } from '../services/language.service';
import { LogoComponent } from './logo.component';

@Component({
  selector: 'app-storefront',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LogoComponent],
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans relative overflow-x-hidden">
      
      <!-- Background Elements -->
      <div class="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-teal-900/20 to-gray-900 z-0"></div>
      <div class="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl z-0"></div>

      <!-- Header -->
      <header class="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 text-teal-400">
              <app-logo></app-logo>
            </div>
            <span class="text-xl font-bold tracking-tight text-white">ELAHEH <span class="text-teal-500">VPN</span></span>
          </div>
          <div class="flex items-center gap-4">
             <div class="relative">
                <button (click)="showLangDropdown.set(!showLangDropdown())" class="text-gray-400 hover:text-white text-sm font-medium flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                    {{ languageService.getCurrentLanguageName() }}
                </button>
                @if(showLangDropdown()) {
                  <div class="fixed inset-0 z-20" (click)="showLangDropdown.set(false)"></div>
                  <div class="absolute top-full right-0 mt-2 w-36 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-30">
                    <button (click)="setLanguage('en')" class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2">🇬🇧 English</button>
                    <button (click)="setLanguage('fa')" class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2">🇮🇷 فارسی</button>
                    <button (click)="setLanguage('zh')" class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2">🇨🇳 中文</button>
                    <button (click)="setLanguage('ru')" class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2">🇷🇺 Русский</button>
                  </div>
                }
             </div>
             <button (click)="loginRequest.emit()" class="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-bold border border-gray-700 transition-colors">
                Manager Login
             </button>
          </div>
        </nav>
      </header>

      <main class="flex-1 container mx-auto px-6 py-12 z-10">
        
        @if (viewMode() === 'products') {
            <!-- Hero -->
            <div class="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 class="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                {{ languageService.translate('store.heroTitle') }}
            </h1>
            <p class="text-xl text-gray-400 max-w-2xl mx-auto">
                {{ languageService.translate('store.heroDesc') }}
            </p>
            </div>

            <!-- Products Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            @for (product of core.products(); track product.id) {
                <div class="bg-gray-800 rounded-2xl border border-gray-700 p-8 flex flex-col relative group hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-900/20">
                @if (product.highlight) {
                    <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg uppercase tracking-wider">
                    {{ languageService.translate('store.bestValue') }}
                    </div>
                }
                
                <h3 class="text-2xl font-bold text-white mb-2">{{ product.title }}</h3>
                <div class="text-sm text-gray-400 mb-6">{{ product.description }}</div>
                
                <div class="text-4xl font-extrabold text-white mb-1">
                    {{ product.price | number }} <span class="text-lg font-normal text-gray-500">{{ product.currency }}</span>
                </div>
                <div class="text-sm text-gray-500 mb-8">{{ product.durationDays }} Days</div>

                <ul class="space-y-4 mb-8 flex-1">
                    @for (feature of product.features; track feature) {
                    <li class="flex items-center gap-3 text-gray-300">
                        <svg class="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                        {{ feature }}
                    </li>
                    }
                </ul>

                <button (click)="openCheckout(product)" class="w-full bg-white text-gray-900 hover:bg-teal-50 font-bold py-4 rounded-xl transition-colors">
                    {{ languageService.translate('store.buy') }}
                </button>
                </div>
            }
            </div>
        }

        @if (viewMode() === 'checkout' && selectedProduct()) {
            <div class="max-w-md mx-auto bg-gray-800 rounded-2xl border border-gray-700 p-8 animate-in zoom-in-95 duration-300">
                <button (click)="viewMode.set('products')" class="text-gray-400 hover:text-white mb-6 flex items-center gap-2 text-sm">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Store
                </button>

                <h2 class="text-2xl font-bold text-white mb-6">{{ languageService.translate('store.checkoutTitle') }}</h2>
                
                <div class="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-800 flex justify-between items-center">
                    <div>
                        <div class="font-bold text-white">{{ selectedProduct()!.title }}</div>
                        <div class="text-sm text-gray-400">{{ selectedProduct()!.durationDays }} Days</div>
                    </div>
                    <div class="text-teal-400 font-bold">{{ selectedProduct()!.price | number }} {{ selectedProduct()!.currency }}</div>
                </div>

                <form [formGroup]="checkoutForm" (ngSubmit)="processPayment()" class="space-y-6">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-2">{{ languageService.translate('store.contactInfo') }}</label>
                        <div class="space-y-3">
                            <input formControlName="email" type="email" class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 outline-none transition-colors" [placeholder]="languageService.translate('common.email')">
                            <input formControlName="telegram" type="text" class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 outline-none transition-colors" [placeholder]="languageService.translate('common.telegram')">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-2">{{ languageService.translate('store.paymentMethod') }}</label>
                        <div class="grid grid-cols-2 gap-3">
                            @for (gateway of activeGateways(); track gateway.id) {
                                <label class="cursor-pointer">
                                    <input type="radio" formControlName="gateway" [value]="gateway.id" class="peer sr-only">
                                    <div class="flex items-center justify-center p-3 rounded-lg border border-gray-700 bg-gray-900 hover:bg-gray-800 peer-checked:border-teal-500 peer-checked:bg-teal-900/20 transition-all gap-2">
                                        <img [src]="gateway.logo" [alt]="gateway.name" class="h-6 w-6 object-contain rounded-full bg-white p-0.5">
                                        <span class="text-sm font-medium text-gray-300">{{ gateway.name }}</span>
                                    </div>
                                </label>
                            }
                        </div>
                    </div>

                    <button type="submit" [disabled]="checkoutForm.invalid || isProcessing()" class="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        @if (isProcessing()) {
                            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            {{ languageService.translate('store.processing') }}
                        } @else {
                            {{ languageService.translate('store.pay') }} {{ selectedProduct()!.price | number }} {{ selectedProduct()!.currency }}
                        }
                    </button>
                </form>
            </div>
        }

        @if (viewMode() === 'receipt' && currentOrder()) {
            <div class="max-w-md mx-auto bg-gray-800 rounded-2xl border border-gray-700 p-8 text-center animate-in zoom-in-95">
                @if (currentOrder()!.status === 'PAID') {
                    <div class="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 class="text-2xl font-bold text-white mb-2">{{ languageService.translate('store.successTitle') }}</h2>
                    <p class="text-gray-400 mb-6">{{ languageService.translate('store.successDesc') }}</p>
                    
                    <div class="bg-black/50 p-4 rounded-lg mb-6 text-left">
                        <div class="flex justify-between text-sm mb-2"><span class="text-gray-500">{{ languageService.translate('common.trackId') }}</span><span class="text-white font-mono">{{ currentOrder()!.transactionId }}</span></div>
                        <div class="flex justify-between text-sm"><span class="text-gray-500">{{ languageService.translate('common.username') }}</span><span class="text-white font-mono">u_{{ currentOrder()!.id }}</span></div>
                    </div>

                    <label class="block text-left text-xs font-bold text-gray-500 uppercase mb-2">{{ languageService.translate('common.subLink') }}</label>
                    <div class="flex gap-2">
                        <input type="text" readonly [value]="currentOrder()!.generatedSubLink" class="w-full bg-gray-900 border border-gray-700 rounded p-3 text-teal-400 font-mono text-xs">
                        <button (click)="copyLink(currentOrder()!.generatedSubLink!)" class="bg-gray-700 hover:bg-gray-600 text-white px-4 rounded font-bold text-sm">{{ languageService.translate('common.copy') }}</button>
                    </div>
                    
                    <button (click)="viewMode.set('products')" class="mt-8 text-gray-400 hover:text-white text-sm">Return to Store</button>

                } @else {
                    <div class="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <h2 class="text-2xl font-bold text-white mb-2">{{ languageService.translate('store.failTitle') }}</h2>
                    <p class="text-gray-400 mb-6">{{ languageService.translate('store.failDesc') }}</p>
                    <button (click)="viewMode.set('checkout')" class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">{{ languageService.translate('store.retry') }}</button>
                }
            </div>
        }

      </main>

      <footer class="border-t border-gray-800 bg-gray-900 py-8 text-center text-gray-600 text-sm">
        &copy; 2024 Elaheh VPN Store. Secure Freedom.
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorefrontComponent {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);
  fb: FormBuilder = inject(FormBuilder);

  @Output() loginRequest = new EventEmitter<void>();

  showLangDropdown = signal(false);
  viewMode = signal<'products' | 'checkout' | 'receipt'>('products');
  selectedProduct = signal<Product | null>(null);
  currentOrder = signal<Order | null>(null);
  isProcessing = signal(false);

  checkoutForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    telegram: ['', Validators.required],
    gateway: ['', Validators.required]
  });

  activeGateways = computed(() => this.core.paymentGateways().filter(g => g.isEnabled));

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
        // In real app, this would be a redirect to URL, then back to /callback
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