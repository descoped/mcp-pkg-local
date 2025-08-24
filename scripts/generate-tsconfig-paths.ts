#!/usr/bin/env node
/**
 * Automatically generates TypeScript path mappings based on the file structure
 * This eliminates the need to manually maintain paths in tsconfig.json
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';

interface TsConfig {
  compilerOptions: {
    paths: Record<string, string[]>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Recursively find all TypeScript files in a directory
 */
function findTypeScriptFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, dist, and test directories
        if (!['node_modules', 'dist', 'output', '.git'].includes(entry)) {
          files.push(...findTypeScriptFiles(fullPath, baseDir));
        }
      } else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
        // Get relative path from baseDir
        const relativePath = relative(baseDir, fullPath);
        files.push(relativePath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error);
  }
  
  return files;
}

/**
 * Generate path mappings for a TypeScript file
 */
function generatePathsForFile(file: string): Record<string, string[]> {
  const paths: Record<string, string[]> = {};
  
  // Remove .ts extension and src/ prefix for import path
  const withoutExt = file.replace(/\.ts$/, '');
  const importPath = '#' + withoutExt.replace(/^src\//, '');
  const srcPath = `./src/${file.replace(/^src\//, '')}`;
  
  if (basename(file) === 'index.ts') {
    // For index files, create directory imports
    const dirImportPath = importPath.replace(/\/index$/, '');
    
    // Directory import (e.g., #bottles/shell-rpc)
    paths[dirImportPath] = [srcPath];
    
    // Wildcard imports for the directory (e.g., #bottles/shell-rpc/*)
    const dirPath = dirname(srcPath);
    paths[`${dirImportPath}/*`] = [`${dirPath}/*`];
  } else {
    // Regular file imports
    paths[importPath] = [srcPath];
  }
  
  return paths;
}

/**
 * Main function to generate TSConfig paths
 */
function generateTsConfigPaths(): void {
  const configPath = './tsconfig.json';
  const srcDir = './src';
  
  // eslint-disable-next-line no-console
  console.log('🔍 Scanning TypeScript files...');
  
  // Read existing tsconfig
  let tsConfig: TsConfig;
  try {
    tsConfig = JSON.parse(readFileSync(configPath, 'utf-8')) as TsConfig;
  } catch (error) {
    console.error('❌ Failed to read tsconfig.json:', error);
    process.exit(1);
  }
  
  // Find all TypeScript files in src
  const srcFiles = findTypeScriptFiles(srcDir);
  // eslint-disable-next-line no-console
  console.log(`  Found ${srcFiles.length} files in src/`);
  
  // Generate paths for src files only
  const paths: Record<string, string[]> = {};
  
  // Process src files
  for (const file of srcFiles) {
    const filePaths = generatePathsForFile(file);
    Object.assign(paths, filePaths);
  }
  
  // Add special catch-all patterns at the end
  paths['#*'] = ['./src/*'];
  
  // Sort paths for consistency
  // Longer, more specific paths should come first
  const sortedPaths = Object.entries(paths)
    .sort(([a], [b]) => {
      // First by specificity (number of slashes)
      const aSlashes = (a.match(/\//g) ?? []).length;
      const bSlashes = (b.match(/\//g) ?? []).length;
      if (aSlashes !== bSlashes) return bSlashes - aSlashes;
      
      // Then by length
      if (a.length !== b.length) return b.length - a.length;
      
      // Finally alphabetically
      return a.localeCompare(b);
    })
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string[]>);
  
  // Update tsconfig
  tsConfig.compilerOptions.paths = sortedPaths;
  
  // Write back with nice formatting
  writeFileSync(configPath, JSON.stringify(tsConfig, null, 2) + '\n');
  
  // eslint-disable-next-line no-console
  console.log(`✅ Updated tsconfig.json with ${Object.keys(sortedPaths).length} path mappings`);
  
  // Show some examples
  const examples = Object.entries(sortedPaths).slice(0, 5);
  // eslint-disable-next-line no-console
  console.log('\n📝 Example mappings:');
  for (const [key, value] of examples) {
    // eslint-disable-next-line no-console
    console.log(`  ${key} → ${value[0]}`);
  }
  // eslint-disable-next-line no-console
  console.log('  ...');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    generateTsConfigPaths();
  } catch (error) {
    console.error('❌ Error generating paths:', error);
    process.exit(1);
  }
}

export { generateTsConfigPaths };