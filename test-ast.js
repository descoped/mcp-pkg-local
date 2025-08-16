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
  
  console.log('Testing AST-based extraction on TypeScript package...\n');
  
  // Scan TypeScript package with AST parsing
  console.log('1. Scanning packages...');
  const scanResult = await scanPackagesTool({
    forceRefresh: true,
    filter: '^typescript$',
    limit: 1,
  });
  
  if (!scanResult.success) {
    console.error('Scan failed');
    return;
  }
  
  console.log('✓ Scan complete\n');
  
  // Read package to get the formatted output
  console.log('2. Reading package content...');
  const result = await readPackageTool({ packageName: 'typescript' });
  
  if (result.type !== 'tree' || !result.initContent) {
    console.error('Failed to read package');
    return;
  }
  
  console.log('✓ Content retrieved\n');
  
  // Analyze the content
  const content = result.initContent;
  
  // Check for classes with methods
  const classMatches = content.match(/### \d+\. (\w+) \(class\)/g) || [];
  console.log(`Classes found: ${classMatches.length}`);
  if (classMatches.length > 0) {
    console.log('Sample classes:', classMatches.slice(0, 5).map(m => m.replace(/### \d+\. /, '').replace(' (class)', '')));
  }
  
  // Check for methods with signatures
  const methodMatches = content.match(/- (\w+)\(.*?\): \w+/g) || [];
  console.log(`\nMethods with signatures found: ${methodMatches.length}`);
  if (methodMatches.length > 0) {
    console.log('Sample methods:', methodMatches.slice(0, 5));
  }
  
  // Check for functions
  const functionMatches = content.match(/### \d+\. (\w+)\(\)/g) || [];
  console.log(`\nFunctions found: ${functionMatches.length}`);
  if (functionMatches.length > 0) {
    console.log('Sample functions:', functionMatches.slice(0, 5).map(f => f.replace(/### \d+\. /, '').replace('()', '')));
  }
  
  // Check for interfaces
  const interfaceMatches = content.match(/### \d+\. (\w+) \(interface\)/g) || [];
  console.log(`\nInterfaces found: ${interfaceMatches.length}`);
  if (interfaceMatches.length > 0) {
    console.log('Sample interfaces:', interfaceMatches.slice(0, 5).map(i => i.replace(/### \d+\. /, '').replace(' (interface)', '')));
  }
  
  // Save output to file for inspection
  await fs.writeFile('typescript-ast-output.md', content);
  console.log('\n✓ Full output saved to typescript-ast-output.md');
  
  // Show a sample of the content
  console.log('\n--- Sample of extracted content (first 2000 chars) ---\n');
  console.log(content.substring(0, 2000));
}

test().catch(console.error);