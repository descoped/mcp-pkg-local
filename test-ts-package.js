#!/usr/bin/env node

import { scanPackagesTool } from './dist/tools/scan-packages.js';
import { readPackageTool } from './dist/tools/read-package.js';
import { promises as fs } from 'fs';

async function test() {
  // Clean cache
  try {
    await fs.rm('.pkg-local-cache', { recursive: true });
  } catch {}
  
  console.log('Testing AST extraction on TypeScript packages...\n');
  
  // Test with TypeScript packages
  const testPackages = ['ts-morph', '@babel/types', 'zod'];
  
  for (const pkg of testPackages) {
    console.log(`\n========== Testing ${pkg} ==========`);
    
    // Scan the specific package
    console.log(`1. Scanning ${pkg}...`);
    const scanResult = await scanPackagesTool({
      forceRefresh: true,
      filter: `^${pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
      limit: 1,
    });
    
    if (!scanResult.success) {
      console.error(`Failed to scan ${pkg}`);
      continue;
    }
    
    console.log('✓ Scan complete');
    
    // Read package to get the formatted output
    console.log(`2. Reading ${pkg} content...`);
    const startTime = Date.now();
    const result = await readPackageTool({ packageName: pkg });
    const elapsed = Date.now() - startTime;
    
    if (result.type !== 'tree' || !result.initContent) {
      console.error(`Failed to read ${pkg}`);
      continue;
    }
    
    console.log(`✓ Content retrieved in ${elapsed}ms`);
    
    // Analyze the content
    const content = result.initContent;
    
    // Check for classes
    const classMatches = content.match(/### \d+\. (\w+)$/gm) || [];
    const classes = classMatches.filter(m => !m.includes('('));
    console.log(`Classes found: ${classes.length}`);
    if (classes.length > 0) {
      console.log(`  Examples: ${classes.slice(0, 3).join(', ')}`);
    }
    
    // Check for methods with signatures
    const methodMatches = content.match(/- .*?\(.*?\): .+/g) || [];
    console.log(`Methods with signatures: ${methodMatches.length}`);
    if (methodMatches.length > 0) {
      console.log(`  Examples: ${methodMatches.slice(0, 3).join(', ')}`);
    }
    
    // Check for functions
    const functionMatches = content.match(/### \d+\. (\w+)\(\)/g) || [];
    console.log(`Functions found: ${functionMatches.length}`);
    if (functionMatches.length > 0) {
      const funcNames = functionMatches.map(f => f.replace(/### \d+\. /, '').replace('()', ''));
      console.log(`  Examples: ${funcNames.slice(0, 3).join(', ')}`);
    }
    
    // Check for interfaces
    const interfaceMatches = content.match(/### \d+\. (\w+) \(interface\)/g) || [];
    console.log(`Interfaces found: ${interfaceMatches.length}`);
    if (interfaceMatches.length > 0) {
      const ifaceNames = interfaceMatches.map(i => i.replace(/### \d+\. /, '').replace(' (interface)', ''));
      console.log(`  Examples: ${ifaceNames.slice(0, 3).join(', ')}`);
    }
    
    // Check for enums
    const enumMatches = content.match(/### \d+\. (\w+) \(enum\)/g) || [];
    console.log(`Enums found: ${enumMatches.length}`);
    
    // Save output for inspection
    const filename = `${pkg.replace(/[@/]/g, '_')}-ast-output.md`;
    await fs.writeFile(filename, content);
    console.log(`✓ Full output saved to ${filename}`);
    
    // Show content size
    console.log(`Content size: ${content.length} characters`);
  }
}

test().catch(console.error);