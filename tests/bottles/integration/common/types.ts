/**
 * Type definitions for Bottles integration tests
 *
 * This module provides comprehensive type definitions for all integration test
 * components, ensuring type safety and eliminating the use of 'any' types.
 */

import type { ShellRPC } from '#bottles/shell-rpc';
import type { VolumeController } from '#bottles/volume-controller';
import type { PipAdapter } from '#bottles/package-managers/pip';
import type { UVAdapter } from '#bottles/package-managers/uv';
import type { EnvironmentInfo } from '#bottles/environment-detector';

/**
 * Test environment configuration
 */
export interface TestEnvironment {
  /** Temporary directory for this test environment */
  tempDir: string;
  /** Project directory within tempDir */
  projectDir: string;
  /** Shell RPC instance */
  shellRPC: ShellRPC;
  /** Volume controller instance */
  volumeController: VolumeController;
  /** Environment information for package managers */
  environment: EnvironmentInfo;
  /** Cleanup function to remove all resources */
  cleanup: () => Promise<void>;
}

/**
 * Package installation validation result
 */
export interface ValidationResult {
  /** Successfully installed packages */
  installed: string[];
  /** Packages that failed to install */
  missing: string[];
}

/**
 * Package adapter type union
 */
export type PackageAdapter = PipAdapter | UVAdapter;

/**
 * Package manager type
 */
export type PackageManagerType = 'pip' | 'uv';

/**
 * Type for accessing internal PythonScanner properties in tests
 * Used to access private properties in tests without using 'any'
 */
export interface PythonScannerInternal {
  /** Internal site packages path (readonly for tests) */
  readonly sitePackagesPath?: string;
  /** All public methods from PythonScanner */
  scan(): Promise<{ packages?: Record<string, unknown> }>;
}
