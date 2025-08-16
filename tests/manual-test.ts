#!/usr/bin/env tsx
/**
 * Manual test to generate output for both Node.js and Python packages
 * Run with: npx tsx tests/manual-test.ts
 */

import { readPackageTool } from '../src/tools/read-package.js';
import { scanPackagesTool } from '../src/tools/scan-packages.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = './output/test-results';
mkdirSync(OUTPUT_DIR, { recursive: true });

async function testNodePackage() {
  console.log('Testing Node.js package: @modelcontextprotocol/sdk');
  const result = await readPackageTool({
    packageName: '@modelcontextprotocol/sdk'
  });
  
  if (result.type === 'tree' && result.initContent) {
    const outputPath = join(OUTPUT_DIR, 'nodejs-mcp-sdk.md');
    writeFileSync(outputPath, result.initContent);
    console.log(`✅ Node.js output written to: ${outputPath}`);
    console.log(`   Content length: ${result.initContent.length} chars`);
    console.log(`   Has Components: ${result.initContent.includes('## 🏗️ Core Components')}`);
    console.log(`   Has Exports: ${result.initContent.includes('## 🔌 Exports')}`);
  } else {
    console.error('❌ Failed to get Node.js package content');
  }
}

async function testPythonPackage() {
  // First scan for Python packages
  console.log('\nScanning for Python packages...');
  const scanResult = await scanPackagesTool({
    forceRefresh: false,
    limit: 10
  });
  
  if (scanResult.success && scanResult.packages.length > 0) {
    // Find a Python package
    const pythonPackage = scanResult.packages.find(p => 
      p.language === 'python' || p.location.includes('.venv') || p.location.includes('venv')
    );
    
    if (pythonPackage) {
      console.log(`Testing Python package: ${pythonPackage.name}`);
      const result = await readPackageTool({
        packageName: pythonPackage.name
      });
      
      if (result.type === 'tree' && result.initContent) {
        const outputPath = join(OUTPUT_DIR, `python-${pythonPackage.name}.md`);
        writeFileSync(outputPath, result.initContent);
        console.log(`✅ Python output written to: ${outputPath}`);
        console.log(`   Content length: ${result.initContent.length} chars`);
        console.log(`   Has Components: ${result.initContent.includes('## 🏗️ Core Components')}`);
        console.log(`   Has Exports: ${result.initContent.includes('## 🔌 Exports')}`);
      } else {
        console.error('❌ Failed to get Python package content');
      }
    } else {
      console.log('No Python packages found in current environment');
    }
  }
}

async function testLocalPackage() {
  console.log('\nTesting local package: vitest');
  const result = await readPackageTool({
    packageName: 'vitest'
  });
  
  if (result.type === 'tree' && result.initContent) {
    const outputPath = join(OUTPUT_DIR, 'nodejs-vitest.md');
    writeFileSync(outputPath, result.initContent);
    console.log(`✅ Vitest output written to: ${outputPath}`);
    
    // Log first 500 chars to see actual structure
    console.log('\nFirst 500 chars of output:');
    console.log(result.initContent.substring(0, 500));
  }
}

async function main() {
  try {
    await testNodePackage();
    await testPythonPackage();
    await testLocalPackage();
    
    console.log('\n✅ All tests completed. Check output/test-results/ for generated files.');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

main();