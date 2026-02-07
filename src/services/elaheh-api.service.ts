
import { Injectable, inject } from '@angular/core';
import { User } from './elaheh-core.service';

/**
 * This service acts as an abstraction layer for the backend API.
 * In the current PoC, it returns mock data. In a production environment,
 * it would make HTTP requests to a real backend (e.g., Express.js, NestJS).
 */
@Injectable({
  providedIn: 'root'
})
export class ElahehApiService {

  constructor() { }

  /**
   * Fetches the list of all users from the backend.
   */
  async getUsers(): Promise<User[]> {
    console.log('[ApiService] Fetching users...');
    // MOCK IMPLEMENTATION
    return Promise.resolve([]);
  }

  /**
   * Creates a new tunnel configuration on the backend.
   * @param config The tunnel configuration details.
   */
  async createTunnel(config: any): Promise<any> {
    console.log('[ApiService] Creating tunnel...', config);
    // MOCK IMPLEMENTATION
    return Promise.resolve({ success: true, ...config });
  }

  /**
   * Instructs the backend to rotate cryptographic keys.
   */
  async rotateKeys(): Promise<void> {
    console.log('[ApiService] Requesting key rotation...');
    // MOCK IMPLEMENTATION
    return Promise.resolve();
  }

  /**
   * Fetches real-time server metrics from the backend.
   * This would be the integration point for tools like vnstat, netdata, etc.
   */
  async getSystemMetrics(): Promise<any> {
      console.log('[ApiService] Fetching system metrics...');
      // MOCK IMPLEMENTATION
      return Promise.resolve({
          cpuLoad: 15.5,
          memoryUsage: 45.2,
          transferRate: {
              up: 10.2, // Mbps
              down: 88.7 // Mbps
          }
      });
  }
}
