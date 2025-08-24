/**
 * Markdown Generator for Unified Package Content
 *
 * Generates consistent markdown documentation from unified schema
 * regardless of source language or package manager
 */

import { hasComponents } from '#types/unified-schema.js';
import type {
  UnifiedPackageContent,
  ComponentClass,
  ComponentFunction,
  ComponentInterface,
  ComponentEnum,
  ComponentStruct,
  ComponentTrait,
} from '#types/unified-schema.js';

export class MarkdownGenerator {
  /**
   * Generate standardized markdown from unified content
   * SAME output format regardless of source language
   */
  static generate(content: UnifiedPackageContent): string {
    const sections: string[] = [];

    // Header
    sections.push(`# ${content.metadata.name} Overview\n`);

    // Package Information (same for all languages)
    sections.push(this.generateMetadataSection(content.metadata));

    // Configuration (if present)
    if (content.configuration) {
      sections.push(this.generateConfigurationSection(content.configuration));
    }

    // Core Components
    if (hasComponents(content)) {
      sections.push(this.generateComponentsSection(content.components));
    }

    // Usage Patterns
    if (content.patterns?.examples && content.patterns.examples.length > 0) {
      sections.push(this.generatePatternsSection(content.patterns));
    }

    // Exports
    sections.push(this.generateExportsSection(content.exports));

    // Dependencies
    if (Object.keys(content.dependencies.runtime).length > 0) {
      sections.push(this.generateDependenciesSection(content.dependencies));
    }

    return sections.filter((s) => s.length > 0).join('\n');
  }

  private static generateMetadataSection(metadata: UnifiedPackageContent['metadata']): string {
    const lines: string[] = ['## 📦 Package Information'];
    lines.push(`name: ${metadata.name}`);
    lines.push(`version: ${metadata.version}`);
    lines.push(`type: ${metadata.description ?? 'No description'}`);

    if (metadata.mainEntry) {
      lines.push(`main: ${metadata.mainEntry}`);
    }

    lines.push(`license: ${metadata.license ?? 'Not specified'}`);
    lines.push(`package_manager: ${metadata.packageManager}`);

    // Type system info (if relevant)
    if (metadata.typeSystem) {
      const typeSystem = metadata.typeSystem.isStronglyTyped
        ? 'strongly typed'
        : 'dynamically typed';
      lines.push(`type_system: ${typeSystem}`);

      if (metadata.typeSystem.hasTypeAnnotations) {
        lines.push(`type_annotations: available`);
      }

      if (metadata.typeSystem.typeDefinitionFile) {
        lines.push(`type_definitions: ${metadata.typeSystem.typeDefinitionFile}`);
      }
    }

    if (metadata.homepage) {
      lines.push(`homepage: ${metadata.homepage}`);
    }

    if (metadata.repository) {
      lines.push(`repository: ${metadata.repository}`);
    }

    lines.push('');
    return lines.join('\n');
  }

  private static generateConfigurationSection(
    configuration: UnifiedPackageContent['configuration'],
  ): string {
    const lines: string[] = ['## 🔧 Configuration'];

    if (!configuration) {
      return '';
    }

    if (configuration.buildSystem) {
      lines.push(`build_system: ${configuration.buildSystem}`);
    }

    if (configuration.environment && configuration.environment.length > 0) {
      lines.push('environment_variables:');
      configuration.environment.forEach((env: string) => lines.push(`  - ${env}`));
    }

    if (configuration.commands && Object.keys(configuration.commands).length > 0) {
      lines.push('\ncommands:');
      Object.entries(configuration.commands).forEach(([name, cmd]) =>
        lines.push(`  - ${name}: ${cmd}`),
      );
    }

    if (configuration.entryPoints && configuration.entryPoints.length > 0) {
      lines.push('\nentry_points:');
      configuration.entryPoints.forEach((entry: string) => lines.push(`  - ${entry}`));
    }

    lines.push('');
    return lines.join('\n');
  }

