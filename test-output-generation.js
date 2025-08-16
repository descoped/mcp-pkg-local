#!/usr/bin/env node

import { scanPackagesTool } from './dist/tools/scan-packages.js';
import { readPackageTool } from './dist/tools/read-package.js';
import { promises as fs } from 'fs';
import { join } from 'path';

async function generateTestOutputs() {
  // Clean cache
  try {
    await fs.rm('.pkg-local-cache', { recursive: true });
  } catch {}
  
  console.log('Generating test outputs for evaluation...\n');
  
  // Test packages covering different scenarios
  const testPackages = [
    { name: 'vitest', description: 'Testing framework (should have classes/functions)' },
    { name: 'typescript', description: 'TypeScript compiler (large complex package)' },
    { name: 'zod', description: 'Schema validation (TypeScript classes/interfaces)' },
    { name: '@babel/types', description: 'AST types (functional package)' },
    { name: 'chalk', description: 'Terminal colors (simple package)' },
    { name: 'minimist', description: 'Argument parser (minimal package)' }
  ];
  
  for (const pkg of testPackages) {
    console.log(`========== Processing ${pkg.name} ==========`);
    console.log(`Description: ${pkg.description}`);
    
    try {
      // Scan the specific package
      console.log(`1. Scanning ${pkg.name}...`);
      const scanResult = await scanPackagesTool({
        forceRefresh: true,
        filter: `^${pkg.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        limit: 1,
      });
      
      if (!scanResult.success) {
        console.error(`❌ Failed to scan ${pkg.name}`);
        continue;
      }
      
      console.log('✓ Scan complete');
      
      // Read package to get the formatted output
      console.log(`2. Reading ${pkg.name} content...`);
      const startTime = Date.now();
      const result = await readPackageTool({ packageName: pkg.name });
      const elapsed = Date.now() - startTime;
      
      if (result.type !== 'tree' || !result.initContent) {
        console.error(`❌ Failed to read ${pkg.name}`);
        continue;
      }
      
      console.log(`✓ Content retrieved in ${elapsed}ms`);
      
      // Analyze the content
      const content = result.initContent;
      
      // Extract stats
      const stats = {
        totalSize: content.length,
        classes: (content.match(/### \d+\. (\w+)$/gm) || []).filter(m => !m.includes('(')).length,
        functions: (content.match(/### \d+\. (\w+)\(\)/g) || []).length,
        interfaces: (content.match(/### \d+\. (\w+) \(interface\)/g) || []).length,
        enums: (content.match(/### \d+\. (\w+) \(enum\)/g) || []).length,
        methods: (content.match(/- .*?\(.*?\): .+/g) || []).length,
        exports: (content.match(/named_exports:/g) || []).length > 0
      };
      
      console.log(`📊 Stats: ${stats.classes} classes, ${stats.functions} functions, ${stats.interfaces} interfaces, ${stats.methods} methods`);
      console.log(`📏 Content size: ${stats.totalSize} characters`);
      
      // Save to output directory
      const filename = `${pkg.name.replace(/[@/]/g, '_')}-unified-output.md`;
      const outputPath = join('output', filename);
      await fs.writeFile(outputPath, content);
      
      // Also save stats
      const statsPath = join('output', `${pkg.name.replace(/[@/]/g, '_')}-stats.json`);
      await fs.writeFile(statsPath, JSON.stringify({
        package: pkg.name,
        description: pkg.description,
        processingTime: elapsed,
        stats,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      console.log(`✅ Saved to ${outputPath}`);
      console.log(`📋 Stats saved to ${statsPath}\n`);
      
    } catch (error) {
      console.error(`❌ Error processing ${pkg.name}:`, error.message);
    }
  }
  
  // Generate summary report
  console.log('========== Generating Summary Report ==========');
  const summaryPath = join('output', 'SUMMARY.md');
  const summary = `# AST Parser Test Results

Generated: ${new Date().toISOString()}

## Test Packages

${testPackages.map(pkg => `- **${pkg.name}**: ${pkg.description}`).join('\n')}

## Files Generated

- \`{package}-unified-output.md\`: Full unified schema output
- \`{package}-stats.json\`: Processing statistics
- \`SUMMARY.md\`: This summary report

## How to Evaluate

1. Check each \`*-unified-output.md\` file for:
   - Proper markdown structure
   - Extracted classes with methods and properties
   - Function signatures with parameters and return types
   - Interface definitions
   - Export information

2. Review \`*-stats.json\` files for:
   - Processing performance
   - Component extraction counts
   - Content size metrics

3. Compare outputs against expected behavior from the original Python example in \`ai_docs/venv-read-package.txt\`
`;
  
  await fs.writeFile(summaryPath, summary);
  console.log(`📄 Summary report saved to ${summaryPath}`);
  console.log('\n🎉 All test outputs generated successfully!');
}

generateTestOutputs().catch(console.error);