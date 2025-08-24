/**
 * Global test setup file
 * This runs once before all tests to perform centralized initialization
 */

import { getCachedEnvironment } from './helpers/environment-cache.js';

export async function setup(): Promise<void> {
  // Perform package manager detection once for all tests and cache it
  const detection = await getCachedEnvironment();

  console.warn('[Setup] Global test setup complete');
  console.warn(
    `[Setup] Package managers: pip=${detection.pip.available}, uv=${detection.uv.available}`,
  );
}
