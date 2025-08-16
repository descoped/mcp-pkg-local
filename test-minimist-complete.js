#!/usr/bin/env node

import { scanPackagesTool } from './dist/tools/scan-packages.js';
import { readPackageTool } from './dist/tools/read-package.js';
import { promises as fs } from 'fs';

async function test() {
  // Clean cache
  try {
    await fs.rm('.pkg-local-cache', { recursive: true });
  } catch {}
  
  console.log('Testing CommonJS support with minimist...\n');
  
  // First scan to ensure minimist is indexed
  console.log('1. Scanning for minimist...');
  const scanResult = await scanPackagesTool({
    forceRefresh: true,
    filter: '^minimist$',
    limit: 1
  });
  
  if (!scanResult.success) {
    console.error('Scan failed');
    return;
  }
  
  console.log('✓ Scan complete, found minimist');
  
  // Now read the package
  console.log('2. Reading minimist package...');
  const result = await readPackageTool({ packageName: 'minimist' });
  
  if (result.type === 'tree' && result.initContent) {
    const content = result.initContent;
    
    console.log('✓ Content retrieved');
    console.log(`Content size: ${content.length} characters\n`);
    
    // Check for exports
    const hasMainExport = content.includes('main_export:');
    const hasNamedExports = content.includes('named_exports:');
    const hasFunctions = content.includes('### ') && content.includes('()');
    
    console.log(`Has main export: ${hasMainExport}`);
    console.log(`Has named exports: ${hasNamedExports}`);
    console.log(`Has functions: ${hasFunctions}\n`);
    
    // Show exports section
    const exportsIndex = content.indexOf('## 🔌 Exports');
    if (exportsIndex > -1) {
      const nextSectionIndex = content.indexOf('##', exportsIndex + 1);
      const exportsSection = nextSectionIndex > -1 
        ? content.substring(exportsIndex, nextSectionIndex)
        : content.substring(exportsIndex);
      
      console.log('Exports section:');
      console.log(exportsSection);
    } else {
      console.log('No exports section found');
    }
    
    // Save the updated output
    await fs.writeFile('output/minimist-fixed-output.md', content);
    console.log('\n✅ Updated output saved to output/minimist-fixed-output.md');
    
  } else {
    console.error('Failed to read minimist package:', result);
  }
}

test().catch(console.error);