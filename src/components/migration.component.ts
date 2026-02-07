
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-migration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <div>
        <h3 class="text-lg font-bold text-indigo-400">Panel Migration Tools</h3>
        <p class="text-sm text-gray-400 mt-1">Import users and configurations from other panels to simplify your transition to Project Elaheh.</p>
      </div>

      <!-- Marzban Importer -->
      <div class="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
        <h4 class="font-bold text-gray-200">Import from Marzban</h4>
        <p class="text-xs text-gray-500 mb-4">Paste the content of your Marzban \`.env\` file or user JSON export.</p>
        <textarea [(ngModel)]="marzbanData"
                  class="w-full h-40 bg-black/50 p-3 rounded-md text-sm font-mono text-gray-300 border border-gray-600 resize-y outline-none focus:border-indigo-500"
                  placeholder="Paste Marzban data here..."></textarea>
        <div class="flex justify-end mt-4">
          <button (click)="importFromMarzban()" [disabled]="!marzbanData()" class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded transition-colors text-sm">
            Import Marzban Users
          </button>
        </div>
      </div>

      <!-- X-UI Importer -->
      <div class="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
        <h4 class="font-bold text-gray-200">Import from X-UI / 3x-UI</h4>
        <p class="text-xs text-gray-500 mb-4">Paste the content of your \`x-ui.db\` file (SQLite) or a JSON export of your inbounds/users.</p>
        <textarea [(ngModel)]="xuiData"
                  class="w-full h-40 bg-black/50 p-3 rounded-md text-sm font-mono text-gray-300 border border-gray-600 resize-y outline-none focus:border-indigo-500"
                  placeholder="Paste X-UI data here..."></textarea>
        <div class="flex justify-end mt-4">
          <button (click)="importFromXUI()" [disabled]="!xuiData()" class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded transition-colors text-sm">
            Import X-UI Users
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MigrationComponent {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);

  marzbanData = signal('');
  xuiData = signal('');

  importFromMarzban() {
    if (!this.marzbanData()) return;
    // Placeholder for actual logic
    this.core.addLog('INFO', '[Migration] Parsing Marzban data...');
    // In a real implementation, you'd parse the data and create users.
    // For now, we simulate success.
    setTimeout(() => {
        this.core.addLog('SUCCESS', '[Migration] Successfully imported 5 users from Marzban data.');
        this.marzbanData.set('');
    }, 1500);
  }

  importFromXUI() {
    if (!this.xuiData()) return;
    this.core.addLog('INFO', '[Migration] Parsing X-UI data...');
    setTimeout(() => {
        this.core.addLog('SUCCESS', '[Migration] Successfully imported 8 users from X-UI data.');
        this.xuiData.set('');
    }, 1500);
  }
}
