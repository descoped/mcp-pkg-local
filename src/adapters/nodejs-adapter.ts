/**
 * Node.js/TypeScript adapter for extracting package content
 * Uses ts-morph AST parser for comprehensive code analysis
 */

import { BaseAdapter } from './base-adapter.js';
import { ASTParser } from '#parsers/ast-parser.js';
import type { UnifiedPackageContent } from '#types/unified-schema.js';
import type { BasicPackageInfo } from '#scanners/types.js';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';

export class NodeJSAdapter extends BaseAdapter {
  private parser: ASTParser | null = null;

  readonly language = 'javascript' as const;

  async extractContent(
    packagePath: string,
    packageInfo: BasicPackageInfo,
  ): Promise<UnifiedPackageContent> {
    // Initialize parser if not already done
    this.parser ??= new ASTParser();

    // Use metadata from packageInfo if available, otherwise read it
    const packageMetadata = packageInfo.metadata ?? (await this.readPackageMetadata(packagePath));

    try {
      // Use the AST parser to extract content
      return await this.parser.parsePackage(packagePath, packageMetadata);
    } catch (error) {
      console.error(`[NodeJSAdapter] Failed to parse package at ${packagePath}:`, error);
      // Return minimal content on error
      return this.createMinimalContent(packageMetadata);
    }
  }

  async getEntryPoints(packagePath: string, packageInfo: BasicPackageInfo): Promise<string[]> {
    const entryPoints: string[] = [];
    const packageMetadata = packageInfo.metadata ?? (await this.readPackageMetadata(packagePath));

    // Check main entry
    const main = packageMetadata.main ?? packageMetadata.module ?? 'index.js';
    if (main) {
      entryPoints.push(String(main));
    }

    // Check types entry
    const types = packageMetadata.types ?? packageMetadata.typings;
    if (types) {
      entryPoints.push(String(types));
    }

    // Check for common entry files if none specified
    if (entryPoints.length === 0) {
      const commonEntries = [
        'index.js',
        'index.ts',
        'src/index.js',
        'src/index.ts',
        'lib/index.js',
      ];
      for (const entry of commonEntries) {
        try {
          const entryPath = join(packagePath, entry);
          const stats = await stat(entryPath);
          if (stats.isFile()) {
            entryPoints.push(entry);
            break;
          }
        } catch {
          // File doesn't exist, continue
        }
      }
    }

    return entryPoints;
  }

  private async readPackageMetadata(packagePath: string): Promise<Record<string, unknown>> {
    try {
      const content = await this.readPackageFile(packagePath, 'package.json');
      if (content) {
        return JSON.parse(content) as Record<string, unknown>;
      }
    } catch {
      // Fall back to empty metadata
    }
    return {};
  }

  cleanup(): void {
    if (this.parser) {
      this.parser.clear();
      this.parser = null;
    }
  }

  private createMinimalContent(packageMetadata: Record<string, unknown>): UnifiedPackageContent {
    return {
      metadata: {
        name: String(packageMetadata.name ?? 'unknown'),
        version: String(packageMetadata.version ?? '0.0.0'),
        description: String(packageMetadata.description ?? ''),
        license: String(packageMetadata.license ?? 'UNLICENSED'),
        packageManager: 'npm',
        mainEntry: String(packageMetadata.main ?? packageMetadata.module ?? 'index.js'),
        typeSystem: {
          isStronglyTyped: false,
          hasTypeAnnotations: false,
          typeDefinitionFile:
            String(packageMetadata.types ?? packageMetadata.typings ?? '') || undefined,
        },
      },
      components: {
        classes: [],
        functions: [],
        interfaces: [],
        enums: [],
        types: [],
        constants: [],
      },
      exports: {
        default: undefined,
        named: [],
      },
      dependencies: {
        runtime: (packageMetadata.dependencies ?? {}) as Record<string, string>,
        development: (packageMetadata.devDependencies ?? {}) as Record<string, string>,
        peer: (packageMetadata.peerDependencies ?? {}) as Record<string, string> | undefined,
        optional: (packageMetadata.optionalDependencies ?? {}) as
          | Record<string, string>
          | undefined,
      },
      configuration: {
        environment: [],
        commands: (packageMetadata.scripts ?? {}) as Record<string, string>,
        buildSystem: 'npm',
      },
    };
  }
}
