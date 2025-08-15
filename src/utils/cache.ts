import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { IndexFile, ScanResult } from '#types';
import { IndexFileSchema } from '#types';

const INDEX_FILE_NAME = '.pkg-local-index.json';
const INDEX_VERSION = '1.0.0';

export class IndexCache {
  private readonly indexPath: string;
  private cache: IndexFile | null = null;

  constructor(basePath: string = process.cwd()) {
    this.indexPath = join(basePath, INDEX_FILE_NAME);
  }

  async exists(): Promise<boolean> {
    try {
      await fs.access(this.indexPath);
      return true;
    } catch {
      return false;
    }
  }

  async read(): Promise<IndexFile | null> {
    try {
      if (this.cache) {
        return this.cache;
      }

      const content = await fs.readFile(this.indexPath, 'utf-8');
      const data = JSON.parse(content) as unknown;

      // Validate with Zod schema
      const validated = IndexFileSchema.parse(data);

      // Check version compatibility
      if (validated.version !== INDEX_VERSION) {
        console.error(
          `Index version mismatch: expected ${INDEX_VERSION}, got ${validated.version}`,
        );
        return null;
      }

      this.cache = validated;
      return validated;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Failed to read index file:', error);
      }
      return null;
    }
  }

  async write(scanResult: ScanResult): Promise<void> {
    const indexFile: IndexFile = {
      version: INDEX_VERSION,
      lastUpdated: scanResult.scanTime,
      environment: scanResult.environment,
      packages: scanResult.packages,
    };

    // Write atomically using a temp file
    const tempPath = `${this.indexPath}.tmp`;

    try {
      await fs.writeFile(tempPath, JSON.stringify(indexFile, null, 2), 'utf-8');

      // Atomic rename
      await fs.rename(tempPath, this.indexPath);

      // Update cache
      this.cache = indexFile;
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  async getAge(): Promise<number | null> {
    try {
      const stats = await fs.stat(this.indexPath);
      return Date.now() - stats.mtime.getTime();
    } catch {
      return null;
    }
  }

  async isStale(maxAgeMs = 3600000): Promise<boolean> {
    const age = await this.getAge();
    return age === null || age > maxAgeMs;
  }
}
