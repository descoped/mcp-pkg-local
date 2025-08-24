/**
 * Environment Fixtures for Testing
 *
 * Provides mock environments and utilities for testing package manager adapters
 * without requiring actual environment detection.
 */

import { EnvironmentManager } from '#bottles/environment-manager';
import type { EnvironmentInfo } from '#bottles/environment-detector';

export class EnvironmentFixtures {
  /**
   * Create a mock environment for testing
   */
  static createMockEnvironment(
    options: {
      pip?: boolean;
      uv?: boolean;
      python?: string;
    } = {},
  ): EnvironmentInfo {
    const now = Date.now();

    return {
      pip:
        options.pip !== false
          ? {
              available: true,
              version: '23.0.0',
              command: 'pip',
              path: '/usr/bin/pip',
            }
          : {
              available: false,
              error: 'pip not found',
            },
      uv:
        options.uv === true
          ? {
              available: true,
              version: '0.5.0',
              command: 'uv',
              path: '/usr/local/bin/uv',
            }
          : {
              available: false,
              error: 'uv not found',
            },
      detected: true,
      timestamp: now,
    };
  }

  /**
   * Create a full environment with all package managers available
   */
  static createFullEnvironment(): EnvironmentInfo {
    return this.createMockEnvironment({
      pip: true,
      uv: true,
      python: '3.11.0',
    });
  }

  /**
   * Create a minimal environment with only pip
   */
  static createMinimalEnvironment(): EnvironmentInfo {
    return this.createMockEnvironment({
      pip: true,
      uv: false,
      python: '3.9.0',
    });
  }

  /**
   * Create an environment with only UV
   */
  static createUvOnlyEnvironment(): EnvironmentInfo {
    return this.createMockEnvironment({
      pip: false,
      uv: true,
    });
  }

  /**
   * Set mock environment for testing
   */
  static useMockEnvironment(env: EnvironmentInfo): void {
    const manager = EnvironmentManager.getInstance();
    manager.setEnvironment(env);
  }

  /**
   * Reset to real environment detection
   */
  static useRealEnvironment(): void {
    const manager = EnvironmentManager.getInstance();
    manager.clear();
  }

  /**
   * Create and set a mock environment in one call
   */
  static setupMockEnvironment(options?: {
    pip?: boolean;
    uv?: boolean;
    python?: string;
  }): EnvironmentInfo {
    const env = this.createMockEnvironment(options);
    this.useMockEnvironment(env);
    return env;
  }

  /**
   * Reset environment manager completely (for test isolation)
   */
  static reset(): void {
    EnvironmentManager.reset();
  }
}
