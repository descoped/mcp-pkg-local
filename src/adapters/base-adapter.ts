/**
 * Base adapter for language-specific package processing
 * Provides a common interface for extracting package information across different languages
 */

import type { UnifiedPackageContent } from '#types/unified-schema';

export abstract class BaseAdapter {
  /**
   * Extract unified package content from a package
   * @param packagePath Absolute path to the package directory
   * @param packageMetadata Package metadata (package.json, pyproject.toml, etc.)
   */
  abstract extractContent(
    packagePath: string,
    packageMetadata: Record<string, unknown>
  ): Promise<UnifiedPackageContent>;

  /**
   * Check if this adapter can handle the given package
   * @param packagePath Path to the package
   * @param packageMetadata Package metadata
   */
  abstract canHandle(
    packagePath: string,
    packageMetadata: Record<string, unknown>
  ): Promise<boolean>;

  /**
   * Get the language this adapter handles
   */
  abstract get language(): string;

  /**
   * Clean up any resources used by the adapter
   */
  abstract cleanup(): void;
}