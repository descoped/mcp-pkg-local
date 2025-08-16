#!/usr/bin/env node

import { NodeJSScanner } from './dist/scanners/nodejs.js';
import { promises as fs } from 'fs';

async function test() {
  // Clean cache
  try {
    await fs.rm('.pkg-local-cache', { recursive: true });
  } catch {}
  
  console.log('Testing scanner directly...\n');
  
  const scanner = new NodeJSScanner(process.cwd(), { debug: true });
  
  console.log('Starting scan...');
  const startTime = Date.now();
  
  try {
    const result = await scanner.scan();
    const elapsed = Date.now() - startTime;
    
    console.log(`Scan completed in ${elapsed}ms`);
    console.log(`Packages found: ${Object.keys(result.packages).length}`);
    
    // Show first 5 packages
    const packages = Object.keys(result.packages).slice(0, 5);
    for (const pkg of packages) {
      const info = result.packages[pkg];
      console.log(`- ${pkg}: ${info.version} (${info.fileCount} files)`);
      if (info.unifiedContent) {
        const components = info.unifiedContent.components;
        console.log(`  Classes: ${components.classes?.length || 0}, Functions: ${components.functions?.length || 0}`);
      }
    }
  } catch (error) {
    console.error('Scan failed:', error);
    console.error('Stack:', error.stack);
  }
}

test().catch(console.error);