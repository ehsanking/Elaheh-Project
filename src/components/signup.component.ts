import { Component, inject, signal, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
         <div class="absolute top-10 left-10 w-64 h-64 bg-teal-500 rounded-full blur-[100px]"></div>
         <div class="absolute bottom-10 right-10 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
      </div>
      <div class="bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 z-10">
        @if(submitted()) {
          <div class="text-center">
            <h2 class="text-2xl font-bold text-teal-400 mb-4">{{ languageService.translate('signup.successTitle') }}</h2>
            <p class="text-gray-300 mb-6">{{ languageService.translate('signup.successMessage') }}</p>
            <button (click)="backToHome.emit()" class="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors">
              {{ languageService.translate('signup.backButton') }}
            </button>
          </div>
        } @else {
          <h2 class="text-2xl font-bold text-white mb-2 text-center">{{ languageService.translate('signup.title') }}</h2>
          <p class="text-sm text-gray-400 mb-6 text-center">{{ languageService.translate('signup.description') }}</p>
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-gray-400 text-xs uppercase font-bold mb-2">{{ languageService.translate('signup.form.name') }}</label>
              <input formControlName="name" type="text" class="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-all">
            </div>
            <div>
              <label class="block text-gray-400 text-xs uppercase font-bold mb-2">{{ languageService.translate('signup.form.email') }}</label>
              <input formControlName="email" type="email" class="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-all">
            </div>
            <div>
              <label class="block text-gray-400 text-xs uppercase font-bold mb-2">{{ languageService.translate('signup.form.reason') }}</label>
              <textarea formControlName="reason" rows="3" class="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-all"></textarea>
            </div>
            <div class="flex items-center justify-between pt-2">
              <button type="button" (click)="backToHome.emit()" class="text-sm text-gray-400 hover:text-white">{{ languageService.translate('common.cancel') }}</button>
              <button type="submit" [disabled]="signupForm.invalid" class="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg disabled:opacity-50 transition-all">
                {{ languageService.translate('signup.form.submit') }}
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent {
  languageService = inject(LanguageService);
  fb: FormBuilder = inject(FormBuilder);
  
  @Output() backToHome = new EventEmitter<void>();

  submitted = signal(false);

  signupForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    reason: ['', Validators.required],
  });

  onSubmit() {
    if (this.signupForm.valid) {
      // In a real app, this would send data to a server.
      // Here, we just simulate the success state.
      console.log('Signup form submitted:', this.signupForm.value);
      this.submitted.set(true);
    }
  }
}
