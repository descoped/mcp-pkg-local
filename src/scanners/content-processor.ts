/**
 * Content processor that orchestrates language-specific adapters
 * Manages adapter selection and content extraction
 */

import { NodeJSAdapter } from '#adapters/nodejs-adapter';
import { PythonAdapter } from '#adapters/python-adapter';
import type { BaseAdapter } from '#adapters/base-adapter';
import type { UnifiedPackageContent } from '#types/unified-schema';

export class ContentProcessor {
  private adapters: BaseAdapter[] = [];
  private adapterCache = new Map<string, BaseAdapter>();

  constructor() {
    // Initialize available adapters
    this.adapters = [
      new NodeJSAdapter(),
      new PythonAdapter(),
    ];
  }

  /**
   * Process a package and extract unified content
   * @param packagePath Absolute path to the package
   * @param packageMetadata Package metadata object
   * @param language Optional language hint
   */
  async processPackage(
    packagePath: string,
    packageMetadata: Record<string, unknown>,
    language?: string
  ): Promise<UnifiedPackageContent | null> {
    // Try to get adapter from cache if we have a language hint
    let adapter: BaseAdapter | null = null;
    
    if (language) {
      adapter = this.adapterCache.get(language) ?? null;
    }

    // If no cached adapter, find the appropriate one
    if (!adapter) {
      for (const candidateAdapter of this.adapters) {
        if (await candidateAdapter.canHandle(packagePath, packageMetadata)) {
          adapter = candidateAdapter;
          // Cache for future use
          this.adapterCache.set(candidateAdapter.language, candidateAdapter);
          break;
        }
      }
    }

    if (!adapter) {
      console.warn(`[ContentProcessor] No adapter found for package at ${packagePath}`);
      return null;
    }

    try {
      const content = await adapter.extractContent(packagePath, packageMetadata);
      return content;
    } catch (error) {
      console.error(`[ContentProcessor] Failed to process package at ${packagePath}:`, error);
      return null;
    }
  }

  /**
   * Clean up all adapters and resources
   */
  cleanup(): void {
    for (const adapter of this.adapters) {
      adapter.cleanup();
    }
    this.adapterCache.clear();
  }

  /**
   * Get the adapter for a specific language
   */
  getAdapter(language: string): BaseAdapter | undefined {
    return this.adapters.find(adapter => adapter.language === language);
  }

  /**
   * Check if a language is supported
   */
  isLanguageSupported(language: string): boolean {
    return this.adapters.some(adapter => adapter.language === language);
  }
}