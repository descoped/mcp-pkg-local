#!/usr/bin/env node

import { scanPackagesTool } from './dist/tools/scan-packages.js';

async function runScanPackages() {
  try {
    console.log('Executing scan-packages tool with summary:true...\n');
    
    const result = await scanPackagesTool({
      summary: true
    });
    
    console.log('Raw JSON result:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error executing scan-packages:', error);
    process.exit(1);
  }
}

runScanPackages();