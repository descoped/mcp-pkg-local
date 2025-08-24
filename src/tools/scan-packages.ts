import { UnifiedCache } from '#utils/cache.js';
import { detectAndCreateScanner } from '#utils/scanner-factory.js';
import type { ScanPackagesParams, LegacyScanPackagesParams } from '#types.js';
import type { ScanResult, BasicPackageInfo } from '#scanners/types.js';
import { ScanPackagesParamsSchema } from '#types.js';
// Removed unused imports: isInGroup, NodeJSAdapter, PythonAdapter
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

/**
 * Convert legacy parameters to new simplified format
 */
function migrateLegacyParams(params: Record<string, unknown>): ScanPackagesParams {
  const warnings: string[] = [];

  // Check for legacy parameters
  if ('filter' in params) {
    warnings.push('[DEPRECATED] "filter" parameter is no longer supported. Use "scope" instead.');
    delete params.filter;
  }

  if ('limit' in params) {
    warnings.push(
      '[DEPRECATED] "limit" parameter is no longer supported. Use "scope: project" for focused results.',
    );
    delete params.limit;
  }

  if ('summary' in params) {
    warnings.push(
      '[DEPRECATED] "summary" parameter is no longer supported. Summary is auto-enabled for "scope: all".',
    );
    delete params.summary;
  }

  if ('category' in params) {
    warnings.push('[DEPRECATED] "category" parameter is no longer supported.');
    delete params.category;
  }

  if ('includeTypes' in params) {
    warnings.push('[DEPRECATED] "includeTypes" parameter is no longer supported.');
    delete params.includeTypes;
  }

  if ('group' in params) {
    warnings.push('[DEPRECATED] "group" parameter is no longer supported.');
    delete params.group;
  }

  if ('includeContent' in params) {
    warnings.push('[DEPRECATED] "includeContent" parameter is no longer supported.');
    delete params.includeContent;
  }

  // Print deprecation warnings
  warnings.forEach((warning) => console.error(warning));

  // Return migrated params
  return {
    scope: (params.scope as 'all' | 'project' | undefined) ?? 'all',
    forceRefresh: (params.forceRefresh as boolean | undefined) ?? false,
  };
}

/**
 * Get project dependencies from package.json or pyproject.toml
 */
