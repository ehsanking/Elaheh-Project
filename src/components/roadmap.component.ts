
import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../services/language.service';

interface RoadmapItem {
    title: string;
    description: string;
    status: 'researching' | 'planned' | 'in_progress' | 'beta';
}

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto">
        <div class="text-center mb-10">
            <h2 class="text-2xl font-bold text-white">{{ languageService.translate('roadmap.title') }}</h2>
            <p class="text-gray-400 mt-2 max-w-2xl mx-auto">{{ languageService.translate('roadmap.description') }}</p>
        </div>
        
        <div class="space-y-6">
            @for (item of roadmapItems(); track item.title) {
                <div class="bg-gray-900/50 p-6 rounded-lg border border-gray-700 flex flex-col sm:flex-row gap-6 hover:border-purple-500/50 transition-colors duration-300">
                    <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl" [ngClass]="getIconForStatus(item.status).bg">
                        {{ getIconForStatus(item.status).icon }}
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <h3 class="font-bold text-gray-100 text-lg">{{ item.title }}</h3>
                            <span class="text-xs font-bold px-3 py-1 rounded-full" [ngClass]="getStatusClass(item.status)">
                                {{ languageService.translate('roadmap.status.' + item.status) }}
                            </span>
                        </div>
                        <p class="text-sm text-gray-400 mt-2">{{ item.description }}</p>
                    </div>
                </div>
            }
        </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoadmapComponent {
  languageService = inject(LanguageService);

  roadmapItems = computed<RoadmapItem[]>(() => {
    // This allows the component to react to language changes
    return this.languageService.translate('roadmap.items') as RoadmapItem[];
  });

  getIconForStatus(status: RoadmapItem['status']): { icon: string; bg: string } {
    switch (status) {
      case 'researching':
        return { icon: '🔬', bg: 'bg-blue-900/50' };
      case 'planned':
        return { icon: '🗓️', bg: 'bg-gray-700' };
      case 'in_progress':
        return { icon: '⚙️', bg: 'bg-yellow-900/50' };
      case 'beta':
        return { icon: '🧪', bg: 'bg-teal-900/50' };
      default:
        return { icon: '✨', bg: 'bg-gray-800' };
    }
  }

  getStatusClass(status: RoadmapItem['status']): string {
    switch (status) {
      case 'researching':
        return 'bg-blue-900/50 text-blue-300 border border-blue-800';
      case 'planned':
        return 'bg-gray-700 text-gray-300 border border-gray-600';
      case 'in_progress':
        return 'bg-yellow-900/50 text-yellow-300 border border-yellow-800';
      case 'beta':
        return 'bg-teal-900/50 text-teal-300 border border-teal-800';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  }
}
