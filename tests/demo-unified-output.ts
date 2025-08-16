#!/usr/bin/env tsx
/**
 * Demo of unified output for evaluation
 * Shows the consistent markdown structure for different package types
 */

import { readPackageTool } from '../src/tools/read-package.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = './output';
mkdirSync(OUTPUT_DIR, { recursive: true });

async function testPackageOutput(packageName: string, outputFile: string) {
  console.log(`\n📦 Testing package: ${packageName}`);
  console.log('=' . repeat(50));
  
  const result = await readPackageTool({ packageName });
  
  if (result.type === 'tree' && result.initContent) {
    const outputPath = join(OUTPUT_DIR, outputFile);
    writeFileSync(outputPath, result.initContent);
    
    // Analyze content
    const lines = result.initContent.split('\n');
    const hasPackageInfo = result.initContent.includes('## 📦 Package Information');
    const hasComponents = result.initContent.includes('## 🏗️ Core Components');
    const hasExports = result.initContent.includes('## 🔌 Exports');
    const hasDependencies = result.initContent.includes('## 🔗 Dependencies');
    const hasConfiguration = result.initContent.includes('## 🔧 Configuration');
    const hasPatterns = result.initContent.includes('## 🎯 Usage Patterns');
    
    // Count sections
    const classCount = (result.initContent.match(/^### \d+\. .* \(class\)/gm) || []).length;
    const functionCount = (result.initContent.match(/^### \d+\. .*\(\)/gm) || []).length;
    const exportCount = (result.initContent.match(/^ {2}- /gm) || []).length;
    
    console.log(`✅ Output written to: ${outputPath}`);
    console.log(`📊 Content Analysis:`);
    console.log(`   Total lines: ${lines.length}`);
    console.log(`   Total size: ${result.initContent.length} chars`);
    console.log(`\n📋 Sections Present:`);
    console.log(`   ✓ Package Information: ${hasPackageInfo}`);
    console.log(`   ✓ Configuration: ${hasConfiguration}`);
    console.log(`   ✓ Core Components: ${hasComponents}`);
    console.log(`   ✓ Usage Patterns: ${hasPatterns}`);
    console.log(`   ✓ Exports: ${hasExports}`);
    console.log(`   ✓ Dependencies: ${hasDependencies}`);
    
    if (hasComponents || classCount > 0 || functionCount > 0) {
      console.log(`\n🏗️ Components Found:`);
      console.log(`   Classes: ${classCount}`);
      console.log(`   Functions: ${functionCount}`);
    }
    
    if (hasExports) {
      console.log(`\n🔌 Export Information:`);
      console.log(`   Exported items: ${exportCount}`);
    }
    
    // Show first few lines of Components section if present
    if (hasComponents) {
      const componentStart = result.initContent.indexOf('## 🏗️ Core Components');
      const componentEnd = result.initContent.indexOf('\n## ', componentStart + 1);
      const componentSection = result.initContent.substring(
        componentStart, 
        componentEnd > 0 ? componentEnd : componentStart + 500
      );
      console.log(`\n📝 Components Section Preview:`);
      console.log(componentSection.substring(0, 400) + '...');
    }
    
    return true;
  } else {
    console.error(`❌ Failed to get content for ${packageName}`);
    if (result.type === 'error') {
      console.error(`   Error: ${result.error}`);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 Unified Schema Output Demonstration');
  console.log('=' . repeat(50));
  console.log('This demo shows the consistent markdown output structure');
  console.log('for different types of packages.\n');
  
  // Test a variety of packages
  const tests = [
    { name: 'typescript', file: 'typescript-output.md' },
    { name: 'eslint', file: 'eslint-output.md' },
    { name: '@modelcontextprotocol/sdk', file: 'mcp-sdk-output.md' },
    { name: 'vitest', file: 'vitest-output.md' }
  ];
  
  let successCount = 0;
  for (const test of tests) {
    const success = await testPackageOutput(test.name, test.file);
    if (success) successCount++;
  }
  
  console.log('\n' + '=' . repeat(50));
  console.log(`📊 Summary: ${successCount}/${tests.length} packages processed successfully`);
  console.log(`📁 All outputs saved to: ${OUTPUT_DIR}/`);
  console.log('\nThe unified schema ensures consistent structure across all packages:');
  console.log('1. Package Information - metadata about the package');
  console.log('2. Configuration - build system and environment variables');
  console.log('3. Core Components - classes, functions, interfaces extracted from source');
  console.log('4. Usage Patterns - detected patterns and examples');
  console.log('5. Exports - what the package exports');
  console.log('6. Dependencies - runtime and development dependencies');
}

main().catch(console.error);