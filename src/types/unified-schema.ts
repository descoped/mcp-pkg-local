/**
 * Unified Package Schema
 *
 * Consistent structure for all languages and package managers
 * Supports: Python, JavaScript, TypeScript, Java, Rust, Go, C/C++
 */

// Unified content structure for ALL languages
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
    packageManager:
      | 'npm'
      | 'pip'
      | 'poetry'
      | 'maven'
      | 'cargo'
      | 'go'
      | 'yarn'
      | 'pnpm'
      | 'bun'
      | 'uv'
      | 'conda'
      | 'gradle'
      | 'conan'
      | 'vcpkg';
    mainEntry?: string;

    // Language-specific type information
    typeSystem?: {
      isStronglyTyped: boolean; // true for Java, Rust, Go, C++
      hasTypeAnnotations?: boolean; // true for TypeScript, Python with hints
      typeDefinitionFile?: string; // .d.ts, .pyi, etc.
    };
  };

  // Components extracted from source (flexible for all languages)
  components: {
    classes: ComponentClass[];
    functions: ComponentFunction[];
    constants: ComponentConstant[];
    types?: ComponentType[]; // For TS, Rust, etc.
    interfaces?: ComponentInterface[]; // For Java, TS, Go
    enums?: ComponentEnum[]; // For Java, Rust, TS
    traits?: ComponentTrait[]; // For Rust
    structs?: ComponentStruct[]; // For Go, Rust, C
  };

  // Export information (varies by language)
  exports: {
    default?: string; // JS/TS
    named: string[];
    namespace?: string; // Java packages, Go modules
    public?: string[]; // Java, Rust pub exports
  };

  // Dependencies (flexible structure)
  dependencies: {
    runtime: Record<string, string>;
    development?: Record<string, string>; // Not all languages separate
    build?: Record<string, string>; // Maven, Cargo build deps
    peer?: Record<string, string>; // npm specific
    optional?: Record<string, string>;
  };

  // Build/Config information
  configuration?: {
    environment?: string[];
    buildSystem?: 'npm' | 'maven' | 'gradle' | 'cargo' | 'make' | 'cmake' | 'poetry' | 'setuptools';
    commands?: Record<string, string>;
    entryPoints?: string[]; // Multiple mains for some langs
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
  extends?: string; // inheritance
  implements?: string[]; // interfaces (Java, TS)
  traits?: string[]; // Rust traits
  methods: MethodInfo[];
  properties?: PropertyInfo[];
  visibility?: 'public' | 'private' | 'protected' | 'internal';
  isAbstract?: boolean;
  isFinal?: boolean; // Java
  isStatic?: boolean;
  generics?: GenericInfo[]; // <T>, etc.
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
  throws?: string[]; // Java checked exceptions
}

export interface ComponentConstant {
  name: string;
  type?: string;
  value?: string;
  isExported: boolean;
}

export interface ComponentType {
  name: string;
  definition: string;
  isExported: boolean;
}

export interface ComponentInterface {
  name: string;
  purpose?: string;
  methods: MethodInfo[];
  properties?: PropertyInfo[];
  extends?: string[]; // Interface inheritance
  generics?: GenericInfo[];
}

export interface ComponentEnum {
  name: string;
  values: string[];
  isExported: boolean;
}

export interface ComponentTrait {
  name: string;
  methods: MethodInfo[];
  associatedTypes?: string[];
}

export interface ComponentStruct {
  name: string;
  fields: PropertyInfo[];
  methods?: MethodInfo[];
  isExported: boolean;
}

export interface MethodInfo {
  name: string;
  parameters: ParameterInfo[];
  returns?: TypeInfo;
  visibility: 'public' | 'private' | 'protected';
  isAsync?: boolean;
  isStatic?: boolean;
  isAbstract?: boolean;
  generics?: GenericInfo[];
}

export interface ParameterInfo {
  name: string;
  type?: string;
  required: boolean;
  default?: string;
  isVariadic?: boolean; // ...args
}

export interface PropertyInfo {
  name: string;
  type?: string;
  visibility?: 'public' | 'private' | 'protected';
  isStatic?: boolean;
  isReadonly?: boolean;
  default?: string;
}

export interface TypeInfo {
  name: string;
  isNullable?: boolean;
  isArray?: boolean;
  isOptional?: boolean;
  generics?: TypeInfo[];
  primitive?: boolean; // int, float, bool for strongly-typed langs
}

export interface GenericInfo {
  name: string;
  constraint?: string; // T extends Comparable
  default?: string;
}

export interface CodeExample {
  title: string;
  code: string;
  language: string;
  description?: string;
}

// Helper type guards
export function hasComponents(content: UnifiedPackageContent): boolean {
  const c = content.components;
  return (
    c.classes.length > 0 ||
    c.functions.length > 0 ||
    c.constants.length > 0 ||
    (c.types?.length ?? 0) > 0 ||
    (c.interfaces?.length ?? 0) > 0 ||
    (c.enums?.length ?? 0) > 0 ||
    (c.traits?.length ?? 0) > 0 ||
    (c.structs?.length ?? 0) > 0
  );
}
