#!/usr/bin/env node

import { scanPackagesTool } from './dist/tools/scan-packages.js';
import { readPackageTool } from './dist/tools/read-package.js';
import { promises as fs } from 'fs';

async function test() {
  // Clean cache
  try {
    await fs.rm('.pkg-local-cache', { recursive: true });
    await fs.rm('.pkg-local-cache.db', { recursive: true });
  } catch {}
  
  console.log('Testing AST-based extraction on smaller packages...\n');
  
  // Test with a smaller, simpler package first
  const testPackages = ['minimist', 'chalk', 'commander'];
  
  for (const pkg of testPackages) {
    console.log(`\n========== Testing ${pkg} ==========`);
    
    // Scan the specific package
    console.log(`1. Scanning ${pkg}...`);
    const scanResult = await scanPackagesTool({
      forceRefresh: true,
      filter: `^${pkg}$`,
      limit: 1,
    });
    
    if (!scanResult.success) {
      console.error(`Failed to scan ${pkg}`);
      continue;
    }
    
    console.log('✓ Scan complete');
    
    // Read package to get the formatted output
    console.log(`2. Reading ${pkg} content...`);
    const result = await readPackageTool({ packageName: pkg });
    
    if (result.type !== 'tree' || !result.initContent) {
      console.error(`Failed to read ${pkg}`);
      continue;
    }
    
    console.log('✓ Content retrieved');
    
    // Analyze the content
    const content = result.initContent;
    
    // Check for classes
    const classMatches = content.match(/### \d+\. (\w+)$/gm) || [];
    const classes = classMatches.filter(m => !m.includes('('));
    console.log(`Classes found: ${classes.length}`);
    
    // Check for methods with signatures
    const methodMatches = content.match(/- (\w+)\(.*?\): \w+/g) || [];
    console.log(`Methods with signatures: ${methodMatches.length}`);
    
    // Check for functions
    const functionMatches = content.match(/### \d+\. (\w+)\(\)/g) || [];
    console.log(`Functions found: ${functionMatches.length}`);
    
    // Check for interfaces
    const interfaceMatches = content.match(/### \d+\. (\w+) \(interface\)/g) || [];
    console.log(`Interfaces found: ${interfaceMatches.length}`);
    
    // Check for enums
    const enumMatches = content.match(/### \d+\. (\w+) \(enum\)/g) || [];
    console.log(`Enums found: ${enumMatches.length}`);
    
    // Save output for inspection
    await fs.writeFile(`${pkg}-ast-output.md`, content);
    console.log(`✓ Full output saved to ${pkg}-ast-output.md`);
    
    // Show a sample of the Core Components section if it exists
    const coreComponentsIndex = content.indexOf('## 🏗️ Core Components');
    if (coreComponentsIndex > -1) {
      const sample = content.substring(coreComponentsIndex, Math.min(coreComponentsIndex + 1000, content.length));
      console.log('\n--- Sample of Core Components ---');
      console.log(sample);
    } else {
      console.log('\nNo Core Components section found');
    }
  }
}

test().catch(console.error);