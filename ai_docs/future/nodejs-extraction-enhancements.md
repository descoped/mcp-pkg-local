# Node.js Source Code Extraction Implementation Plan

**Status**: ✅ COMPLETED - All components implemented  
**Date**: 2025-08-16  
**Completed**: 2025-08-17  
**Author**: Claude Code Assistant  
**Priority**: CRITICAL - Core functionality gap

## COMPLETION SUMMARY

All planned components have been successfully implemented:
- ✅ Unified schema (`src/types/unified-schema.ts`)
- ✅ AST Parser with ts-morph (`src/parsers/ast-parser.ts`)
- ✅ NodeJS Adapter with AST extraction (`src/adapters/nodejs-adapter.ts`)
- ✅ Python Adapter (`src/adapters/python-adapter.ts`)
- ✅ Markdown Generator (`src/utils/markdown-generator.ts`)
- ✅ Integration in read-package tool

**CURRENT ISSUE**: The implementation exists but has a token size problem when `filePath` parameter is used, bypassing AST extraction.

## CONFORMANCE RULES (MUST BE RESPECTED)

### Rule 1: Code Replacement Policy
- **ALWAYS** explicitly state what existing code is being replaced
- **NEVER** create overlapping code that duplicates existing functionality
- **ALWAYS** remove old implementations when creating new ones
- **DOCUMENT** exact file paths and line numbers being replaced

### Rule 2: No Backwards Compatibility
- **NO** migration paths needed
- **NO** versioning of old formats
- **REPLACE** entirely, don't patch
- **DELETE** deprecated code immediately

### Rule 3: Unified Schema Flexibility
- **MUST** support strongly-typed languages (Java, Rust, Go)
- **MUST** support dynamically-typed languages (Python, JavaScript/TypeScript)
- **MUST** accommodate different package managers (Maven, Cargo, npm, pip, poetry, etc.)
- **USE** nullable fields for language-specific attributes
- **AVOID** language-specific assumptions in core schema

### Rule 4: Database Schema Principles
- **MAINTAIN** flat, efficient structure
- **NO** nested JSON blobs for core data
- **USE** MessagePack for optional metadata only
- **INDEX** all query patterns
- **DENORMALIZE** for performance when needed

## Problem Statement

Node.js packages return raw `package.json` while Python packages return structured Markdown with actual source code. The output must be unified, structured, and immediately useful for LLMs to understand imports, classes, functions, and usage patterns.

## Current Code Analysis

### Files That MUST Be Modified

1. **src/types.ts** (lines 1-150)
   - **REPLACE**: Current `PackageInfo` type (lines 4-18)
   - **REPLACE**: Current `ReadPackageResult` type (lines 45-69)
   - **ADD**: New unified schema types

2. **src/tools/read-package.ts** (lines 140-161)
   - **REPLACE**: Current Node.js handling that only reads package.json
   - **DELETE**: Lines 140-149 entirely
   - **ADD**: New unified content generation

3. **src/schemas/cache-schema.sql**
   - **REPLACE**: Current `packages` table (lines 38-59)
   - **ADD**: New columns for multi-language support

### Files That MUST Be Created

1. **src/types/unified-schema.ts** (NEW FILE)
2. **src/utils/markdown-generator.ts** (NEW FILE)
3. **src/adapters/nodejs-adapter.ts** (NEW FILE)
4. **src/adapters/python-adapter.ts** (NEW FILE)
5. **src/adapters/base-adapter.ts** (NEW FILE)

## Implementation Plan

### Phase 1: Define Unified Schema (30 min)

**CREATE NEW FILE**: `src/types/unified-schema.ts`

