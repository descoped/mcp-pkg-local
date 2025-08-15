import { promises as fs } from 'node:fs';
import { join, relative, basename } from 'node:path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const BINARY_EXTENSIONS = new Set([
  '.pyc',
  '.pyo',
  '.pyd',
  '.so',
  '.dll',
  '.dylib',
  '.exe',
  '.bin',
  '.dat',
  '.db',
  '.sqlite',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.bmp',
  '.zip',
  '.tar',
  '.gz',
  '.bz2',
  '.xz',
]);

export async function readFileWithSizeCheck(path: string): Promise<string> {
  const stats = await fs.stat(path);

  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${stats.size} bytes (max: ${MAX_FILE_SIZE} bytes)`);
  }

  // Check if binary file
  const ext = path.substring(path.lastIndexOf('.'));
  if (BINARY_EXTENSIONS.has(ext.toLowerCase())) {
    throw new Error(`Cannot read binary file: ${basename(path)}`);
  }

  return fs.readFile(path, 'utf-8');
}

export async function generateFileTree(
  rootPath: string,
  options: {
    maxDepth?: number;
    maxFiles?: number;
    excludePatterns?: RegExp[];
  } = {},
): Promise<string[]> {
  const {
    maxDepth = 5,
    maxFiles = 1000,
    excludePatterns = [/__pycache__/, /\.pyc$/, /\.pyo$/, /\.egg-info/, /\.dist-info/],
  } = options;

  const files: string[] = [];

  async function walk(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth || files.length >= maxFiles) {
      return;
    }

    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (files.length >= maxFiles) break;

      const fullPath = join(dir, entry.name);
      const relativePath = relative(rootPath, fullPath);

      // Check exclusion patterns
      if (excludePatterns.some((pattern) => pattern.test(relativePath))) {
        continue;
      }

      if (entry.isDirectory()) {
        await walk(fullPath, depth + 1);
      } else if (entry.isFile()) {
        // Only include Python files and important metadata files
        if (
          entry.name.endsWith('.py') ||
          entry.name === '__init__.py' ||
          entry.name === 'setup.py' ||
          entry.name === 'pyproject.toml' ||
          entry.name === 'requirements.txt' ||
          entry.name === 'README.md' ||
          entry.name === 'LICENSE'
        ) {
          files.push(relativePath);
        }
      }
    }
  }

  await walk(rootPath, 0);
  return files.sort();
}

export function sanitizePath(basePath: string, requestedPath: string): string {
  // Normalize and resolve the path
  const resolved = join(basePath, requestedPath);

  // Ensure the resolved path is within the base path
  const relative_path = relative(basePath, resolved);

  if (relative_path.startsWith('..') || resolved === basePath) {
    throw new Error('Invalid path: outside of package directory');
  }

  return resolved;
}
