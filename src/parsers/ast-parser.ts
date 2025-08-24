/**
 * AST-based parser for JavaScript and TypeScript
 * Uses ts-morph to extract complete class hierarchies, function signatures, and type information
 */

import { Project, Node, SyntaxKind } from 'ts-morph';
import type {
  ClassDeclaration,
  FunctionDeclaration,
  InterfaceDeclaration,
  EnumDeclaration,
  TypeAliasDeclaration,
  VariableStatement,
  MethodDeclaration,
  PropertyDeclaration,
  ParameterDeclaration,
} from 'ts-morph';
import type {
  UnifiedPackageContent,
  ComponentClass,
  ComponentFunction,
  ComponentInterface,
  ComponentEnum,
  ComponentType,
  ComponentConstant,
  MethodInfo,
  PropertyInfo,
  ParameterInfo,
} from '#types/unified-schema.js';
import { join } from 'node:path';
import { stat } from 'node:fs/promises';

export class ASTParser {
  private project: Project;

  constructor() {
    this.project = new Project({
      compilerOptions: {
        allowJs: true,
        checkJs: false,
        noEmit: true,
        skipLibCheck: true,
        skipDefaultLibCheck: true,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        target: 99, // ESNext
        module: 99, // ESNext
        moduleResolution: 2, // Node
      },
      skipAddingFilesFromTsConfig: true,
      skipFileDependencyResolution: true,
    });
  }

  /**
   * Parse a package and extract all components
   */
  async parsePackage(
    packagePath: string,
    packageJson: Record<string, unknown>,
  ): Promise<UnifiedPackageContent> {
    const startTime = Date.now();
    const timeout = 5000; // 5 second timeout

    // Use ts-morph's efficient file discovery and parsing in one step
    try {
      // Define patterns for source file discovery
      const patterns = [
        // Priority patterns (src, lib directories)
        join(packagePath, 'src/**/*.{ts,tsx,js,jsx,mjs,cjs}'),
        join(packagePath, 'lib/**/*.{ts,tsx,js,jsx,mjs,cjs}'),
        // Root level files
        join(packagePath, '*.{ts,tsx,js,jsx,mjs,cjs}'),
        // Other common source directories
        join(packagePath, 'source/**/*.{ts,tsx,js,jsx,mjs,cjs}'),
        join(packagePath, 'app/**/*.{ts,tsx,js,jsx,mjs,cjs}'),
      ];

      let filesAdded = 0;
      const maxFiles = 20;

      // Use ts-morph's optimized file discovery and add directly to main project
      for (const pattern of patterns) {
        if (filesAdded >= maxFiles || Date.now() - startTime > timeout) break;

        try {
          const newFiles = this.project.addSourceFilesAtPaths(pattern);

          // Filter by file size and count
          for (const sourceFile of newFiles) {
            if (filesAdded >= maxFiles || Date.now() - startTime > timeout) {
              sourceFile.delete(); // Remove from project if over limits
              break;
            }

            try {
              const filePath = sourceFile.getFilePath();
              const stats = await stat(filePath);

              if (stats.size > 100_000) {
                // 100KB limit
                sourceFile.delete(); // Remove large files
              } else {
                filesAdded++;
              }
            } catch {
              sourceFile.delete(); // Remove files we can't stat
            }
          }
        } catch {
          // Pattern might not match anything, continue
        }
      }

      if (Date.now() - startTime > timeout) {
        console.warn(`[AST] Timeout reached after ${timeout}ms, stopping parse`);
      }
    } catch (error) {
      // If pattern-based discovery fails, skip parsing
      console.warn(`[AST] File discovery failed:`, error);
    }

    // Extract components from all source files
    const components = this.extractComponents();

    // Extract exports information
    const exports = this.extractExports(packageJson);

    // Build unified content
    return {
      metadata: {
        name: String(packageJson.name ?? 'unknown'),
        version: String(packageJson.version ?? '0.0.0'),
        description: String(packageJson.description ?? ''),
        license: String(packageJson.license ?? 'UNLICENSED'),
        packageManager: 'npm',
        mainEntry: String(packageJson.main ?? packageJson.module ?? 'index.js'),
        typeSystem: {
          isStronglyTyped: false,
          hasTypeAnnotations: this.hasTypeScript(),
          typeDefinitionFile: String(packageJson.types ?? packageJson.typings ?? '') || undefined,
        },
      },
      components,
      exports,
      dependencies: {
        runtime: (packageJson.dependencies ?? {}) as Record<string, string>,
        development: (packageJson.devDependencies ?? {}) as Record<string, string>,
        peer: (packageJson.peerDependencies ?? {}) as Record<string, string> | undefined,
        optional: (packageJson.optionalDependencies ?? {}) as Record<string, string> | undefined,
      },
      configuration: {
        environment: [],
        commands: (packageJson.scripts ?? {}) as Record<string, string>,
        buildSystem: 'npm',
      },
    };
  }

