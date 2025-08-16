#!/usr/bin/env node

import { readPackageTool } from './dist/tools/read-package.js';
import { promises as fs } from 'fs';

async function test() {
  // Clean cache
  try {
    await fs.rm('.pkg-local-cache', { recursive: true });
  } catch {}
  
  console.log('Testing CommonJS support with minimist...\n');
  
  const result = await readPackageTool({ packageName: 'minimist' });
  
  if (result.type === 'tree' && result.initContent) {
    const content = result.initContent;
    
    console.log('✓ Content retrieved');
    console.log(`Content size: ${content.length} characters\n`);
    
    // Check for exports
    const hasExports = content.includes('main_export:') || content.includes('named_exports:');
    const hasFunctions = content.includes('### ') && content.includes('()');
    
    console.log(`Has exports: ${hasExports}`);
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
    
    // Check functions section
    const functionsIndex = content.indexOf('### ');
    if (functionsIndex > -1) {
      console.log('\nFunctions found:');
      const functionMatches = content.match(/### \d+\. (\w+)\(\)/g) || [];
      functionMatches.forEach(match => console.log(`- ${match}`));
    } else {
      console.log('\nNo functions found');
    }
    
  } else {
    console.error('Failed to read minimist package');
  }
}

test().catch(console.error);