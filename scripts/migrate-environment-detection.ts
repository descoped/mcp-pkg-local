#!/usr/bin/env node
/**
 * Migration script to update adapter instantiations with environment parameter
 * 
 * This script automatically updates test files and other code that instantiates
 * package manager adapters to include the environment parameter.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { glob } from 'glob';
import { resolve } from 'node:path';

async function migrateFile(filePath: string): Promise<boolean> {
  let content = await readFile(filePath, 'utf-8');
  let modified = false;
  
  // Pattern to match adapter instantiations - handles multi-line
  const adapterPattern = /new\s+(Pip|Uv)Adapter\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/g;
  
  // Check if file needs migration (has adapter instantiation without environment)
  if (adapterPattern.test(content)) {
    // Reset regex
    adapterPattern.lastIndex = 0;
    
    // Check if file already has environment import
    const hasEnvironmentImport = content.includes("import type { EnvironmentInfo }") || 
                                 content.includes("from '#bottles/environment-detector'");
    const hasFixturesImport = content.includes("EnvironmentFixtures");
    
    // Add imports if missing
    if (!hasEnvironmentImport && !hasFixturesImport) {
      // Find a good place to add the import (after other bottles imports)
      const bottlesImportMatch = /import[^;]+from\s+['"]#bottles[^'"]+['"];?\n/g;
      const lastBottlesImport = [...content.matchAll(bottlesImportMatch)].pop();
      
      if (lastBottlesImport) {
        const insertPos = (lastBottlesImport.index ?? 0) + lastBottlesImport[0].length;
        const importStatement = `import type { EnvironmentInfo } from '#bottles/environment-detector';\nimport { EnvironmentFixtures } from '../../fixtures/environment-fixtures.js';\n`;
        content = content.slice(0, insertPos) + importStatement + content.slice(insertPos);
        modified = true;
      }
    }
    
    // Add environment variable declaration if needed
    if (!content.includes('let environment: EnvironmentInfo')) {
      const describeMatch = /describe\([^{]+\{[^}]*let\s+[^;]+;/s;
      if (describeMatch.test(content)) {
        content = content.replace(describeMatch, (match) => {
          return match + '\n  let environment: EnvironmentInfo;';
        });
        modified = true;
      }
    }
    
    // Add environment initialization in beforeAll if needed
    if (!content.includes('EnvironmentFixtures.create')) {
      const beforeAllMatch = /beforeAll\(async[^{]*\{([^}]+)\}/;
      if (beforeAllMatch.test(content)) {
        content = content.replace(beforeAllMatch, (match, body) => {
          if (!(body as string).includes('environment =')) {
            return match.replace(body, body + '\n    environment = EnvironmentFixtures.createFullEnvironment();');
          }
          return match;
        });
        modified = true;
      }
    }
    
    // Replace adapter instantiations
    content = content.replace(adapterPattern, (match, adapterName, shellRPC, volumeController, projectDir) => {
      // Clean up the parameters
      shellRPC = (shellRPC as string).trim();
      volumeController = (volumeController as string).trim();
      projectDir = (projectDir as string).trim();
      
      // Check if this already has environment (4 params)
      if (match.split(',').length >= 4) {
        return match; // Already migrated
      }
      
      return `new ${adapterName}Adapter(${shellRPC}, ${volumeController}, environment, ${projectDir})`;
    });
    
    modified = true;
  }
  
  if (modified) {
    await writeFile(filePath, content);
    console.warn(`✅ Migrated: ${filePath}`);
    return true;
  }
  
  return false;
}

async function main(): Promise<void> {
  console.warn('🔄 Migrating environment detection pattern...\n');
  
  // Find all test files that might need migration
  const testFiles = await glob('tests/bottles/**/*.test.ts');
  
  let migrated = 0;
  let failed = 0;
  
  for (const file of testFiles) {
    try {
      const fullPath = resolve(process.cwd(), file);
      if (await migrateFile(fullPath)) {
        migrated++;
      }
    } catch (error) {
      console.error(`❌ Failed to migrate ${file}:`, error);
      failed++;
    }
  }
  
  console.warn(`\n✅ Migration complete: ${migrated} files updated`);
  if (failed > 0) {
    console.warn(`⚠️  ${failed} files failed to migrate`);
  }
  
  // Run type check to verify
  console.warn('\n🔍 Running type check...');
  const { execSync } = await import('child_process');
  try {
    execSync('npm run typecheck', { stdio: 'inherit' });
    console.warn('✅ Type check passed!');
  } catch {
    console.error('❌ Type check failed. Manual fixes may be needed.');
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { migrateFile };