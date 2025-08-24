/**
 * Package Manager Adapter Factory with Environment Injection
 *
 * This factory provides type exports for package manager adapters.
 * The actual factory implementation is in base.js (PackageManagerAdapterFactory).
 */

// Re-export types for convenience
export type { EnvironmentInfo } from '#bottles/environment-detector';
export type { PackageManagerAdapter } from './base.js';