  /**
   * Extract all components from parsed source files
   */
  private extractComponents(): UnifiedPackageContent['components'] {
    const classes: ComponentClass[] = [];
    const functions: ComponentFunction[] = [];
    const interfaces: ComponentInterface[] = [];
    const enums: ComponentEnum[] = [];
    const types: ComponentType[] = [];
    const constants: ComponentConstant[] = [];

    for (const sourceFile of this.project.getSourceFiles()) {
      // Extract classes
      for (const classDecl of sourceFile.getClasses()) {
        const extracted = this.extractClass(classDecl);
        if (extracted) classes.push(extracted);
      }

      // Extract functions (declarations and expressions)
      for (const funcDecl of sourceFile.getFunctions()) {
        const extracted = this.extractFunction(funcDecl);
        if (extracted) functions.push(extracted);
      }

      // Extract CommonJS exports using AST
      this.extractCommonJSExports(sourceFile, functions, classes);

      // Extract interfaces
      for (const interfaceDecl of sourceFile.getInterfaces()) {
        const extracted = this.extractInterface(interfaceDecl);
        if (extracted) interfaces.push(extracted);
      }

      // Extract enums
      for (const enumDecl of sourceFile.getEnums()) {
        const extracted = this.extractEnum(enumDecl);
        if (extracted) enums.push(extracted);
      }

      // Extract type aliases
      for (const typeAlias of sourceFile.getTypeAliases()) {
        const extracted = this.extractTypeAlias(typeAlias);
        if (extracted) types.push(extracted);
      }

      // Extract constants/variables
      for (const varStatement of sourceFile.getVariableStatements()) {
        const extracted = this.extractConstants(varStatement);
        constants.push(...extracted);
      }
    }

    return { classes, functions, interfaces, enums, types, constants };
  }

  /**
   * Extract class information with full hierarchy
   */
  private extractClass(classDecl: ClassDeclaration): ComponentClass | null {
    const name = classDecl.getName();
    if (!name) return null;

    // Get extends clause
    const extendsExpr = classDecl.getExtends();
    const extendsClass = extendsExpr?.getText();

    // Get implements clauses
    const implementsExprs = classDecl.getImplements();
    const implementsInterfaces = implementsExprs.map((i) => i.getText());

    // Extract methods
    const methods: MethodInfo[] = [];
    for (const method of classDecl.getMethods()) {
      methods.push(this.extractMethod(method));
    }

    // Extract properties
    const properties: PropertyInfo[] = [];
    for (const prop of classDecl.getProperties()) {
      properties.push(this.extractProperty(prop));
    }

    // Get visibility
    const visibility = classDecl.isDefaultExport() || classDecl.isExported() ? 'public' : 'private';

    return {
      name,
      purpose: this.extractJsDoc(classDecl),
      extends: extendsClass,
      implements: implementsInterfaces.length > 0 ? implementsInterfaces : undefined,
      methods,
      properties,
      visibility,
      isAbstract: classDecl.isAbstract(),
      generics: this.extractGenerics(classDecl),
    };
  }

  /**
   * Extract method information with full signature
   */
  private extractMethod(method: MethodDeclaration): MethodInfo {
    const name = method.getName();
    const parameters = method.getParameters().map((p) => this.extractParameter(p));

    // Get return type
    const returnTypeNode = method.getReturnTypeNode();
    const returnType = returnTypeNode ? returnTypeNode.getText() : method.getReturnType().getText();

    return {
      name,
      parameters,
      returns: { name: returnType },
      visibility: method.hasModifier(SyntaxKind.PrivateKeyword)
        ? 'private'
        : method.hasModifier(SyntaxKind.ProtectedKeyword)
          ? 'protected'
          : 'public',
      isStatic: method.isStatic(),
      isAsync: method.isAsync(),
      isAbstract: method.isAbstract(),
    };
  }

  /**
   * Extract property information
   */
  private extractProperty(prop: PropertyDeclaration): PropertyInfo {
    const name = prop.getName();
    const typeNode = prop.getTypeNode();
    const type = typeNode ? typeNode.getText() : prop.getType().getText();

    return {
      name,
      type,
      visibility: prop.hasModifier(SyntaxKind.PrivateKeyword)
        ? 'private'
        : prop.hasModifier(SyntaxKind.ProtectedKeyword)
          ? 'protected'
          : 'public',
      isStatic: prop.isStatic(),
      isReadonly: prop.isReadonly(),
      default: prop.getInitializer()?.getText(),
    };
  }

