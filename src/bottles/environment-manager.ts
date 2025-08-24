/**
 * Centralized environment management for Bottles Architecture
 *
 * This singleton manager ensures environment detection happens only once
 * per process and provides a single source of truth for all adapters.
 */

import { detectEnvironment, type EnvironmentInfo } from './environment-detector.js';
import type { ShellRPC } from './shell-rpc/index.js';

/**
 * Centralized environment management
 * Single source of truth for environment detection
 */
export class EnvironmentManager {
  private static instance: EnvironmentManager | null = null;
  private cachedEnvironment: EnvironmentInfo | null = null;
  private detectionPromise: Promise<EnvironmentInfo> | null = null;

  private constructor() {}

  static getInstance(): EnvironmentManager {
    this.instance ??= new EnvironmentManager();
    return this.instance;
  }

  /**
   * Get environment info (cached, singleton)
   */
  async getEnvironment(shellRPC?: ShellRPC): Promise<EnvironmentInfo> {
    // Return cached if available
    if (this.cachedEnvironment) {
      return this.cachedEnvironment;
    }

    // Prevent duplicate detection calls
    if (this.detectionPromise) {
      return this.detectionPromise;
    }

    // Perform detection once
    this.detectionPromise = this.detect(shellRPC);
    this.cachedEnvironment = await this.detectionPromise;
    this.detectionPromise = null;

    return this.cachedEnvironment;
  }

  /**
   * Force refresh environment detection
   */
  async refresh(shellRPC?: ShellRPC): Promise<EnvironmentInfo> {
    this.cachedEnvironment = null;
    this.detectionPromise = null;
    return this.getEnvironment(shellRPC);
  }

  /**
   * Set environment manually (for testing)
   */
  setEnvironment(env: EnvironmentInfo): void {
    this.cachedEnvironment = env;
  }

  /**
   * Clear cached environment
   */
  clear(): void {
    this.cachedEnvironment = null;
    this.detectionPromise = null;
  }

  /**
   * Reset singleton instance (for testing)
   */
  static reset(): void {
    if (this.instance) {
      this.instance.clear();
    }
    this.instance = null;
  }

  private async detect(_shellRPC?: ShellRPC): Promise<EnvironmentInfo> {
    // Always perform actual detection to get real environment info
    // This ensures we work correctly on any user's machine
    // Detection is cached at process level, so it only happens once
    return detectEnvironment(true);
  }
}
