import { UnifiedCache } from '#utils/cache.js';
import { detectAndCreateScanner } from '#utils/scanner-factory.js';
import { generateFileTree } from '#utils/fs.js';
import type { ReadPackageParams, LegacyReadPackageParams, ReadPackageResult } from '#types.js';
import type { ParameterInfo } from '#types/unified-schema.js';
import { ReadPackageParamsSchema, PackageNotFoundError, FileNotFoundError } from '#types.js';
import { join, basename, extname, dirname } from 'node:path';
import { promises as fs } from 'node:fs';
import { MarkdownGenerator } from '#utils/markdown-generator.js';
import { NodeJSAdapter } from '#adapters/nodejs-adapter.js';
import { PythonAdapter } from '#adapters/python-adapter.js';

// Type for legacy parameters that might be passed by old clients
interface LegacyReadParams {
  packageName: string;
  filePath?: string;
  includeTree?: boolean;
  maxDepth?: number;
  pattern?: string;
}

/**
 * Convert legacy parameters to new simplified format
 */
function migrateLegacyReadParams(
  params: LegacyReadParams | ReadPackageParams,
): ReadPackageParams & { legacyFilePath?: string } {
  const warnings: string[] = [];
  const legacyParams = params as LegacyReadParams;

  // Store legacy filePath for backward compatibility
  let legacyFilePath: string | undefined;

  // Check for legacy parameters
  if ('filePath' in legacyParams && legacyParams.filePath !== undefined) {
    warnings.push(
      '[DEPRECATED] "filePath" parameter is no longer supported. read-package now returns comprehensive package information.',
    );
    legacyFilePath = legacyParams.filePath;
  }

  if ('includeTree' in legacyParams && legacyParams.includeTree !== undefined) {
    warnings.push('[DEPRECATED] "includeTree" parameter is no longer supported.');
  }

  if ('maxDepth' in legacyParams && legacyParams.maxDepth !== undefined) {
    warnings.push('[DEPRECATED] "maxDepth" parameter is no longer supported.');
  }

  if ('pattern' in legacyParams && legacyParams.pattern !== undefined) {
    warnings.push('[DEPRECATED] "pattern" parameter is no longer supported.');
  }

  // Print deprecation warnings
  warnings.forEach((warning) => console.error(warning));

  return {
    packageName: legacyParams.packageName,
    ...(legacyFilePath && { legacyFilePath }),
  };
}

