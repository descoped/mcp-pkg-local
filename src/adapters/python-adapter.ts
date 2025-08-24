/**
 * Python adapter for extracting package content
 * TODO: Implement Python AST parsing similar to Node.js
 */

import { BaseAdapter } from './base-adapter.js';
import type { UnifiedPackageContent } from '#types/unified-schema.js';
import type { BasicPackageInfo } from '#scanners/types.js';
import { stat, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

export class PythonAdapter extends BaseAdapter {
  readonly language = 'python' as const;

  async extractContent(
    packagePath: string,
    packageInfo: BasicPackageInfo,
  ): Promise<UnifiedPackageContent> {
    // TODO: Implement Python AST parsing
    // For now, return structured content based on package metadata

    const content: UnifiedPackageContent = {
      metadata: {
        name: packageInfo.name,
        version: packageInfo.version,
        description: '',
        license: 'UNLICENSED',
        packageManager: 'pip' as const,
        mainEntry: '__init__.py',
        typeSystem: {
          isStronglyTyped: false,
          hasTypeAnnotations: await this.hasTypeHints(packagePath),
        },
      },
      components: {
        classes: [],
        functions: [],
        constants: [],
        // Python can have these but we need AST parsing to extract them
        types: [],
        interfaces: undefined,
        enums: undefined,
      },
      exports: {
        default: undefined,
        named: await this.extractPythonExports(packagePath),
      },
      dependencies: {
        runtime: {}, // TODO: Parse from requirements.txt or pyproject.toml
        development: {},
        peer: undefined,
        optional: undefined,
      },
      configuration: {
        environment: [],
        commands: {},
        buildSystem: 'setuptools',
      },
    };

    // Try to extract basic information from __init__.py
    await this.extractBasicPythonInfo(packagePath, content);

    return content;
  }

  async getEntryPoints(packagePath: string, _packageInfo: BasicPackageInfo): Promise<string[]> {
    const entryPoints: string[] = [];

    // Check for __init__.py
    try {
      const initPath = join(packagePath, '__init__.py');
      const stats = await stat(initPath);
      if (stats.isFile()) {
        entryPoints.push('__init__.py');
      }
    } catch {
      // Not found
    }

    // Check for __main__.py
    try {
      const mainPath = join(packagePath, '__main__.py');
      const stats = await stat(mainPath);
      if (stats.isFile()) {
        entryPoints.push('__main__.py');
      }
    } catch {
      // Not found
    }

    // If no standard entry points, list all .py files in root
    if (entryPoints.length === 0) {
      try {
        const files = await readdir(packagePath);
        const pyFiles = files.filter((f) => f.endsWith('.py') && !f.startsWith('test'));
        entryPoints.push(...pyFiles.slice(0, 5)); // Limit to first 5 files
      } catch {
        // Can't read directory
      }
    }

    return entryPoints;
  }

  cleanup(): void {
    // Python adapter doesn't hold resources currently
  }

  private async hasTypeHints(packagePath: string): Promise<boolean> {
    try {
      // Check if package has .pyi stub files or uses type hints
      const files = await readdir(packagePath);
      return files.some((f) => f.endsWith('.pyi'));
    } catch {
      return false;
    }
  }

  private async extractPythonExports(packagePath: string): Promise<string[]> {
    const exports: string[] = [];

    try {
      const initPath = join(packagePath, '__init__.py');
      const content = await readFile(initPath, 'utf-8');

      // Basic regex to find __all__ exports
      const allMatch = /__all__\s*=\s*\[(.*?)]/s.exec(content);
      if (allMatch?.[1]) {
        const exportsList = allMatch[1];
        const names = exportsList.match(/['"](\w+)['"]/g);
        if (names) {
          exports.push(...names.map((n) => n.replace(/['"]/g, '')));
        }
      }

      // Also look for direct exports (from .module import name)
      const fromImports = content.match(/from\s+\.[\w.]+\s+import\s+(\w+(?:\s*,\s*\w+)*)/g);
      if (fromImports) {
        for (const imp of fromImports) {
          const names = /import\s+(.+)$/.exec(imp)?.[1];
          if (names) {
            exports.push(...names.split(',').map((n) => n.trim()));
          }
        }
      }
    } catch {
      // If we can't read __init__.py, no exports
    }

    return [...new Set(exports)]; // Remove duplicates
  }

  private async extractBasicPythonInfo(
    packagePath: string,
    content: UnifiedPackageContent,
  ): Promise<void> {
    try {
      const initPath = join(packagePath, '__init__.py');
      const initContent = await readFile(initPath, 'utf-8');

      // Extract classes (basic regex approach until we have proper AST parsing)
      const classMatches = initContent.match(/^class\s+(\w+)/gm);
      if (classMatches) {
        for (const match of classMatches) {
          const className = match.replace(/^class\s+/, '');
          content.components.classes.push({
            name: className,
            visibility: 'public',
            methods: [],
            properties: [],
          });
        }
      }

      // Extract functions
      const funcMatches = initContent.match(/^def\s+(\w+)/gm);
      if (funcMatches) {
        for (const match of funcMatches) {
          const funcName = match.replace(/^def\s+/, '');
          if (!funcName.startsWith('_') || funcName.startsWith('__')) {
            content.components.functions.push({
              name: funcName,
              parameters: [],
              returns: { name: 'Any' },
              isExported: true,
            });
          }
        }
      }

      // Extract constants
      const constMatches = initContent.match(/^[A-Z_]+\s*=/gm);
      if (constMatches) {
        for (const match of constMatches) {
          const constName = match.replace(/\s*=.*/, '');
          content.components.constants.push({
            name: constName,
            isExported: true,
          });
        }
      }
    } catch {
      // If we can't read __init__.py, leave components empty
    }
  }
}
