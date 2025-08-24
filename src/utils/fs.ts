import { promises as fs } from 'node:fs';
import { join, relative } from 'node:path';

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