  /**
   * Extract function information
   */
  private extractFunction(funcDecl: FunctionDeclaration): ComponentFunction | null {
    const name = funcDecl.getName();
    if (!name) return null;

    const parameters = funcDecl.getParameters().map((p) => this.extractParameter(p));
    const returnTypeNode = funcDecl.getReturnTypeNode();
    const returnType = returnTypeNode
      ? returnTypeNode.getText()
      : funcDecl.getReturnType().getText();

    return {
      name,
      purpose: this.extractJsDoc(funcDecl),
      parameters,
      returns: { name: returnType },
      isAsync: funcDecl.isAsync(),
      isGenerator: funcDecl.isGenerator(),
      isExported: funcDecl.isExported() || funcDecl.isDefaultExport(),
      generics: this.extractGenerics(funcDecl),
    };
  }

  /**
   * Extract interface information
   */
  private extractInterface(interfaceDecl: InterfaceDeclaration): ComponentInterface | null {
    const name = interfaceDecl.getName();
    if (!name) return null;

    const extendsExprs = interfaceDecl.getExtends();
    const extendsInterfaces = extendsExprs.map((e) => e.getText());

    const methods: MethodInfo[] = [];
    const properties: PropertyInfo[] = [];

    for (const member of interfaceDecl.getMembers()) {
      if (Node.isMethodSignature(member)) {
        const name = member.getName();
        const parameters = member.getParameters().map((p) => this.extractParameter(p));
        const returnTypeNode = member.getReturnTypeNode();
        const returnType = returnTypeNode ? returnTypeNode.getText() : 'void';

        methods.push({
          name,
          parameters,
          returns: { name: returnType },
          visibility: 'public',
        });
      } else if (Node.isPropertySignature(member)) {
        const name = member.getName();
        const typeNode = member.getTypeNode();
        const type = typeNode ? typeNode.getText() : 'any';

        properties.push({
          name,
          type,
          visibility: 'public',
          isReadonly: member.isReadonly(),
        });
      }
    }

    return {
      name,
      extends: extendsInterfaces.length > 0 ? extendsInterfaces : undefined,
      methods,
      properties,
    };
  }

  /**
   * Extract enum information
   */
  private extractEnum(enumDecl: EnumDeclaration): ComponentEnum | null {
    const name = enumDecl.getName();
    if (!name) return null;

    const values = enumDecl.getMembers().map((m) => m.getName());

    return {
      name,
      values,
      isExported: enumDecl.isExported() || enumDecl.isDefaultExport(),
    };
  }

  /**
   * Extract type alias information
   */
  private extractTypeAlias(typeAlias: TypeAliasDeclaration): ComponentType | null {
    const name = typeAlias.getName();
    if (!name) return null;

    const typeNode = typeAlias.getTypeNode();
    const definition = typeNode ? typeNode.getText() : 'unknown';

    return {
      name,
      definition,
      isExported: typeAlias.isExported() || typeAlias.isDefaultExport(),
    };
  }

  /**
   * Extract constants/variables
   */
  private extractConstants(varStatement: VariableStatement): ComponentConstant[] {
    const constants: ComponentConstant[] = [];

    for (const decl of varStatement.getDeclarations()) {
      const name = decl.getName();
      const typeNode = decl.getTypeNode();
      const type = typeNode ? typeNode.getText() : undefined;
      const value = decl.getInitializer()?.getText();

      constants.push({
        name,
        type: type ?? undefined,
        value: value?.substring(0, 100), // Truncate long values
        isExported: varStatement.isExported(),
      });
    }

    return constants;
  }

  /**
   * Extract parameter information
   */
  private extractParameter(param: ParameterDeclaration): ParameterInfo {
    const name = param.getName();
    const typeNode = param.getTypeNode();
    const type = typeNode ? typeNode.getText() : param.getType().getText();
    const defaultValue = param.getInitializer()?.getText();

    return {
      name,
      type,
      required: !param.isOptional() && !param.hasInitializer(),
      default: defaultValue,
      isVariadic: param.isRestParameter(),
    };
  }

  /**
   * Extract generics/type parameters
   */
  private extractGenerics(
    node: ClassDeclaration | FunctionDeclaration | InterfaceDeclaration | TypeAliasDeclaration,
  ): Array<{ name: string; constraint?: string }> | undefined {
    const typeParams = node.getTypeParameters();
    if (typeParams.length === 0) return undefined;

    return typeParams.map((tp) => ({
      name: tp.getName(),
      constraint: tp.getConstraint()?.getText(),
    }));
  }

