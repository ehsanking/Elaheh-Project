import { Injectable, signal } from '@angular/core';

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
  senderName: string;
  senderEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  isConfigured = signal(false);
  
  // Simulation of sending an email
  async sendTestEmail(config: SmtpConfig, to: string): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(`[Email Service] Connecting to ${config.host}:${config.port}...`);
      console.log(`[Email Service] Authenticating as ${config.user}`);
      console.log(`[Email Service] Sending test mail to ${to}`);
      
      setTimeout(() => {
        // Simulate success
        console.log('[Email Service] Email Sent Successfully.');
        resolve(true);
      }, 2000);
    });
  }

  validateConfig(config: SmtpConfig): boolean {
    return !!(config.host && config.port && config.user && config.senderEmail);
  }
}