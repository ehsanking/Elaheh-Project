
import { Component, inject, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { ElahehCoreService } from './services/elaheh-core.service';
import { LanguageService } from './services/language.service';
import { LoginComponent } from './components/login.component';
import { SetupWizardComponent } from './components/setup-wizard.component';
import { DashboardComponent } from './components/dashboard.component';
import { UserManagementComponent } from './components/user-management.component';
import { SettingsComponent } from './components/settings.component';
import { CommonModule } from '@angular/common';
import { StorefrontComponent } from './components/storefront.component';
import { SignupComponent } from './components/signup.component';
import { LogoComponent } from './components/logo.component';
import { NotFoundComponent } from './components/not-found.component';
import { SubscriptionPageComponent } from './components/subscription-page.component';
import { UpstreamDashboardComponent } from './components/upstream-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent, SetupWizardComponent, DashboardComponent, UserManagementComponent, SettingsComponent, CommonModule, StorefrontComponent, SignupComponent, LogoComponent, NotFoundComponent, SubscriptionPageComponent, UpstreamDashboardComponent],
  templateUrl: './app.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);

  currentView = signal<'dashboard' | 'users' | 'settings'>('dashboard');
  showLangDropdown = signal(false);
  
  // State for Iran server's distinct UI flow
  iranView = signal<'public' | 'login' | 'signup' | 'status'>('public');
  
  // Special State for Subscription Page
  isSubscriptionView = signal(false);
  
  // State for Login Modal on external server
  showLoginModal = signal(false);

  constructor() {
    effect(() => {
      // Check URL for sub link (Simulation)
      if (window.location.href.includes('/sub/')) {
          this.isSubscriptionView.set(true);
      }

      // When admin logs in on Iran server, switch to the status view
      if (this.core.isAuthenticated() && this.core.serverRole() === 'iran') {
        this.iranView.set('status');
      }
    });
  }

  setView(view: 'dashboard' | 'users' | 'settings') {
    this.currentView.set(view);
  }

  logout() {
    this.core.isAuthenticated.set(false);
    if (this.core.serverRole() === 'iran') {
      this.iranView.set('public');
    } else {
      location.reload(); 
    }
  }

  setLanguage(lang: 'en' | 'fa' | 'zh' | 'ru') {
    this.languageService.setLanguage(lang);
    this.showLangDropdown.set(false);
  }
}
