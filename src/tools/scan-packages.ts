import { PythonScanner } from '#scanners/python';
import { IndexCache } from '#utils/cache';
import type { ScanPackagesParams, ScanResult } from '#types';
import { ScanPackagesParamsSchema } from '#types';

export async function scanPackagesTool(params: ScanPackagesParams): Promise<ScanResult> {
  // Validate parameters
  const validated = ScanPackagesParamsSchema.parse(params);

  const cache = new IndexCache();

  // Check if we should use cached results
  if (!validated.forceRefresh && (await cache.exists())) {
    const cached = await cache.read();
    if (cached && !(await cache.isStale())) {
      console.error('[CACHE] Using cached package index');
      return {
        success: true,
        packages: cached.packages,
        environment: cached.environment,
        scanTime: cached.lastUpdated,
      };
    }
  }

  console.error('[SCAN] Starting fresh package scan');

  // Perform fresh scan
  const scanner = new PythonScanner();
  const result = await scanner.scan();

  // Save to cache
  await cache.write(result);
  console.error(`[SCAN] Indexed ${Object.keys(result.packages).length} packages`);

  return result;
}