```typescript
// Unified content structure for ALL languages (Python, JS, Java, Rust, Go, etc.)
export interface UnifiedPackageContent {
  // Core metadata (required for all languages)
  metadata: {
    name: string;
    version: string;
    description: string;
    license: string;
    author?: string;
    homepage?: string;
    repository?: string;
    packageManager: 'npm' | 'pip' | 'poetry' | 'maven' | 'cargo' | 'go' | 'yarn' | 'pnpm' | 'bun' | 'uv';
    mainEntry?: string;
    
    // Language-specific type information
    typeSystem?: {
      isStronglyTyped: boolean;  // true for Java, Rust, Go
      hasTypeAnnotations?: boolean;  // true for TypeScript, Python with hints
      typeDefinitionFile?: string;  // .d.ts, .pyi, etc.
    };
  };
  
  // Components extracted from source (flexible for all languages)
  components: {
    classes: ComponentClass[];
    functions: ComponentFunction[];
    constants: ComponentConstant[];
    types?: ComponentType[];  // For TS, Rust, etc.
    interfaces?: ComponentInterface[];  // For Java, TS, Go
    enums?: ComponentEnum[];  // For Java, Rust, TS
    traits?: ComponentTrait[];  // For Rust
    structs?: ComponentStruct[];  // For Go, Rust
  };
  
  // Export information (varies by language)
  exports: {
    default?: string;  // JS/TS
    named: string[];
    namespace?: string;  // Java packages, Go modules
    public?: string[];  // Java, Rust pub exports
  };
  
  // Dependencies (flexible structure)
  dependencies: {
    runtime: Record<string, string>;
    development?: Record<string, string>;  // Not all languages separate
    build?: Record<string, string>;  // Maven, Cargo build deps
    peer?: Record<string, string>;  // npm specific
    optional?: Record<string, string>;
  };
  
  // Build/Config information
  configuration?: {
    environment?: string[];
    buildSystem?: 'npm' | 'maven' | 'gradle' | 'cargo' | 'make' | 'cmake';
    commands?: Record<string, string>;
    entryPoints?: string[];  // Multiple mains for some langs
  };
  
  // Usage patterns
  patterns?: {
    examples: CodeExample[];
    initialization?: string;
    commonUsage?: string[];
  };
}

// Component definitions supporting multiple languages
export interface ComponentClass {
  name: string;
  purpose?: string;
  extends?: string;  // inheritance
  implements?: string[];  // interfaces (Java, TS)
  traits?: string[];  // Rust traits
  methods: MethodInfo[];
  properties?: PropertyInfo[];
  visibility?: 'public' | 'private' | 'protected' | 'internal';  // varies by lang
  isAbstract?: boolean;
  isFinal?: boolean;  // Java
  isStatic?: boolean;
  generics?: GenericInfo[];  // <T>, etc.
}

export interface ComponentFunction {
  name: string;
  purpose?: string;
  parameters: ParameterInfo[];
  returns?: TypeInfo;
  isAsync?: boolean;
  isGenerator?: boolean;
  isExported: boolean;
  visibility?: 'public' | 'private' | 'protected';
  generics?: GenericInfo[];
  throws?: string[];  // Java, checked exceptions
}

export interface TypeInfo {
  name: string;
  isNullable?: boolean;
  isArray?: boolean;
  generics?: TypeInfo[];
  primitive?: boolean;  // int, float, etc.
}

export interface GenericInfo {
  name: string;
  constraint?: string;  // T extends Comparable
  default?: string;
}

// ... other component interfaces
```

**MODIFY FILE**: `src/types.ts`
- **DELETE**: Lines 4-18 (old PackageInfo)
- **DELETE**: Lines 45-69 (old ReadPackageResult) 
- **ADD**: Import from unified-schema.ts

### Phase 2: Update Database Schema (30 min)

**MODIFY FILE**: `src/schemas/cache-schema.sql`

**REPLACE** lines 38-59 (packages table) with:

```sql
-- Enhanced package information table for multi-language support
CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  environment_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  location TEXT NOT NULL,
  
  -- Enhanced language support
  language TEXT NOT NULL CHECK (language IN (
    'python', 'javascript', 'typescript', 
    'java', 'rust', 'go', 'c', 'cpp'
  )),
  
  -- Package manager flexibility
  package_manager TEXT CHECK (package_manager IN (
    'npm', 'yarn', 'pnpm', 'bun',  -- JS ecosystem
    'pip', 'poetry', 'uv', 'conda',  -- Python
    'maven', 'gradle',  -- Java
    'cargo',  -- Rust
    'go',  -- Go modules
    'conan', 'vcpkg'  -- C/C++
  )),
  
  -- Category can vary by ecosystem
  category TEXT,  -- No constraint, allows custom categories
  
  -- Type system information
  is_strongly_typed BOOLEAN DEFAULT 0,
  has_type_definitions BOOLEAN DEFAULT 0,
  type_definition_path TEXT,
  
  -- Scoring remains consistent
  relevance_score INTEGER DEFAULT 0,
  popularity_score INTEGER DEFAULT 0,
  
  -- Metrics
  file_count INTEGER,
  size_bytes INTEGER,
  main_file TEXT,
  
  -- Dependency information
  is_direct_dependency BOOLEAN DEFAULT 0,
  dependency_depth INTEGER DEFAULT 0,  -- 0=direct, 1+=transitive
  
  -- Serialized unified content (MessagePack)
  unified_content BLOB,  -- Full UnifiedPackageContent
  content_hash TEXT,  -- SHA-256 of content for change detection
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  content_generated_at DATETIME,  -- When markdown was generated
  
  FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE CASCADE,
  UNIQUE(environment_id, name)
);
```

### Phase 3: Create Markdown Generator (45 min)

**CREATE NEW FILE**: `src/utils/markdown-generator.ts`