export async function readPackageTool(
  params: ReadPackageParams | LegacyReadPackageParams,
): Promise<ReadPackageResult> {
  // Migrate legacy parameters
  const migrated = migrateLegacyReadParams(params as LegacyReadParams | ReadPackageParams);

  // Extract legacy filePath if present
  const { legacyFilePath, ...cleanParams } = migrated;

  // Validate parameters
  const validated = ReadPackageParamsSchema.parse(cleanParams);
  const { packageName } = validated;

  try {
    // Get package location from cache or scan
    const cache = new UnifiedCache();
    let packageLocation: string | null = null;
    let packageVersion: string | null = null;

    // Try cache first - get environment info from scanner
    const scanner = await detectAndCreateScanner();
    const environment = await scanner.getEnvironmentInfo();
    const cached = cache.load(environment);

    if (cached?.packages?.[packageName]) {
      packageLocation = cached.packages[packageName].location;
      packageVersion = cached.packages[packageName].version;
    }

    // If not in cache, scan for it
    if (!packageLocation) {
      // First ensure scanner has scanned packages
      await scanner.scan();

      packageLocation = await scanner.getPackageLocation(packageName);
      packageVersion = await scanner.getPackageVersion(packageName);

      if (!packageLocation) {
        const error = new PackageNotFoundError(packageName);
        return {
          type: 'error',
          success: false,
          error: error.message,
          ...(error.suggestion !== undefined && { suggestion: error.suggestion }),
        };
      }
    }

    // Handle legacy filePath parameter - apply smart content processing for large files
    if (legacyFilePath) {
      const filePath = join(packageLocation, legacyFilePath);

      try {
        const stats = await fs.stat(filePath);

        // Check file size (10MB limit)
        if (stats.size > 10 * 1024 * 1024) {
          return {
            type: 'error',
            success: false,
            error: `File too large: ${legacyFilePath} exceeds maximum size of 10485760 bytes`,
          };
        }

        // Check if it's a binary file
        const binaryExtensions = [
          '.pyc',
          '.woff',
          '.woff2',
          '.ttf',
          '.eot',
          '.png',
          '.jpg',
          '.jpeg',
          '.gif',
          '.ico',
          '.pdf',
          '.zip',
          '.tar',
          '.gz',
          '.exe',
          '.dll',
          '.so',
          '.dylib',
        ];
        if (binaryExtensions.some((ext) => filePath.endsWith(ext))) {
          return {
            type: 'error',
            success: false,
            error: `Cannot read binary file: ${legacyFilePath}`,
          };
        }

        // Detect large code files that need AST extraction (50KB threshold)
        const isLargeCodeFile = stats.size > 50 * 1024;
        const isCodeFile = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.d.ts'].some((ext) =>
          filePath.toLowerCase().endsWith(ext),
        );

        // Check if this is a Node.js package first
        const packageJsonPath = join(packageLocation, 'package.json');
        let isNodePackage = false;
        try {
          await fs.access(packageJsonPath);
          isNodePackage = true;
        } catch {
          // Not a Node.js package
        }

        if (isLargeCodeFile && isCodeFile && isNodePackage) {
          console.error(
            `[READ] Large code file detected (${Math.round(stats.size / 1024)}KB), applying AST extraction: ${legacyFilePath}`,
          );

          try {
            // Use AST parser to extract API surface instead of raw content
            const adapter = new NodeJSAdapter();

            // No temp package info needed for single file parsing

            // Initialize AST parser with the specific file
            const { ASTParser } = await import('#parsers/ast-parser.js');
            const astParser = new ASTParser();

            // Parse the package (which will parse the single file)
            const parsed = await astParser.parsePackage(dirname(filePath), {
              name: basename(legacyFilePath, extname(legacyFilePath)),
            });

            if (parsed?.components) {
              const components = parsed.components;
              // Generate structured content
              const structuredContent = [
                `# ${legacyFilePath} - API Surface`,
                '',
                `**File Size**: ${Math.round(stats.size / 1024)}KB (AST extracted to reduce tokens)`,
                '',
              ];

              // Add classes
              if (components.classes?.length > 0) {
                structuredContent.push('## 🏗️ Classes');
                for (const cls of components.classes) {
                  structuredContent.push(`### ${cls.name}`);
                  if (cls.purpose) structuredContent.push(`*${cls.purpose}*`);
                  if (cls.extends) structuredContent.push(`- **Extends**: ${cls.extends}`);
                  if (cls.implements?.length)
                    structuredContent.push(`- **Implements**: ${cls.implements.join(', ')}`);

                  if (cls.methods?.length > 0) {
                    structuredContent.push('**Methods:**');
                    for (const method of cls.methods) {
                      const params =
                        method.parameters
                          ?.map(
                            (p: ParameterInfo) =>
                              `${p.name}${p.required ? '' : '?'}: ${p.type ?? 'unknown'}`,
                          )
                          .join(', ') ?? '';
                      structuredContent.push(
                        `- \`${method.name}(${params}): ${method.returns?.name ?? 'void'}\``,
                      );
                    }
                  }

                  if (cls.properties && cls.properties.length > 0) {
                    structuredContent.push('**Properties:**');
                    for (const prop of cls.properties) {
                      structuredContent.push(`- \`${prop.name}: ${prop.type}\``);
                    }
                  }
                  structuredContent.push('');
                }
              }

              // Add functions
              if (components.functions?.length > 0) {
                structuredContent.push('## 🔧 Functions');
                for (const func of components.functions) {
                  const params =
                    func.parameters
                      ?.map(
                        (p: ParameterInfo) =>
                          `${p.name}${p.required ? '' : '?'}: ${p.type ?? 'unknown'}`,
                      )
                      .join(', ') ?? '';
                  structuredContent.push(
                    `### ${func.name}(${params}): ${func.returns?.name ?? 'void'}`,
                  );
                  if (func.purpose) structuredContent.push(`*${func.purpose}*`);
                  structuredContent.push('');
                }
              }

              // Add interfaces
              if (components.interfaces && components.interfaces.length > 0) {
                structuredContent.push('## 📋 Interfaces');
                for (const iface of components.interfaces) {
                  structuredContent.push(`### ${iface.name}`);
                  if (iface.extends?.length)
                    structuredContent.push(`- **Extends**: ${iface.extends.join(', ')}`);

                  if (iface.properties && iface.properties.length > 0) {
                    for (const prop of iface.properties) {
                      structuredContent.push(`- \`${prop.name}: ${prop.type}\``);
                    }
                  }
                  structuredContent.push('');
                }
              }

              // Add types and constants
              if (components.types && components.types.length > 0) {
                structuredContent.push('## 📝 Types');
                for (const type of components.types) {
                  structuredContent.push(`- \`${type.name} = ${type.definition}\``);
                }
                structuredContent.push('');
              }

              if (components.constants?.length > 0) {
                structuredContent.push('## 🔒 Constants');
                for (const constant of components.constants) {
                  structuredContent.push(
                    `- \`${constant.name}${constant.type ? `: ${constant.type}` : ''}\``,
                  );
                }
                structuredContent.push('');
              }

              // Clean up
              astParser.clear();
              adapter.cleanup();

              return {
                type: 'file',
                success: true,
                package: packageName,
                content: structuredContent.join('\n'),
                filePath: legacyFilePath,
                extractedSummary: true, // Flag to indicate this is an extracted summary
              };
            }

            // Fallback: clean up and read raw content
            astParser.clear();
            adapter.cleanup();
          } catch (astError) {
            console.error(`[READ] AST extraction failed for ${legacyFilePath}:`, astError);
            // Continue to read raw content as fallback
          }
        }

        console.error(`[READ] Reading file ${legacyFilePath}`);
        const content = await fs.readFile(filePath, 'utf-8');

        // For backward compatibility with unit tests, return file type
        return {
          type: 'file',
          success: true,
          package: packageName,
          content,
          filePath: legacyFilePath,
        };
      } catch {
        const error = new FileNotFoundError(legacyFilePath);
        return {
          type: 'error',
          success: false,
          error: error.message,
        };
      }
    }

    // Always return comprehensive package information
    console.error(`[READ] Analyzing package ${packageName}`);

    // Check if this is a Node.js package
    const packageJsonPath = join(packageLocation, 'package.json');
    let isNodePackage = false;

    try {
      await fs.access(packageJsonPath);
      isNodePackage = true;
    } catch {
      // Not a Node.js package
    }

    // Get important/main files for the package
    let mainFiles: string[];
    if (isNodePackage) {
      mainFiles = [
        'package.json',
        'index.js',
        'index.ts',
        'index.mjs',
        'lib/index.js',
        'dist/index.js',
        'src/index.ts',
      ];
    } else {
      mainFiles = ['__init__.py', 'setup.py', 'pyproject.toml', '__main__.py'];
    }

    // Filter main files to only include those that exist
    const existingMainFiles: string[] = [];
    for (const file of mainFiles) {
      try {
        const fullPath = join(packageLocation, file);
        await fs.access(fullPath);
        existingMainFiles.push(file);
      } catch {
        // File doesn't exist
      }
    }
    mainFiles = existingMainFiles;

    // Get a smart file tree - main files + key directories
    const fileTree = await generateFileTree(packageLocation, {
      maxDepth: 2,
      maxFiles: 50,
    });

    // Get unified content from cache or parse on-demand
    let initContent: string | undefined;

    // Check if we have unified content in the cache
    if (cached?.packages?.[packageName]?.unifiedContent) {
      // Use cached unified content
      const unifiedContent = cached.packages[packageName].unifiedContent;
      initContent = MarkdownGenerator.generate(unifiedContent);
      console.error(`[READ] Using cached unified content for ${packageName}`);
    } else {
      // Parse the package on-demand
      console.error(`[READ] Parsing ${packageName} on-demand...`);

      // Parse the package using appropriate adapter
      try {
        // Get package info from scanner
        const packageInfo = await scanner.getPackageInfo(packageName);

        if (packageInfo) {
          // Create appropriate adapter based on language
          const adapter =
            scanner.language === 'javascript' ? new NodeJSAdapter() : new PythonAdapter();

          if (adapter.canProcess(packageInfo)) {
            const unifiedContent = await adapter.extractContent(packageInfo.location, packageInfo);
            // Generate markdown from unified content
            initContent = MarkdownGenerator.generate(unifiedContent);

            // Update cache with the parsed content
            if (cached?.packages?.[packageName]) {
              cached.packages[packageName].unifiedContent = unifiedContent;
              cache.save(cached);
            }

            // Clean up adapter
            adapter.cleanup();
          } else {
            // No adapter can process this package, fall through to basic info creation
            console.error(`[READ] No adapter available for ${packageName}, creating basic info`);
          }
        }

        if (!initContent) {
          // No unified content available or processing failed, create basic package info
          // Use the same format as MarkdownGenerator to ensure consistency
          console.error(`[READ] Creating basic info for ${packageName}`);

          // Check if this is a TypeScript package or has type definitions
          let hasTypeAnnotations = false;
          if (isNodePackage) {
            try {
              const packageJsonPath = join(packageLocation, 'package.json');
              const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
              const packageJson = JSON.parse(packageJsonContent) as Record<string, unknown>;

              // Check for TypeScript indicators
              hasTypeAnnotations = !!(
                packageJson.types ??
                packageJson.typings ??
                (packageName === 'typescript' || packageName.startsWith('@types/'))
              );
            } catch {
              // Ignore errors reading package.json
            }
          }

          const basicLines = [
            `# ${packageName} Overview`,
            '',
            '## 📦 Package Information',
            `name: ${packageName}`,
            `version: ${packageVersion ?? 'unknown'}`,
            `type: Package`,
            `license: Not specified`,
            `package_manager: npm`,
          ];

          // Add type annotations info if available
          if (hasTypeAnnotations) {
            basicLines.push(`type_annotations: available`);
          }

          basicLines.push(
            '',
            '## 🏗️ Core Components',
            'Package components available but not extracted.',
            '',
            '## 🔌 Exports',
            'Package information available.',
            '',
          );

          initContent = basicLines.join('\n');
        }
      } catch (error) {
        console.error(`[READ] Failed to parse ${packageName}:`, error);

        // Check for TypeScript even on error
        let hasTypeAnnotations = false;
        if (isNodePackage) {
          try {
            const packageJsonPath = join(packageLocation, 'package.json');
            const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(packageJsonContent) as Record<string, unknown>;
            hasTypeAnnotations = !!(
              packageJson.types ??
              packageJson.typings ??
              (packageName === 'typescript' || packageName.startsWith('@types/'))
            );
          } catch {
            // Ignore errors
          }
        }

        // Use consistent format even on error
        const basicLines = [
          `# ${packageName} Overview`,
          '',
          '## 📦 Package Information',
          `name: ${packageName}`,
          `version: ${packageVersion ?? 'unknown'}`,
          `type: Package (extraction failed)`,
          `license: Not specified`,
          `package_manager: npm`,
        ];

        if (hasTypeAnnotations) {
          basicLines.push(`type_annotations: available`);
        }

        basicLines.push(
          '',
          '## 🏗️ Core Components',
          'Package components available but extraction failed.',
          '',
          '## 🔌 Exports',
          'Package information available but detailed content extraction failed.',
          '',
        );

        initContent = basicLines.join('\n');
      }
    }

    return {
      type: 'tree',
      success: true,
      package: packageName,
      version: packageVersion ?? 'unknown',
      initContent,
      // content: initContent,  // Alias for backward compatibility - removed to fix type error
      fileTree,
      fileCount: fileTree.length,
      mainFiles,
    };
  } catch (error) {
    console.error('[READ] Error:', error);

    if (error instanceof PackageNotFoundError || error instanceof FileNotFoundError) {
      return {
        type: 'error',
        success: false,
        error: error.message,
        ...(error.suggestion !== undefined && { suggestion: error.suggestion }),
      };
    }

    return {
      type: 'error',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
