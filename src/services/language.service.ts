
import { Injectable, signal, effect } from '@angular/core';
import { translations } from './translations';

export type Language = 'en' | 'fa' | 'zh' | 'ru';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  currentLang = signal<Language>('en');

  constructor() {
    effect(() => {
      document.documentElement.lang = this.currentLang();
      document.documentElement.dir = this.currentLang() === 'fa' ? 'rtl' : 'ltr';
    });
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
  }

  translate(key: string): any {
    const lang = this.currentLang();
    const keys = key.split('.');
    let result: any = translations[lang];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        return key; // Return key if not found
      }
    }
    return result || key;
  }

  getCurrentLanguageName(): string {
    switch(this.currentLang()) {
        case 'en': return 'English';
        case 'fa': return 'فارسی';
        case 'zh': return '中文';
        case 'ru': return 'Русский';
    }
  }
}