```typescript
import { UnifiedPackageContent } from '#types/unified-schema';

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
    sections.push('## 📦 Package Information');
    sections.push(`name: ${content.metadata.name}`);
    sections.push(`version: ${content.metadata.version}`);
    sections.push(`type: ${content.metadata.description || 'No description'}`);
    sections.push(`main: ${content.metadata.mainEntry || 'Not specified'}`);
    sections.push(`license: ${content.metadata.license || 'Not specified'}`);
    sections.push(`package_manager: ${content.metadata.packageManager}`);
    
    // Type system info (if relevant)
    if (content.metadata.typeSystem) {
      sections.push(`type_system: ${
        content.metadata.typeSystem.isStronglyTyped ? 'strongly typed' : 'dynamically typed'
      }`);
    }
    sections.push('');
    
    // Configuration (if present)
    if (content.configuration) {
      sections.push('## 🔧 Configuration');
      if (content.configuration.buildSystem) {
        sections.push(`build_system: ${content.configuration.buildSystem}`);
      }
      if (content.configuration.environment?.length) {
        sections.push('environment_variables:');
        content.configuration.environment.forEach(env => 
          sections.push(`  - ${env}`)
        );
      }
      sections.push('');
    }
    
    // Core Components
    if (this.hasComponents(content.components)) {
      sections.push('## 🏗️ Core Components\n');
      sections.push(...this.generateComponentsSection(content.components));
    }
    
    // Usage Patterns
    if (content.patterns?.examples?.length) {
      sections.push('## 🎯 Usage Patterns\n');
      for (const example of content.patterns.examples) {
        sections.push(`### ${example.title}`);
        sections.push('```' + example.language);
        sections.push(example.code);
        sections.push('```\n');
      }
    }
    
    // Exports
    sections.push('## 🔌 Exports');
    sections.push(...this.generateExportsSection(content.exports));
    
    // Dependencies
    if (Object.keys(content.dependencies.runtime).length > 0) {
      sections.push('\n## 🔗 Dependencies');
      Object.entries(content.dependencies.runtime).forEach(([name, version]) => {
        sections.push(`  - ${name}: ${version}`);
      });
    }
    
    return sections.join('\n');
  }
  
  private static hasComponents(components: any): boolean {
    return (
      components.classes?.length > 0 ||
      components.functions?.length > 0 ||
      components.interfaces?.length > 0 ||
      components.enums?.length > 0 ||
      components.traits?.length > 0 ||
      components.structs?.length > 0
    );
  }
  
  private static generateComponentsSection(components: any): string[] {
    const lines: string[] = [];
    let componentNum = 1;
    
    // Classes (all languages)
    for (const cls of components.classes || []) {
      lines.push(`### ${componentNum++}. ${cls.name}`);
      lines.push(`purpose: ${cls.purpose || 'Class implementation'}`);
      if (cls.extends) lines.push(`extends: ${cls.extends}`);
      if (cls.implements?.length) lines.push(`implements: ${cls.implements.join(', ')}`);
      if (cls.visibility) lines.push(`visibility: ${cls.visibility}`);
      
      if (cls.methods.length > 0) {
        lines.push('methods:');
        cls.methods.forEach((m: any) => {
          const params = m.parameters.map((p: any) => p.name).join(', ');
          lines.push(`  - ${m.name}(${params}): ${m.returns?.name || 'void'}`);
        });
      }
      lines.push('');
    }
    
    // Interfaces (Java, TypeScript, Go)
    for (const iface of components.interfaces || []) {
      lines.push(`### ${componentNum++}. ${iface.name} (interface)`);
      lines.push(`purpose: ${iface.purpose || 'Interface definition'}`);
      if (iface.methods?.length) {
        lines.push('methods:');
        iface.methods.forEach((m: any) => {
          lines.push(`  - ${m.name}(): ${m.returns?.name || 'void'}`);
        });
      }
      lines.push('');
    }
    
    // Add other component types...
    
    return lines;
  }
  
  private static generateExportsSection(exports: any): string[] {
    const lines: string[] = [];
    
    if (exports.default) {
      lines.push(`main_export: ${exports.default}`);
    }
    if (exports.namespace) {
      lines.push(`namespace: ${exports.namespace}`);
    }
    if (exports.named?.length > 0) {
      lines.push('named_exports:');
      exports.named.forEach((e: string) => lines.push(`  - ${e}`));
    }
    if (exports.public?.length > 0) {
      lines.push('public_exports:');
      exports.public.forEach((e: string) => lines.push(`  - ${e}`));
    }
    lines.push('');
    
    return lines;
  }
}
```

### Phase 4: Create Language Adapters ✅ COMPLETED

All adapters have been successfully implemented:
- `src/adapters/base-adapter.ts` ✅ CREATED
- `src/adapters/nodejs-adapter.ts` ✅ CREATED (with AST parser integration)
- `src/adapters/python-adapter.ts` ✅ CREATED
- `src/parsers/ast-parser.ts` ✅ CREATED (ts-morph based)

**CREATE NEW FILE**: `src/adapters/base-adapter.ts`

```typescript
import { UnifiedPackageContent } from '#types/unified-schema';

