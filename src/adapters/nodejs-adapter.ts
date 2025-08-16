/**
 * Node.js/TypeScript adapter for extracting package content
 * Uses ts-morph AST parser for comprehensive code analysis
 */

import { BaseAdapter } from './base-adapter.js';
import { ASTParser } from '#parsers/ast-parser';
import type { UnifiedPackageContent } from '#types/unified-schema';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';

export class NodeJSAdapter extends BaseAdapter {
  private parser: ASTParser | null = null;

  get language(): string {
    return 'javascript';
  }

  async extractContent(
    packagePath: string,
    packageMetadata: Record<string, unknown>
  ): Promise<UnifiedPackageContent> {
    // Initialize parser if not already done
    this.parser ??= new ASTParser();

    try {
      // Use the AST parser to extract content
      return await this.parser.parsePackage(packagePath, packageMetadata);
    } catch (error) {
      console.error(`[NodeJSAdapter] Failed to parse package at ${packagePath}:`, error);
      // Return minimal content on error
      return this.createMinimalContent(packageMetadata);
    }
  }

  async canHandle(
    packagePath: string,
    packageMetadata: Record<string, unknown>
  ): Promise<boolean> {
    // Check if it's a Node.js package by looking for package.json
    try {
      const packageJsonPath = join(packagePath, 'package.json');
      const stats = await stat(packageJsonPath);
      return stats.isFile();
    } catch {
      // If package.json doesn't exist, check if we have one in metadata
      return packageMetadata && 'name' in packageMetadata && 'version' in packageMetadata;
    }
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
          typeDefinitionFile: String(packageMetadata.types ?? packageMetadata.typings ?? '') || undefined,
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
        optional: (packageMetadata.optionalDependencies ?? {}) as Record<string, string> | undefined,
      },
      configuration: {
        environment: [],
        commands: (packageMetadata.scripts ?? {}) as Record<string, string>,
        buildSystem: 'npm',
      },
    };
  }
}