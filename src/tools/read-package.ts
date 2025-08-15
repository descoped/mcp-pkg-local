import { IndexCache } from '#utils/cache';
import { detectAndCreateScanner } from '#utils/scanner-factory';
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
      const scanner = await detectAndCreateScanner();
      packageLocation = await scanner.getPackageLocation(packageName);
      packageVersion = await scanner.getPackageVersion(packageName);

      if (!packageLocation) {
        const error = new PackageNotFoundError(packageName);
        return {
          type: 'error',
          success: false,
          error: error.message,
          ...(error.suggestion !== undefined && { suggestion: error.suggestion }),
        };
      }
    }

    // If no file path specified, return file tree and main/init file
    if (!filePath) {
      console.error(`[READ] Generating file tree for ${packageName}`);

      const fileTree = await generateFileTree(packageLocation, {
        maxDepth: 5,
        maxFiles: 500,
      });

      // Try to read main/init file based on package type
      let initContent: string | undefined;
      
      // Check if this is a Node.js package
      const packageJsonPath = join(packageLocation, 'package.json');
      let isNodePackage = false;
      
      try {
        await fs.access(packageJsonPath);
        isNodePackage = true;
      } catch {
        // Not a Node.js package
      }

      if (isNodePackage) {
        // For Node.js packages, try to read package.json as the main info
        try {
          const stats = await fs.stat(packageJsonPath);
          if (stats.isFile() && stats.size < 50000) {
            initContent = await readFileWithSizeCheck(packageJsonPath);
          }
        } catch {
          // package.json might be too large
        }
      } else {
        // For Python packages, try to read __init__.py
        const initPath = join(packageLocation, '__init__.py');
        try {
          const stats = await fs.stat(initPath);
          if (stats.isFile() && stats.size < 50000) {
            initContent = await readFileWithSizeCheck(initPath);
          }
        } catch {
          // __init__.py might not exist or be too large
        }
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
        const error = new FileNotFoundError(filePath);
        return {
          type: 'error',
          success: false,
          error: error.message,
          ...(error.suggestion !== undefined && { suggestion: error.suggestion }),
        };
      }
    } catch {
      const error = new FileNotFoundError(filePath);
      return {
        type: 'error',
        success: false,
        error: error.message,
        ...(error.suggestion !== undefined && { suggestion: error.suggestion }),
      };
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