export abstract class BaseAdapter {
  abstract toUnifiedContent(
    sourceCode: string,
    metadata: any,
    packageLocation: string
  ): Promise<UnifiedPackageContent>;
  
  protected detectPackageManager(location: string): string {
    // Common detection logic
    return 'unknown';
  }
}
```

**CREATE NEW FILE**: `src/adapters/nodejs-adapter.ts`

```typescript
import { BaseAdapter } from './base-adapter';
import { UnifiedPackageContent } from '#types/unified-schema';

export class NodeJSAdapter extends BaseAdapter {
  async toUnifiedContent(
    sourceCode: string,
    packageJson: any,
    packageLocation: string
  ): Promise<UnifiedPackageContent> {
    // Implementation as previously defined
    // Parse JS/TS source, extract components, etc.
  }
}
```

### Phase 5: Update read-package.ts (30 min)

**MODIFY FILE**: `src/tools/read-package.ts`

**DELETE** lines 140-161 (current Node/Python handling)

**REPLACE** with:

```typescript
// Import new dependencies at top
import { UnifiedPackageContent } from '#types/unified-schema';
import { MarkdownGenerator } from '#utils/markdown-generator';
import { NodeJSAdapter } from '#adapters/nodejs-adapter';
import { PythonAdapter } from '#adapters/python-adapter';

// Replace lines 140-161 with:
let unifiedContent: UnifiedPackageContent;

if (isNodePackage) {
  // Read package.json
  const packageJsonContent = await readFileWithSizeCheck(packageJsonPath);
  const packageJson = JSON.parse(packageJsonContent);
  
  // Find and read main source file
  const mainEntry = this.findMainEntry(packageJson);
  const mainSource = await this.readMainSource(packageLocation, mainEntry);
  
  // Convert to unified schema
  const adapter = new NodeJSAdapter();
  unifiedContent = await adapter.toUnifiedContent(
    mainSource,
    packageJson,
    packageLocation
  );
} else {
  // Python handling
  const initContent = await readFileWithSizeCheck(
    join(packageLocation, '__init__.py')
  );
  const setupPy = await this.readSetupPy(packageLocation);
  
  const adapter = new PythonAdapter();
  unifiedContent = await adapter.toUnifiedContent(
    initContent,
    setupPy,
    packageLocation
  );
}

// Generate standardized markdown (same for all languages)
const markdown = MarkdownGenerator.generate(unifiedContent);

// Return with markdown as initContent
return {
  type: 'tree',
  success: true,
  package: packageName,
  version: unifiedContent.metadata.version,
  initContent: markdown,  // Always markdown, never raw JSON or source
  fileTree,
  fileCount,
  mainFiles
};
```

### Phase 6: Testing & Verification (1 hour)

**CREATE NEW FILE**: `tests/unified-schema.test.ts`

Test that all languages produce consistent markdown structure.

## Code Replacement Map

| Current File | Lines | Action | Replacement |
|-------------|-------|--------|-------------|
| src/types.ts | 4-18 | DELETE | Use UnifiedPackageContent |
| src/types.ts | 45-69 | DELETE | Use new result type |
| src/tools/read-package.ts | 140-161 | DELETE | New unified handling |
| src/schemas/cache-schema.sql | 38-59 | REPLACE | Enhanced packages table |
| src/types/unified-schema.ts | N/A | CREATE | New unified types |
| src/utils/markdown-generator.ts | N/A | CREATE | Markdown generator |
| src/adapters/*.ts | N/A | CREATE | Language adapters |

## Migration Notes

1. **No backwards compatibility** - Old cache will be invalidated
2. **Database will be recreated** - No migration, just DROP and CREATE
3. **All packages must conform** to UnifiedPackageContent
4. **One markdown format** for all languages

## Success Criteria

1. ✅ All languages return same markdown structure
2. ✅ Schema supports future languages (Java, Rust, Go)
3. ✅ No overlapping code
4. ✅ Clean replacement of old implementations
5. ✅ Flat, efficient database schema
6. ✅ Type-safe throughout

## Testing Commands

```bash
# Clean everything
npm run clean
rm -rf .pkg-local-cache

# Rebuild
npm run build

# Test with verbose output
VERBOSE_TEST=true npm test tests/tools/read-package-verbose.test.ts

# Verify markdown output
cat output/test-results/*.md
```

## Future Language Support

The schema is designed to support:
- **Java**: Maven/Gradle packages with strong typing
- **Rust**: Cargo crates with traits and lifetimes
- **Go**: Go modules with interfaces and structs
- **C/C++**: Conan/vcpkg packages

Each just needs a new adapter implementing BaseAdapter.