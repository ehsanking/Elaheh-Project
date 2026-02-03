import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <radialGradient id="logo-grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style="stop-color:#2dd4bf;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#logo-grad)" opacity="0.15" />
      <path d="M140 50 L80 50 C60 50 60 70 60 80 L60 120 C60 130 60 150 80 150 L140 150" stroke="currentColor" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M60 100 L120 100" stroke="currentColor" stroke-width="12" stroke-linecap="round" />
      <circle cx="100" cy="100" r="90" stroke="currentColor" stroke-width="4" opacity="0.5" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {}
