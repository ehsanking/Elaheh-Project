import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ElahehCoreService } from '../services/elaheh-core.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-remote-installer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
        <h3 class="text-lg font-bold text-yellow-400 mb-1">{{ languageService.translate('settings.installer.title') }}</h3>
        <p class="text-sm text-gray-400 mb-6">{{ languageService.translate('settings.installer.description') }}</p>
        
        @if (view() === 'tutorial') {
            <div class="space-y-6">
                <div class="p-4 rounded-lg border border-yellow-700 bg-yellow-900/30 text-yellow-300">
                    <p class="font-bold text-sm">{{ languageService.translate('settings.installer.warningTitle') }}</p>
                    <p class="text-xs mt-1">{{ languageService.translate('settings.installer.warningMessage') }}</p>
                </div>

                <!-- Step 1 -->
                <div>
                    <h4 class="font-bold text-gray-200">{{ languageService.translate('settings.installer.step1.title') }}</h4>
                    <p class="text-sm text-gray-400 mb-2">{{ languageService.translate('settings.installer.step1.description') }}</p>
                    <div class="bg-black p-2 rounded-md text-sm font-mono text-gray-300">
                        ssh root@&lt;your_server_ip&gt;
                    </div>
                </div>

                <!-- Step 2 -->
                <div>
                    <h4 class="font-bold text-gray-200">{{ languageService.translate('settings.installer.step2.title') }}</h4>
                    <p class="text-sm text-gray-400 mb-2">{{ languageService.translate('settings.installer.step2.description') }}</p>
                    <div class="bg-black p-2 rounded-md text-sm font-mono text-gray-300 space-y-1">
                        <div>sudo useradd -m -s /bin/bash installer</div>
                        <div>sudo passwd installer</div>
                        <div>sudo usermod -aG sudo installer <span class="text-gray-500"># For Debian/Ubuntu</span></div>
                        <div>sudo usermod -aG wheel installer <span class="text-gray-500"># For Rocky/CentOS</span></div>
                    </div>
                </div>
                 <!-- Step 3 -->
                <div>
                    <h4 class="font-bold text-gray-200">{{ languageService.translate('settings.installer.step3.title') }}</h4>
                    <p class="text-sm text-gray-400 mb-2">{{ languageService.translate('settings.installer.step3.description') }}</p>
                     <div class="bg-black p-2 rounded-md text-sm font-mono text-gray-300 space-y-1">
                        <div>sudo apt-get install sshpass -y <span class="text-gray-500"># For Debian/Ubuntu</span></div>
                        <div>sudo dnf install sshpass -y <span class="text-gray-500"># For Rocky/CentOS</span></div>
                    </div>
                </div>

                <div class="flex justify-end pt-4">
                    <button (click)="view.set('form')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors shadow-lg">
                        {{ languageService.translate('settings.installer.continueButton') }}
                    </button>
                </div>
            </div>
        } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Form -->
                <form [formGroup]="installerForm" (ngSubmit)="generateCommand()" class="space-y-4">
                    <div>
                        <label class="block text-gray-400 text-sm mb-1 uppercase font-bold">{{ languageService.translate('settings.installer.form.serverIp') }}</label>
                        <input formControlName="serverIp" type="text" class="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white focus:border-teal-500 outline-none" placeholder="123.45.67.89">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-1 uppercase font-bold">{{ languageService.translate('settings.installer.form.username') }}</label>
                        <input formControlName="username" type="text" class="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white focus:border-teal-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-1 uppercase font-bold">{{ languageService.translate('settings.installer.form.password') }}</label>
                        <input formControlName="password" type="password" class="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white focus:border-teal-500 outline-none">
                    </div>
                    <div class="flex justify-end pt-2">
                         <button type="submit" [disabled]="installerForm.invalid" class="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded transition-colors shadow-lg">
                            {{ languageService.translate('settings.installer.form.generateButton') }}
                        </button>
                    </div>
                </form>
                <!-- Command Output -->
                <div class="space-y-4">
                    @if(generatedCommand()) {
                        <div>
                            <p class="text-sm text-gray-400 mb-2">{{ languageService.translate('settings.installer.command.description') }}</p>
                            <div class="relative">
                                <textarea readonly class="w-full h-32 bg-black p-3 rounded-md text-sm font-mono text-gray-300 border border-gray-600 resize-none">{{ generatedCommand() }}</textarea>
                                <button (click)="copyCommand()" class="absolute top-2 right-2 px-3 py-1 text-xs rounded transition-colors"
                                    [class.bg-green-700]="commandCopied()"
                                    [class.text-white]="commandCopied()"
                                    [class.bg-gray-700]="!commandCopied()"
                                    [class.text-gray-300]="!commandCopied()"
                                    [class.hover:bg-gray-600]="!commandCopied()">
                                    {{ commandCopied() ? languageService.translate('settings.installer.command.copied') : languageService.translate('settings.installer.command.copy') }}
                                </button>
                            </div>
                        </div>

                         <div class="p-4 rounded-lg border border-red-700 bg-red-900/30 text-red-300">
                            <p class="font-bold text-sm">{{ languageService.translate('settings.installer.step4.title') }}</p>
                            <p class="text-xs mt-1">{{ languageService.translate('settings.installer.step4.description') }}</p>
                             <div class="bg-black p-2 rounded-md text-sm font-mono text-gray-300 mt-2">
                                sudo userdel -r installer
                            </div>
                        </div>

                    } @else {
                        <div class="h-full flex items-center justify-center text-gray-500 italic text-center border-2 border-dashed border-gray-700 rounded-lg p-4">
                            {{ languageService.translate('settings.installer.command.placeholder') }}
                        </div>
                    }
                </div>
            </div>
            <button (click)="view.set('tutorial')" class="text-sm text-gray-400 hover:underline mt-8">{{ languageService.translate('settings.installer.backButton') }}</button>
        }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemoteInstallerComponent {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);
  fb: FormBuilder = inject(FormBuilder);

  view = signal<'tutorial' | 'form'>('tutorial');
  generatedCommand = signal<string>('');
  commandCopied = signal<boolean>(false);

  installerForm = this.fb.group({
    serverIp: ['', Validators.required],
    username: ['installer', Validators.required],
    password: ['', Validators.required],
  });

  generateCommand() {
    if (this.installerForm.invalid) return;

    const { serverIp, username, password } = this.installerForm.value;
    const os = this.core.selectedOS() || 'debian'; // Default to debian if not set
    
    let commands = '';
    if (os === 'debian') {
        commands = `sudo apt-get update && sudo apt-get install -y wget curl git ufw && echo 'Installation complete.'`;
    } else { // rocky
        commands = `sudo dnf check-update && sudo dnf install -y wget curl git && echo 'Installation complete.'`;
    }

    // Escape single quotes in password for safety
    const safePassword = password!.replace(/'/g, "'\\''");

    const fullCommand = `sshpass -p '${safePassword}' ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${username}@${serverIp} "${commands}"`;
    
    this.generatedCommand.set(fullCommand);
    this.commandCopied.set(false);
  }

  copyCommand() {
    navigator.clipboard.writeText(this.generatedCommand()).then(() => {
        this.commandCopied.set(true);
        setTimeout(() => this.commandCopied.set(false), 2000);
    });
  }
}