  private static generateComponentsSection(
    components: UnifiedPackageContent['components'],
  ): string {
    const lines: string[] = ['## 🏗️ Core Components\n'];
    let componentNum = 1;

    // Classes (all languages)
    if (components.classes && components.classes.length > 0) {
      for (const cls of components.classes) {
        lines.push(...this.generateClassSection(cls, componentNum++));
      }
    }

    // Functions (exported only)
    if (components.functions && components.functions.length > 0) {
      const exportedFunctions = components.functions.filter((f: ComponentFunction) => f.isExported);
      for (const func of exportedFunctions) {
        lines.push(...this.generateFunctionSection(func, componentNum++));
      }
    }

    // Interfaces (Java, TypeScript, Go)
    if (components.interfaces && components.interfaces.length > 0) {
      for (const iface of components.interfaces) {
        lines.push(...this.generateInterfaceSection(iface, componentNum++));
      }
    }

    // Enums
    if (components.enums && components.enums.length > 0) {
      for (const enumDef of components.enums) {
        lines.push(...this.generateEnumSection(enumDef, componentNum++));
      }
    }

    // Structs (Go, Rust, C)
    if (components.structs && components.structs.length > 0) {
      for (const struct of components.structs) {
        lines.push(...this.generateStructSection(struct, componentNum++));
      }
    }

    // Traits (Rust)
    if (components.traits && components.traits.length > 0) {
      for (const trait of components.traits) {
        lines.push(...this.generateTraitSection(trait, componentNum++));
      }
    }

    // Constants (exported only)
    if (components.constants && components.constants.length > 0) {
      const exportedConstants = components.constants.filter((c) => c.isExported);
      if (exportedConstants.length > 0) {
        lines.push(`### Constants`);
        for (const constant of exportedConstants) {
          lines.push(
            `  - ${constant.name}${constant.type ? `: ${constant.type}` : ''}${constant.value ? ` = ${constant.value}` : ''}`,
          );
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  private static generateClassSection(cls: ComponentClass, num: number): string[] {
    const lines: string[] = [];
    lines.push(`### ${num}. ${cls.name}`);
    lines.push(`purpose: ${cls.purpose ?? 'Class implementation'}`);

    if (cls.extends) lines.push(`extends: ${cls.extends}`);
    if (cls.implements && cls.implements.length > 0) {
      lines.push(`implements: ${cls.implements.join(', ')}`);
    }
    if (cls.traits && cls.traits.length > 0) {
      lines.push(`traits: ${cls.traits.join(', ')}`);
    }
    if (cls.visibility) lines.push(`visibility: ${cls.visibility}`);
    if (cls.isAbstract) lines.push(`abstract: true`);
    if (cls.isFinal) lines.push(`final: true`);
    if (cls.isStatic) lines.push(`static: true`);

    if (cls.methods && cls.methods.length > 0) {
      lines.push('methods:');
      cls.methods.forEach((m) => {
        const params = m.parameters.map((p) => p.name).join(', ');
        const returnType = m.returns?.name ?? 'void';
        const modifiers = [];
        if (m.visibility !== 'public') modifiers.push(m.visibility);
        if (m.isStatic) modifiers.push('static');
        if (m.isAsync) modifiers.push('async');
        const prefix = modifiers.length > 0 ? `[${modifiers.join(' ')}] ` : '';
        lines.push(`  - ${prefix}${m.name}(${params}): ${returnType}`);
      });
    }

    if (cls.properties && cls.properties.length > 0) {
      lines.push('properties:');
      cls.properties.forEach((p) => {
        const modifiers = [];
        if (p.visibility && p.visibility !== 'public') modifiers.push(p.visibility);
        if (p.isStatic) modifiers.push('static');
        if (p.isReadonly) modifiers.push('readonly');
        const prefix = modifiers.length > 0 ? `[${modifiers.join(' ')}] ` : '';
        lines.push(`  - ${prefix}${p.name}${p.type ? `: ${p.type}` : ''}`);
      });
    }

    lines.push('');
    return lines;
  }

  private static generateFunctionSection(func: ComponentFunction, num: number): string[] {
    const lines: string[] = [];
    lines.push(`### ${num}. ${func.name}()`);
    lines.push(`purpose: ${func.purpose ?? 'Function implementation'}`);

    if (func.parameters && func.parameters.length > 0) {
      const params = func.parameters
        .map((p) => {
          let param = p.name;
          if (!p.required) param += '?';
          if (p.type) param += `: ${p.type}`;
          if (p.isVariadic) param = `...${param}`;
          return param;
        })
        .join(', ');
      lines.push(`parameters: ${params}`);
    }

    if (func.returns) {
      lines.push(`returns: ${func.returns.name}`);
    }

    if (func.isAsync) lines.push(`async: true`);
    if (func.isGenerator) lines.push(`generator: true`);
    if (func.visibility && func.visibility !== 'public') {
      lines.push(`visibility: ${func.visibility}`);
    }
    if (func.throws && func.throws.length > 0) {
      lines.push(`throws: ${func.throws.join(', ')}`);
    }

    lines.push('');
    return lines;
  }

  private static generateInterfaceSection(iface: ComponentInterface, num: number): string[] {
    const lines: string[] = [];
    lines.push(`### ${num}. ${iface.name} (interface)`);
    lines.push(`purpose: ${iface.purpose ?? 'Interface definition'}`);

    if (iface.extends && iface.extends.length > 0) {
      lines.push(`extends: ${iface.extends.join(', ')}`);
    }

    if (iface.methods && iface.methods.length > 0) {
      lines.push('methods:');
      iface.methods.forEach((m) => {
        const params = m.parameters.map((p) => p.name).join(', ');
        const returnType = m.returns?.name ?? 'void';
        lines.push(`  - ${m.name}(${params}): ${returnType}`);
      });
    }

    if (iface.properties && iface.properties.length > 0) {
      lines.push('properties:');
      iface.properties.forEach((p) => {
        lines.push(`  - ${p.name}${p.type ? `: ${p.type}` : ''}`);
      });
    }

    lines.push('');
    return lines;
  }

  private static generateEnumSection(enumDef: ComponentEnum, num: number): string[] {
    const lines: string[] = [];
    lines.push(`### ${num}. ${enumDef.name} (enum)`);
    lines.push('values:');
    enumDef.values.forEach((v) => lines.push(`  - ${v}`));
    lines.push('');
    return lines;
  }

  private static generateStructSection(struct: ComponentStruct, num: number): string[] {
    const lines: string[] = [];
    lines.push(`### ${num}. ${struct.name} (struct)`);

    if (struct.fields && struct.fields.length > 0) {
      lines.push('fields:');
      struct.fields.forEach((f) => {
        lines.push(`  - ${f.name}${f.type ? `: ${f.type}` : ''}`);
      });
    }

    if (struct.methods && struct.methods.length > 0) {
      lines.push('methods:');
      struct.methods.forEach((m) => {
        const params = m.parameters.map((p) => p.name).join(', ');
        const returnType = m.returns?.name ?? 'void';
        lines.push(`  - ${m.name}(${params}): ${returnType}`);
      });
    }

    lines.push('');
    return lines;
  }

  private static generateTraitSection(trait: ComponentTrait, num: number): string[] {
    const lines: string[] = [];
    lines.push(`### ${num}. ${trait.name} (trait)`);

    if (trait.methods && trait.methods.length > 0) {
      lines.push('methods:');
      trait.methods.forEach((m) => {
        const params = m.parameters.map((p) => p.name).join(', ');
        const returnType = m.returns?.name ?? 'void';
        lines.push(`  - ${m.name}(${params}): ${returnType}`);
      });
    }

    if (trait.associatedTypes && trait.associatedTypes.length > 0) {
      lines.push('associated_types:');
      trait.associatedTypes.forEach((t) => lines.push(`  - ${t}`));
    }

    lines.push('');
    return lines;
  }

  private static generatePatternsSection(patterns: UnifiedPackageContent['patterns']): string {
    const lines: string[] = ['## 🎯 Usage Patterns\n'];

    if (!patterns) {
      return '';
    }

    if (patterns.initialization) {
      lines.push(`### Initialization`);
      lines.push(`\`\`\`${patterns.initialization}\`\`\``);
      lines.push('');
    }

    if (patterns.examples) {
      for (const example of patterns.examples) {
        lines.push(`### ${example.title}`);
        if (example.description) {
          lines.push(example.description);
        }
        lines.push(`\`\`\`${example.language}`);
        lines.push(example.code);
        lines.push('```\n');
      }
    }

    if (patterns.commonUsage && patterns.commonUsage.length > 0) {
      lines.push('### Common Usage');
      patterns.commonUsage.forEach((usage) => lines.push(`- ${usage}`));
      lines.push('');
    }

    return lines.join('\n');
  }

  private static generateExportsSection(exports: UnifiedPackageContent['exports']): string {
    const lines: string[] = ['## 🔌 Exports'];

    if (exports.default) {
      lines.push(`main_export: ${exports.default}`);
    }

    if (exports.namespace) {
      lines.push(`namespace: ${exports.namespace}`);
    }

    if (exports.named && exports.named.length > 0) {
      lines.push('named_exports:');
      exports.named.forEach((e: string) => lines.push(`  - ${e}`));
    }

    if (exports.public && exports.public.length > 0) {
      lines.push('public_exports:');
      exports.public.forEach((e: string) => lines.push(`  - ${e}`));
    }

    lines.push('');
    return lines.join('\n');
  }

  private static generateDependenciesSection(
    dependencies: UnifiedPackageContent['dependencies'],
  ): string {
    const lines: string[] = ['## 🔗 Dependencies'];

    const runtimeDeps = Object.entries(dependencies.runtime);
    if (runtimeDeps.length > 0) {
      runtimeDeps.forEach(([name, version]) => {
        lines.push(`  - ${name}: ${version}`);
      });
    }

    if (dependencies.development && Object.keys(dependencies.development).length > 0) {
      lines.push('\n### Development Dependencies');
      Object.entries(dependencies.development).forEach(([name, version]) => {
        lines.push(`  - ${name}: ${version}`);
      });
    }

    if (dependencies.peer && Object.keys(dependencies.peer).length > 0) {
      lines.push('\n### Peer Dependencies');
      Object.entries(dependencies.peer).forEach(([name, version]) => {
        lines.push(`  - ${name}: ${version}`);
      });
    }

    lines.push('');
    return lines.join('\n');
  }
}
