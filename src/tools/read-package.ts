import { PythonScanner } from '#scanners/python';
import { IndexCache } from '#utils/cache';
import { readFileWithSizeCheck, generateFileTree, sanitizePath } from '#utils/fs';
import type { ReadPackageParams, ReadPackageResult } from '#types';
import { ReadPackageParamsSchema, PackageNotFoundError, FileNotFoundError } from '#types';
import { join } from 'node:path';
import { promises as fs } from 'node:fs';

export async function readPackageTool(params: ReadPackageParams): Promise<ReadPackageResult> {
  // Validate parameters
  const validated = ReadPackageParamsSchema.parse(params);
  const { packageName, filePath } = validated;

  try {
    // Get package location from cache or scan
    const cache = new IndexCache();
    let packageLocation: string | null = null;
    let packageVersion: string | null = null;

    // Try cache first
    const cached = await cache.read();
    if (cached?.packages[packageName]) {
      packageLocation = cached.packages[packageName].location;
      packageVersion = cached.packages[packageName].version;
    }

    // If not in cache, scan for it
    if (!packageLocation) {
      const scanner = new PythonScanner();
      packageLocation = await scanner.getPackageLocation(packageName);
      packageVersion = await scanner.getPackageVersion(packageName);

      if (!packageLocation) {
        throw new PackageNotFoundError(packageName);
      }
    }

    // If no file path specified, return file tree and __init__.py
    if (!filePath) {
      console.error(`[READ] Generating file tree for ${packageName}`);

      const fileTree = await generateFileTree(packageLocation, {
        maxDepth: 5,
        maxFiles: 500,
      });

      // Try to read __init__.py if it exists
      let initContent: string | undefined;
      const initPath = join(packageLocation, '__init__.py');

      try {
        const stats = await fs.stat(initPath);
        if (stats.isFile() && stats.size < 50000) {
          // Limit init file to 50KB
          initContent = await readFileWithSizeCheck(initPath);
        }
      } catch {
        // __init__.py might not exist or be too large
      }

      return {
        type: 'tree',
        success: true,
        package: packageName,
        version: packageVersion ?? 'unknown',
        ...(initContent !== undefined && { initContent }),
        fileTree,
      };
    }

    // Read specific file
    console.error(`[READ] Reading file ${filePath} from ${packageName}`);

    const fullPath = sanitizePath(packageLocation, filePath);

    // Check if file exists
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isFile()) {
        throw new FileNotFoundError(filePath);
      }
    } catch {
      throw new FileNotFoundError(filePath);
    }

    const content = await readFileWithSizeCheck(fullPath);

    return {
      type: 'file',
      success: true,
      package: packageName,
      filePath,
      content,
    };
  } catch (error) {
    console.error('[READ] Error:', error);

    if (error instanceof PackageNotFoundError || error instanceof FileNotFoundError) {
      return {
        type: 'error',
        success: false,
        error: error.message,
        ...(error.suggestion !== undefined && { suggestion: error.suggestion }),
      };
    }

    return {
      type: 'error',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
