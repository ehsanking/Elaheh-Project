import { Injectable, signal } from '@angular/core';

export interface AppBackup {
  version: string;
  timestamp: string;
  settings: any;
  users: any[];
  products: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly DB_KEY = 'elaheh_db_v1';

  constructor() {}

  saveState(data: any) {
    try {
      localStorage.setItem(this.DB_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Database save failed', e);
      return false;
    }
  }

  loadState(): any | null {
    try {
      const data = localStorage.getItem(this.DB_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Database load failed', e);
      return null;
    }
  }

  exportDatabase(coreData: any): string {
    const backup: AppBackup = {
      version: '1.0.3',
      timestamp: new Date().toISOString(),
      settings: {
        adminUsername: coreData.adminUsername(),
        // We do not export passwords in plain text in a real app, keeping it simple for now
        theme: coreData.theme(),
        domain: coreData.customDomain(),
        smtp: coreData.smtpConfig()
      },
      users: coreData.users(),
      products: coreData.products()
    };
    return JSON.stringify(backup, null, 2);
  }

  importDatabase(jsonStr: string): AppBackup | null {
    try {
      const backup = JSON.parse(jsonStr) as AppBackup;
      if (!backup.version || !backup.users) throw new Error('Invalid backup format');
      return backup;
    } catch (e) {
      console.error('Import failed', e);
      return null;
    }
  }

  clearDatabase() {
    localStorage.removeItem(this.DB_KEY);
  }
}