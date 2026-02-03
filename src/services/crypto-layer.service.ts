import { Injectable, signal, computed } from '@angular/core';
import { ElahehCoreService } from './elaheh-core.service';

@Injectable({
  providedIn: 'root'
})
export class CryptoLayerService {
  // State for the "Crypto Layer"
  isActive = signal(true);
  currentAlgorithm = signal('ChaCha20-Poly1305');
  keyRotationCounter = signal(0);
  nonce = signal<string>('');
  packetsProcessed = signal(0);
  autoRotateThreshold = signal(1000); // Rotate every 1000 packets

  // Status for the UI
  status = computed(() => this.isActive() ? 'active' : 'inactive');

  constructor(private core: ElahehCoreService) {
    this.rotateKey(); // Initial key
    this.startTrafficSimulation();
  }

  rotateKey() {
    this.keyRotationCounter.update(v => v + 1);
    this.generateNewNonce();
    this.core.addLog('SUCCESS', `[Crypto Layer] Key Rotation #${this.keyRotationCounter()} complete. New session key derived.`);
  }

  generateNewNonce() {
    // Generate a random 12-byte nonce (96 bits) for AEAD
    const array = new Uint8Array(12);
    crypto.getRandomValues(array);
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    this.nonce.set(hex);
  }

  forceRotation() {
    this.rotateKey();
  }

  // Simulates packet flow to demonstrate Key Rotation logic
  private startTrafficSimulation() {
    setInterval(() => {
      if (!this.isActive()) return;

      // Simulate 5-15 packets arriving
      const newPackets = Math.floor(Math.random() * 10) + 5;
      this.packetsProcessed.update(v => {
        const nextVal = v + newPackets;
        // Check for rotation threshold
        if (nextVal % this.autoRotateThreshold() < v % this.autoRotateThreshold()) {
           this.rotateKey();
        }
        return nextVal;
      });
      
      // Update nonce frequently to show "liveness"
      if (Math.random() > 0.7) {
          this.generateNewNonce();
      }

    }, 2000);
  }
}