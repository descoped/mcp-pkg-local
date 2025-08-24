/**
 * Package Manager Adapter Registry
 * Central registration point for all package manager adapters
 */

import { PackageManagerAdapterFactory } from './base.js';
import { UVAdapter } from './uv.js';
import { PipAdapter } from './pip.js';

/**
 * Register all available package manager adapters with the factory
 */
export function registerAllAdapters(): void {
  // Python package managers
  PackageManagerAdapterFactory.register('uv', UVAdapter);
  PackageManagerAdapterFactory.register('pip', PipAdapter);

  // Future registrations:
  // PackageManagerAdapterFactory.register('poetry', PoetryAdapter);
  // PackageManagerAdapterFactory.register('pipenv', PipenvAdapter);

  // Node.js package managers (future)
  // PackageManagerAdapterFactory.register('npm', NpmAdapter);
  // PackageManagerAdapterFactory.register('yarn', YarnAdapter);
  // PackageManagerAdapterFactory.register('pnpm', PnpmAdapter);
  // PackageManagerAdapterFactory.register('bun', BunAdapter);

  // Other language package managers (future)
  // PackageManagerAdapterFactory.register('maven', MavenAdapter);
  // PackageManagerAdapterFactory.register('gradle', GradleAdapter);
  // PackageManagerAdapterFactory.register('cargo', CargoAdapter);
  // PackageManagerAdapterFactory.register('go', GoAdapter);
}

// Auto-register all adapters when this module is imported
registerAllAdapters();