async function getProjectDependencies(): Promise<Set<string>> {
  const deps = new Set<string>();

  try {
    // Check for Node.js project
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = await fs.readFile(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(packageJson) as Record<string, unknown>;
    const dependencies = pkg.dependencies as Record<string, string> | undefined;
    const devDependencies = pkg.devDependencies as Record<string, string> | undefined;
    const peerDependencies = pkg.peerDependencies as Record<string, string> | undefined;
    Object.keys(dependencies ?? {}).forEach((dep) => deps.add(dep));
    Object.keys(devDependencies ?? {}).forEach((dep) => deps.add(dep));
    Object.keys(peerDependencies ?? {}).forEach((dep) => deps.add(dep));
  } catch {
    // Not a Node.js project or no package.json
  }

  try {
    // Check for Python project
    const pyprojectPath = join(process.cwd(), 'pyproject.toml');
    const pyproject = await fs.readFile(pyprojectPath, 'utf-8');
    // Simple extraction of dependencies from pyproject.toml
    // This is a basic implementation - could be enhanced with proper TOML parsing
    const regex = /\[tool\.poetry\.dependencies]([^[]*)/;
    const depSection = regex.exec(pyproject);
    if (depSection?.[1]) {
      const lines = depSection[1].split('\n');
      lines.forEach((line: string) => {
        const lineRegex = /^([\w-]+)\s*=/;
        const match = lineRegex.exec(line);
        if (match?.[1]) deps.add(match[1]);
      });
    }
  } catch {
    // Not a Python poetry project
  }

  try {
    // Check for requirements.txt
    const requirementsPath = join(process.cwd(), 'requirements.txt');
    const requirements = await fs.readFile(requirementsPath, 'utf-8');
    requirements.split('\n').forEach((line: string) => {
      const pkgName = line
        .trim()
        .split(/[<>=!]/)[0]
        ?.trim();
      if (pkgName && !pkgName.startsWith('#')) {
        deps.add(pkgName);
      }
    });
  } catch {
    // No requirements.txt
  }

  return deps;
}

export async function scanPackagesTool(
  params: Partial<ScanPackagesParams | LegacyScanPackagesParams> = {},
): Promise<ScanResult> {
  // Migrate legacy parameters with warnings
  const migrated = migrateLegacyParams(params);

  // Validate parameters
  const validated = ScanPackagesParamsSchema.parse(migrated);

  const cache = new UnifiedCache();

  // Get full package list (from cache or fresh scan)
  let fullResult: ScanResult;

  // First get environment info
  const scanner = await detectAndCreateScanner();
  const environment = await scanner.getEnvironmentInfo();

  // Handle cache vs fresh scan
  if (!validated.forceRefresh) {
    // Try to load from cache
    const cached = cache.load(environment);
    if (cached && !cache.isStale(environment)) {
      console.error('[CACHE] Using cached package index');
      fullResult = cached;
    } else {
      // Cache is stale or doesn't exist, do fresh scan
      console.error('[SCAN] Starting fresh package scan');
      fullResult = await scanner.scan();
      cache.save(fullResult);
      console.error(`[SCAN] Indexed ${Object.keys(fullResult.packages ?? {}).length} packages`);
    }
  } else {
    // Force refresh - always do fresh scan
    console.error('[SCAN] Force refresh: starting fresh package scan');
    fullResult = await scanner.scan();
    cache.save(fullResult);
    console.error(`[SCAN] Indexed ${Object.keys(fullResult.packages ?? {}).length} packages`);
  }

  // Clean up SQLite connection if used
  cache.close();

  let packages = fullResult.packages ?? {};
  const totalCount = Object.keys(packages).length;

  // Apply scope-based filtering
  if (validated.scope === 'project') {
    // Filter to only project dependencies
    const projectDeps = await getProjectDependencies();

    if (projectDeps.size > 0) {
      const filtered: Record<string, BasicPackageInfo> = {};
      for (const [name, info] of Object.entries(packages)) {
        if (projectDeps.has(name)) {
          filtered[name] = info;
        }
      }
      packages = filtered;
      console.error(
        `[SCOPE] Filtered to ${Object.keys(packages).length} project dependencies from ${totalCount} total`,
      );
    } else {
      console.error('[SCOPE] No project dependencies found, returning all packages');
    }

    // For project scope, return full package details
    return {
      type: 'packages',
      success: true,
      packages,
      environment: fullResult.environment,
      scanTime: fullResult.scanTime,
    };
  }

  // For 'all' scope, automatically return summary to reduce tokens
  if (validated.scope === 'all') {
    const languageCounts: Record<string, number> = {};

    for (const pkg of Object.values(packages)) {
      languageCounts[pkg.language] = (languageCounts[pkg.language] ?? 0) + 1;
    }

    console.error('[SUMMARY] Auto-summary for scope "all": reducing token usage');

    // Calculate categories for backward compatibility
    const categories: Record<string, number> = {};
    for (const pkg of Object.values(packages)) {
      const category = pkg.metadata?.dev ? 'development' : 'production';
      categories[category] = (categories[category] ?? 0) + 1;
    }

    return {
      type: 'summary',
      success: true,
      environment: fullResult.environment,
      scanTime: fullResult.scanTime,
      totalPackages: totalCount,
      categories,
      // Note: packages field is intentionally omitted in summary mode
      summary: {
        total: totalCount,
        filtered: 0, // No filtering in 'all' scope
        languages: languageCounts,
        categories, // Kept for backward compatibility
      },
    };
  }

  // Default case - should not normally reach here
  return {
    type: 'list',
    success: true,
    packages,
    environment: fullResult.environment,
    scanTime: fullResult.scanTime,
  };
}
