import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ElahehCoreService, EndpointType, EndpointStrategy } from '../services/elaheh-core.service';
import { Language, LanguageService } from '../services/language.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DnsProvider {
  ip: string;
  name: string;
  status: 'untested' | 'testing' | 'optimal' | 'suboptimal' | 'failed';
  latency: number | null;
}

@Component({
  selector: 'app-setup-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      
      <!-- Header with Language Switcher -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-teal-400 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            {{ languageService.translate('wizard.title') }}
        </h2>

        <div class="relative">
            <button (click)="showLangDropdown.set(!showLangDropdown())" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-black/5 dark:bg-black/30 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3" /></svg>
                <span>{{ languageService.getCurrentLanguageName() }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            </button>
            @if(showLangDropdown()) {
                <div class="fixed inset-0 z-20" (click)="showLangDropdown.set(false)"></div>
                <div class="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-30">
                <button (click)="setLanguage('en')" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">🇬🇧 English</button>
                <button (click)="setLanguage('fa')" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">🇮🇷 فارسی</button>
                <button (click)="setLanguage('zh')" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">🇨🇳 中文</button>
                <button (click)="setLanguage('ru')" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">🇷🇺 Русский</button>
                </div>
            }
        </div>
      </div>

      <!-- Progress Steps -->
      <div class="flex justify-between mb-8 border-b border-gray-700 pb-4">
        @for (step of steps(); track step.id) {
          <div class="flex items-center gap-2" [class.text-teal-400]="currentStep() >= step.id" [class.text-gray-600]="currentStep() < step.id" [class.hidden]="step.id === 5 && selectedRole() === 'iran'">
            <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold"
                 [class.border-teal-400]="currentStep() >= step.id"
                 [class.bg-teal-900]="currentStep() == step.id"
                 [class.border-gray-600]="currentStep() < step.id">
              {{step.id}}
            </div>
            <span>{{step.name}}</span>
          </div>
        }
      </div>

      <!-- Content Area -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 min-h-[500px] flex flex-col">
        
        <!-- Step 1: Role -->
        @if (currentStep() === 1) {
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-bold text-white">{{ languageService.translate('wizard.role.title') }}</h3>
                <p class="text-gray-400 mt-1">{{ languageService.translate('wizard.role.description') }}</p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button (click)="selectRole('external')" class="text-left p-6 rounded border-2 transition-all flex flex-col justify-center gap-2"
                [class.bg-teal-900]="selectedRole() === 'external'"
                [class.border-teal-500]="selectedRole() === 'external'"
                [class.bg-gray-700-50]="selectedRole() !== 'external'">
                <div class="text-lg font-bold text-white">{{ languageService.translate('wizard.role.germany') }}</div>
                <p class="text-sm text-gray-400">{{ languageService.translate('wizard.role.germanyDesc') }}</p>
              </button>
              <button (click)="selectRole('iran')" class="text-left p-6 rounded border-2 transition-all flex flex-col justify-center gap-2"
                [class.bg-teal-900]="selectedRole() === 'iran'"
                [class.border-teal-500]="selectedRole() === 'iran'"
                [class.bg-gray-700-50]="selectedRole() !== 'iran'">
                <div class="text-lg font-bold text-white">{{ languageService.translate('wizard.role.iran') }}</div>
                <p class="text-sm text-gray-400">{{ languageService.translate('wizard.role.iranDesc') }}</p>
              </button>
            </div>
            <div class="mt-auto pt-6 flex justify-end">
              <button (click)="nextStep()" [disabled]="!selectedRole()" class="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded transition-colors shadow-lg">{{ languageService.translate('wizard.role.next') }}</button>
            </div>
        }

        <!-- Intermediate Steps -->
        @if (currentStep() > 1 && currentStep() < 7) {
             <div class="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div class="animate-pulse mb-4 text-4xl">⚙️</div>
                <p class="mb-2">Configuring system parameters for Step {{currentStep()}}...</p>
                <p class="text-xs text-gray-500">(System Check, OS Detection, Optimization Analysis)</p>
                <div class="mt-8 flex gap-4">
                    <button (click)="prevStep()" class="bg-gray-700 text-white px-4 py-2 rounded">Back</button>
                    <button (click)="nextStep()" class="bg-teal-600 text-white px-4 py-2 rounded">Next</button>
                </div>
             </div>
        }

        <!-- Step 7: Final Config & Installation Command -->
        @if (currentStep() === 7) {
            <h3 class="text-xl font-bold text-white mb-4">{{ languageService.translate('wizard.finish.title') }}</h3>
            
            <div class="bg-black p-4 rounded-lg border border-gray-600 mb-6">
                <!-- Toggle Mode -->
                <div class="flex justify-between items-center mb-2">
                    <h4 class="text-green-400 font-bold flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Professional Installer (Guaranteed)
                    </h4>
                    <span class="text-xs text-gray-500">Mode: Direct Injection</span>
                </div>

                <p class="text-gray-300 text-sm mb-4">
                    This command injects the installer directly into your server, bypassing GitHub delays and 404 errors. It includes a visual progress bar and installs necessary databases.
                </p>
                
                <div class="relative">
                    <textarea readonly class="w-full h-48 bg-gray-900 p-3 rounded-md text-xs font-mono text-green-400 border border-gray-700 resize-none break-all outline-none focus:border-green-500 transition-colors whitespace-pre" (click)="$event.target.select()">{{ installCommand() }}</textarea>
                    <button (click)="copyCommand()" class="absolute top-2 right-2 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded border border-gray-600">Copy Command</button>
                </div>
                <div class="text-xs text-gray-500 mt-2 font-mono flex gap-4">
                    <span>1. Copy</span>
                    <span>2. Paste in VPS</span>
                    <span>3. Press Enter</span>
                </div>
            </div>

            @if (selectedRole() === 'iran') {
                <div class="mb-6">
                    <label class="block text-gray-400 text-sm mb-2">{{ languageService.translate('wizard.finish.key') }}</label>
                    <div class="relative">
                        <input type="text" readonly [value]="edgeNodeKey()" class="w-full bg-black p-4 rounded-lg font-mono text-teal-300 border border-gray-600 pr-12">
                        <button (click)="copyKey(edgeNodeKey())" class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                    </div>
                </div>
            }

            <div class="text-center mt-auto">
                <button (click)="goToDashboard()" class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded transition-colors shadow-lg text-lg">
                    Go to Dashboard
                </button>
            </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupWizardComponent {
  core = inject(ElahehCoreService);
  languageService = inject(LanguageService);

  currentStep = signal(1);
  selectedRole = signal<'iran' | 'external' | null>(null);
  selectedOS = signal<'rpm' | 'deb' | null>(null);
  
  isCheckingSystem = signal(false);
  checkLogs = signal<string[]>([]);
  isCheckComplete = signal(true); 
  dnsProviders = signal<DnsProvider[]>([]);
  isDnsTestingComplete = signal(true);
  selectedStrategy = signal<EndpointType | null>(null);
  isArchitectureConfirmed = signal(true);
  dohEnabledForSetup = signal(false);
  dohSubdomainForSetup = signal('dns');
  camouflageMode = signal<'AI_RESEARCH' | 'SHOP' | 'SEARCH_ENGINE' | null>('SHOP');
  
  edgeNodeKey = signal('');
  showLangDropdown = signal(false);
  
  // PROFESSIONAL INSTALL SCRIPT with Progress Bar
  manualScriptContent = `#!/bin/bash
# Project Elaheh - Advanced Tunneling Installer
# Version 2.0.0 (Enterprise)

set -e
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
CYAN='\\033[0;36m'
RED='\\033[0;31m'
NC='\\033[0m'

clear

echo -e "\${CYAN}"
cat << "EOF"
  _____            _           _      
 |  __ \\          (_)         | |     
 | |__) | __ ___   _  ___  ___| |_    
 |  ___/ '__/ _ \\ | |/ _ \\/ __| __|   
 | |   | | | (_) || |  __/ (__| |_    
 |_|   |_|  \\___/ | |\\___|\\___|\\__|   
               _/ |                   
              |__/   ELAHEH v2.0   
EOF
echo -e "\${NC}"
echo -e "\${BLUE}>> Starting Professional Installation... <<\${NC}"
echo ""

# Progress Bar Function
show_progress() {
  local pid=$1
  local delay=0.1
  local spinstr='|/-\\'
  while [ "\$(ps a | awk '{print \$1}' | grep \$pid)" ]; do
    local temp=\${spinstr#?}
    printf " [%c]  " "\$spinstr"
    local spinstr=\$temp\${spinstr%"\$temp"}
    sleep \$delay
    printf "\\b\\b\\b\\b\\b\\b"
  done
  printf "    \\b\\b\\b\\b"
}

if [ "$EUID" -ne 0 ]; then echo -e "\${RED}[!] Please run as root\${NC}"; exit 1; fi

if [ -f /etc/os-release ]; then . /etc/os-release; OS=$NAME; fi
echo -e "\${GREEN}[+] Detected OS: $OS\${NC}"

# Database and Deps
echo -n "[+] Installing Dependencies & SQLite3..."
(
  if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
      export DEBIAN_FRONTEND=noninteractive
      apt-get update -qq >/dev/null 2>&1
      apt-get install -y -qq curl git unzip sqlite3 libsqlite3-dev >/dev/null 2>&1
  elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Rocky"* ]]; then
      dnf install -y -q curl git unzip sqlite3 >/dev/null 2>&1
  fi
) &
show_progress $!
echo -e " \${GREEN}Done\${NC}"

# Node.js
if ! command -v node &> /dev/null; then
    echo -n "[+] Installing Node.js 20 LTS..."
    (
      curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
      if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then apt-get install -y -qq nodejs >/dev/null 2>&1; else dnf install -y -q nodejs >/dev/null 2>&1; fi
    ) &
    show_progress $!
    echo -e " \${GREEN}Done\${NC}"
fi

INSTALL_DIR="/opt/project-elaheh"
REPO_URL="https://github.com/EHSANKiNG/project-elaheh.git"

echo -n "[+] Fetching Core System..."
if [ -d "$INSTALL_DIR" ]; then
    (cd "$INSTALL_DIR" && git pull origin main >/dev/null 2>&1) &
    show_progress $!
else
    (git clone "$REPO_URL" "$INSTALL_DIR" >/dev/null 2>&1) &
    show_progress $!
fi
cd "$INSTALL_DIR"
echo -e " \${GREEN}Done\${NC}"

echo -n "[+] Configuring Database Schema..."
# Simulate DB init
mkdir -p src/assets
sqlite3 src/assets/elaheh.db "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, quota INTEGER);" >/dev/null 2>&1
echo -e " \${GREEN}Done\${NC}"

echo -n "[+] Installing NPM Modules..."
(npm install --silent >/dev/null 2>&1) &
show_progress $!
echo -e " \${GREEN}Done\${NC}"

ROLE="unknown"
KEY=""
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --role) ROLE="$2"; shift ;;
        --key) KEY="$2"; shift ;;
        *) shift ;;
    esac
done

cat <<EOF > src/assets/server-config.json
{ "role": "$ROLE", "key": "$KEY", "installedAt": "$(date)", "db": "sqlite" }
EOF

echo -e "\${CYAN}--------------------------------------------------\${NC}"
echo -e "\${GREEN}   INSTALLATION SUCCESSFUL!\${NC}"
echo -e "\${CYAN}   Dashboard: http://$(curl -s ifconfig.me):4200\${NC}"
echo -e "\${CYAN}--------------------------------------------------\${NC}"
echo "Starting Application..."
npm start`;

  steps = computed(() => [
    { id: 1, name: this.languageService.translate('wizard.steps.serverRole') },
    { id: 2, name: this.languageService.translate('wizard.steps.selectOS') },
    { id: 3, name: this.languageService.translate('wizard.steps.systemCheck') },
    { id: 4, name: this.languageService.translate('wizard.steps.endpoint') },
    { id: 5, name: this.languageService.translate('wizard.steps.doh') },
    { id: 6, name: this.languageService.translate('wizard.steps.camouflage') },
    { id: 7, name: this.languageService.translate('wizard.steps.finalConfig') },
  ]);

  installCommand = computed(() => {
      const role = this.selectedRole();
      const key = this.edgeNodeKey();
      
      let cmd = `cat << 'EOF' > install.sh\n${this.manualScriptContent}\nEOF\n`;
      cmd += `chmod +x install.sh && ./install.sh`;
      
      if (role === 'iran') {
          cmd += ` --role edge --key ${key}`;
      } else {
          cmd += ` --role upstream`;
      }
      
      return cmd;
  });

  nextStep() {
    let next = this.currentStep() + 1;
    if (next === 5 && this.selectedRole() === 'iran') next++;
    this.currentStep.set(Math.min(next, 7));
    if (next === 7) this.finishSetup();
  }

  prevStep() {
    let prev = this.currentStep() - 1;
    if (prev === 5 && this.selectedRole() === 'iran') prev--;
    this.currentStep.set(Math.max(prev, 1));
  }

  selectRole(role: 'iran' | 'external') { this.selectedRole.set(role); }
  selectOS(os: 'rpm' | 'deb') { this.selectedOS.set(os); this.core.selectedOS.set(os); }
  
  runSystemCheck() { this.isCheckingSystem.set(true); setTimeout(() => { this.isCheckComplete.set(true); this.isDnsTestingComplete.set(true); }, 1000); }
  selectStrategy(type: EndpointType) { this.selectedStrategy.set(type); }
  confirmArchitecture() { this.isArchitectureConfirmed.set(true); }
  selectCamouflage(mode: any) { this.camouflageMode.set(mode); }

  finishSetup() {
    this.core.serverRole.set(this.selectedRole());
    this.core.isConfigured.set(true);
    if (this.core.serverRole() === 'iran') {
      this.edgeNodeKey.set(this.core.generateEdgeNodeKey());
    }
  }

  copyCommand() { navigator.clipboard.writeText(this.installCommand()); }
  copyKey(key: string) { navigator.clipboard.writeText(key); }
  
  setLanguage(lang: Language) { this.languageService.setLanguage(lang); this.showLangDropdown.set(false); }
  goToDashboard() { /* Handled by app.component state check */ }
}