import { UnifiedCache } from '#utils/cache';
import { detectAndCreateScanner } from '#utils/scanner-factory';
import type { ScanPackagesParams, ScanResult } from '#types';
import { ScanPackagesParamsSchema } from '#types';
import { isInGroup } from '#utils/package-groups';

export async function scanPackagesTool(
  params: Partial<ScanPackagesParams> = {},
): Promise<ScanResult> {
  // Validate parameters
  const validated = ScanPackagesParamsSchema.parse(params);

  const cache = new UnifiedCache();

  // Get full package list (from cache or fresh scan)
  let fullResult: ScanResult;

  // First get environment info
  const scanner = await detectAndCreateScanner();
  const environment = await scanner.getEnvironmentInfo();

  if (!validated.forceRefresh) {
    // Try to load from cache
    const cached = await cache.load(environment);
    if (cached && !(await cache.isStale(environment))) {
      console.error('[CACHE] Using cached package index');
      fullResult = cached;
    } else {
      // Cache is stale or doesn't exist, do fresh scan
      console.error('[SCAN] Starting fresh package scan');
      fullResult = await scanner.scan();
      await cache.save(fullResult);
      console.error(`[SCAN] Indexed ${Object.keys(fullResult.packages).length} packages`);
    }
  } else {
    // Force refresh - always do fresh scan
    console.error('[SCAN] Force refresh: starting fresh package scan');
    fullResult = await scanner.scan();
    await cache.save(fullResult);
    console.error(`[SCAN] Indexed ${Object.keys(fullResult.packages).length} packages`);
  }

  // Clean up SQLite connection if used
  cache.close();

  // Apply filters and limits
  let packages = fullResult.packages;
  const totalCount = Object.keys(packages).length;

  // Filter by regex pattern if provided
  if (validated.filter) {
    try {
      const regex = new RegExp(validated.filter, 'i');
      const filtered: Record<string, (typeof packages)[string]> = {};
      for (const [name, info] of Object.entries(packages)) {
        if (regex.test(name)) {
          filtered[name] = info;
        }
      }
      packages = filtered;
      console.error(`[FILTER] Matched ${Object.keys(packages).length} of ${totalCount} packages`);
    } catch {
      console.error(`[FILTER] Invalid regex pattern: ${validated.filter}`);
    }
  }

  // Filter by category
  if (validated.category && validated.category !== 'all') {
    const categoryFiltered: Record<string, (typeof packages)[string]> = {};
    for (const [name, info] of Object.entries(packages)) {
      if (info.category === validated.category) {
        categoryFiltered[name] = info;
      }
    }
    packages = categoryFiltered;
    console.error(
      `[CATEGORY] Filtered to ${validated.category}: ${Object.keys(packages).length} packages`,
    );
  }

  // Filter @types packages if requested
  if (!validated.includeTypes) {
    const typesFiltered: Record<string, (typeof packages)[string]> = {};
    for (const [name, info] of Object.entries(packages)) {
      if (!name.startsWith('@types/')) {
        typesFiltered[name] = info;
      }
    }
    packages = typesFiltered;
    console.error(`[TYPES] Excluded @types packages: ${Object.keys(packages).length} remaining`);
  }

  // Filter by package group
  if (validated.group) {
    const groupFiltered: Record<string, (typeof packages)[string]> = {};
    for (const [name, info] of Object.entries(packages)) {
      if (isInGroup(name, validated.group)) {
        groupFiltered[name] = info;
      }
    }
    packages = groupFiltered;
    console.error(
      `[GROUP] Filtered to ${validated.group} group: ${Object.keys(packages).length} packages`,
    );
  }

  // Return summary mode if requested
  if (validated.summary) {
    const languageCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = { production: 0, development: 0, unknown: 0 };

    for (const pkg of Object.values(packages)) {
      languageCounts[pkg.language] = (languageCounts[pkg.language] ?? 0) + 1;
      const category = pkg.category ?? 'unknown';
      categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
    }

    console.error('[SUMMARY] Returning summary counts only');
    return {
      success: true,
      packages: {}, // Empty packages in summary mode
      environment: fullResult.environment,
      scanTime: fullResult.scanTime,
      // Add summary as a non-standard field
      ...{
        summary: {
          total: totalCount,
          filtered: Object.keys(packages).length,
          languages: languageCounts,
          categories: categoryCounts,
        },
      },
    };
  }

  // Apply limit (0 or undefined means no limit)
  if (validated.limit > 0) {
    const limited: Record<string, (typeof packages)[string]> = {};
    const entries = Object.entries(packages);
    const limitCount = Math.min(validated.limit, entries.length);

    for (let i = 0; i < limitCount; i++) {
      const entry = entries[i];
      if (entry) {
        const [name, info] = entry;
        limited[name] = info;
      }
    }
    packages = limited;

    if (Object.keys(packages).length < Object.keys(fullResult.packages).length) {
      console.error(`[LIMIT] Showing ${Object.keys(packages).length} of ${totalCount} packages`);
    }
  }

  return {
    success: true,
    packages,
    environment: fullResult.environment,
    scanTime: fullResult.scanTime,
  };
}
