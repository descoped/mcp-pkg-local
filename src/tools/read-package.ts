import { IndexCache } from '#utils/cache';
import { detectAndCreateScanner } from '#utils/scanner-factory';
import { readFileWithSizeCheck, generateFileTree, sanitizePath } from '#utils/fs';
import type { ReadPackageParams, ReadPackageResult } from '#types';
import { ReadPackageParamsSchema, PackageNotFoundError, FileNotFoundError } from '#types';
import { join } from 'node:path';
import { promises as fs } from 'node:fs';

export async function readPackageTool(params: { packageName: string } & Partial<ReadPackageParams>): Promise<ReadPackageResult> {
  // Validate parameters
  const validated = ReadPackageParamsSchema.parse(params);
  const { packageName, filePath, includeTree, maxDepth, pattern } = validated;

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

      // Determine if we need to include the full tree or just main files
      let fileTree: string[];
      let mainFiles: string[];
      let fileCount: number;
      let truncated: boolean;

      // Check if this is a Node.js package
      const packageJsonPath = join(packageLocation, 'package.json');
      let isNodePackage = false;
      
      try {
        await fs.access(packageJsonPath);
        isNodePackage = true;
      } catch {
        // Not a Node.js package
      }

      // Get important/main files for the package
      if (isNodePackage) {
        mainFiles = ['package.json', 'index.js', 'index.ts', 'index.mjs', 'lib/index.js', 'dist/index.js', 'src/index.ts'];
      } else {
        mainFiles = ['__init__.py', 'setup.py', 'pyproject.toml', '__main__.py'];
      }

      // Filter main files to only include those that exist
      const existingMainFiles: string[] = [];
      for (const file of mainFiles) {
        try {
          const fullPath = join(packageLocation, file);
          await fs.access(fullPath);
          existingMainFiles.push(file);
        } catch {
          // File doesn't exist
        }
      }
      mainFiles = existingMainFiles;

      if (includeTree) {
        // Generate full file tree with specified constraints
        const fullTree = await generateFileTree(packageLocation, {
          maxDepth: maxDepth || 2,
          maxFiles: 200,  // Limit files even when includeTree is true
        });

        // Apply pattern filtering if provided
        if (pattern) {
          // Convert glob pattern to regex
          const regexPattern = pattern
            .replace(/\*\*/g, '.*')  // ** matches any number of directories
            .replace(/\*/g, '[^/]*') // * matches any characters except /
            .replace(/\?/g, '.');     // ? matches single character
          
          const regex = new RegExp(regexPattern);
          fileTree = fullTree.filter(file => regex.test(file));
        } else {
          fileTree = fullTree;
        }

        fileCount = fullTree.length;
        if (fileTree.length > 200) {
          fileTree = fileTree.slice(0, 200);
          truncated = true;
        } else {
          truncated = false;
        }
      } else {
        // Lazy loading: only return main files and count
        const fullTree = await generateFileTree(packageLocation, {
          maxDepth: 1,  // Only scan top level
          maxFiles: 50,
        });
        fileCount = fullTree.length;
        fileTree = mainFiles;  // Only return main files
        truncated = false;  // Not truncated in lazy mode
      }

      // Try to read main/init file content
      let initContent: string | undefined;

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
        fileCount,
        mainFiles,
        ...(truncated && { truncated }),
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