  /**
   * Extract JSDoc comments
   */
  private extractJsDoc(
    node: ClassDeclaration | FunctionDeclaration | MethodDeclaration,
  ): string | undefined {
    const jsDocs = node.getJsDocs();
    if (jsDocs.length === 0) return undefined;

    const description = jsDocs[0]?.getDescription().trim();
    return description ?? undefined;
  }

  /**
   * Extract CommonJS exports using proper AST parsing
   */
  private extractCommonJSExports(
    sourceFile: ReturnType<Project['getSourceFiles']>[0],
    functions: ComponentFunction[],
    _classes: ComponentClass[],
  ): void {
    // For now, use the working regex approach for CommonJS function detection
    // TODO: Replace with full AST parsing once ts-morph assignment expression handling is resolved
    const sourceText = sourceFile.getText();
    const moduleExportsFunctionMatch = /module\.exports\s*=\s*function\s*(\w*)\s*\(/.exec(
      sourceText,
    );
    if (moduleExportsFunctionMatch) {
      const functionName = moduleExportsFunctionMatch[1] ?? 'default';

      // Try to extract parameters from the function signature
      const paramMatch = /module\.exports\s*=\s*function\s*\w*\s*\(([^)]*)\)/.exec(sourceText);
      const paramString = paramMatch?.[1] ?? '';
      const parameters: ParameterInfo[] = paramString
        ? paramString
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean)
            .map((param) => ({
              name: param.split('=')[0]?.trim() ?? param, // Handle default params
              type: 'any',
              required: !param.includes('='),
            }))
        : [];

      functions.push({
        name: functionName,
        purpose: 'CommonJS exported function',
        parameters,
        returns: { name: 'any' },
        isExported: true,
      });
    }
  }

  /**
   * Extract exports information (ES6 and CommonJS)
   */
  private extractExports(_packageJson: Record<string, unknown>): {
    default?: string;
    named: string[];
  } {
    const named: string[] = [];
    let defaultExport: string | undefined = undefined;

    // Get named exports from all source files
    for (const sourceFile of this.project.getSourceFiles()) {
      // ES6 exports
      const exportedDecls = sourceFile.getExportedDeclarations();

      for (const [name, decls] of exportedDecls) {
        if (name === 'default') {
          // Handle default export
          if (decls.length > 0) {
            const decl = decls[0];
            if (Node.isClassDeclaration(decl)) {
              defaultExport = decl.getName() ?? 'default';
            } else if (Node.isFunctionDeclaration(decl)) {
              defaultExport = decl.getName() ?? 'default';
            } else {
              defaultExport = 'default';
            }
          }
        } else {
          named.push(name);
        }
      }

      // CommonJS exports using regex (simpler and working approach)
      const sourceText = sourceFile.getText();

      // Check for module.exports = function/class/object
      const moduleExportsMatches = sourceText.match(
        /module\.exports\s*=\s*(\w+|function|class|\{)/g,
      );
      if (moduleExportsMatches) {
        defaultExport ??= 'default'; // CommonJS main export
      }

      // Check for exports.name = ...
      const exportsMatches = sourceText.match(/exports\.(\w+)\s*=/g);
      if (exportsMatches) {
        for (const match of exportsMatches) {
          const nameMatch = /exports\.(\w+)/.exec(match);
          if (nameMatch?.[1]) {
            named.push(nameMatch[1]);
          }
        }
      }

      // Check for module.exports.name = ...
      const moduleExportsPropertyMatches = sourceText.match(/module\.exports\.(\w+)\s*=/g);
      if (moduleExportsPropertyMatches) {
        for (const match of moduleExportsPropertyMatches) {
          const nameMatch = /module\.exports\.(\w+)/.exec(match);
          if (nameMatch?.[1]) {
            named.push(nameMatch[1]);
          }
        }
      }
    }

    return {
      default: defaultExport,
      named: [...new Set(named)], // Remove duplicates
    };
  }

  /**
   * Check if the package uses TypeScript
   */
  private hasTypeScript(): boolean {
    for (const sourceFile of this.project.getSourceFiles()) {
      if (sourceFile.getFilePath().endsWith('.ts') || sourceFile.getFilePath().endsWith('.tsx')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Clear the project to free memory
   */
  clear(): void {
    for (const sourceFile of this.project.getSourceFiles()) {
      this.project.removeSourceFile(sourceFile);
    }
  }
}
