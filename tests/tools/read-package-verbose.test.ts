import { test, expect, describe } from 'vitest';
import { readPackageTool } from '#tools/read-package';
import { scanPackagesTool } from '#tools/scan-packages';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Enable verbose output with VERBOSE_TEST=true environment variable
const VERBOSE = process.env.VERBOSE_TEST === 'true';
const OUTPUT_DIR = './output/test-results';

// Ensure output directory exists
if (VERBOSE) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`\n📁 Output directory: ${OUTPUT_DIR}\n`);
}

describe('Verbose Package Reading Tests', () => {
  test('Node.js package output inspection', async () => {
    const packageName = '@modelcontextprotocol/sdk';
    
    console.log(`\n🔍 Testing package: ${packageName}`);
    
    const result = await readPackageTool({
      packageName
    });
    
    if (VERBOSE) {
      console.log('\n=== PACKAGE OUTPUT DETAILS ===');
      console.log('Type:', result.type);
      console.log('Success:', result.success);
      console.log('Has initContent:', !!result.initContent);
      
      if (result.type === 'tree') {
        console.log('File count:', result.fileCount);
        console.log('Main files:', result.mainFiles);
        console.log('Tree files (first 10):', result.fileTree?.slice(0, 10));
      }
      
      if (result.initContent) {
        console.log('\ninitContent length:', result.initContent.length);
        console.log('initContent preview (first 500 chars):');
        console.log('-'.repeat(50));
        console.log(result.initContent.substring(0, 500));
        console.log('-'.repeat(50));
        
        // Write full output to file
        const outputPath = join(OUTPUT_DIR, `${packageName.replace('/', '-')}-output.json`);
        writeFileSync(outputPath, JSON.stringify(result, null, 2));
        console.log(`\n✅ Full output written to: ${outputPath}`);
        
        // Write just the initContent for easier viewing
        if (result.initContent) {
          const contentPath = join(OUTPUT_DIR, `${packageName.replace('/', '-')}-content.txt`);
          writeFileSync(contentPath, result.initContent);
          console.log(`✅ InitContent written to: ${contentPath}`);
        }
      }
      
      console.log('='.repeat(50));
    }
    
    // Basic assertions
    expect(result.success).toBe(true);
    expect(result.initContent).toBeDefined();
  });

  test('Compare Node.js vs Python package outputs', async () => {
    console.log('\n🔬 Comparing Node.js and Python package outputs');
    
    // Test a Node.js package
    const nodePackage = 'vitest';
    const nodeResult = await readPackageTool({
      packageName: nodePackage
    });
    
    // For Python, we'll check if any Python packages exist
    const scanResult = await scanPackagesTool({
      limit: 5,
      filter: '^(?!@)' // Exclude scoped packages (likely not Python)
    });
    
    // Find a Python package if available
    let pythonResult = null;
    let pythonPackage = null;
    
    for (const [name, info] of Object.entries(scanResult.packages)) {
      if (info.language === 'python') {
        pythonPackage = name;
        pythonResult = await readPackageTool({
          packageName: name
        });
        break;
      }
    }
    
    if (VERBOSE) {
      console.log('\n=== COMPARISON RESULTS ===');
      console.log('Node.js package:', nodePackage);
      console.log('Node.js initContent length:', nodeResult.initContent?.length || 0);
      console.log('Node.js initContent type:', typeof nodeResult.initContent);
      
      if (pythonResult && pythonPackage) {
        console.log('\nPython package:', pythonPackage);
        console.log('Python initContent length:', pythonResult.initContent?.length || 0);
        console.log('Python initContent type:', typeof pythonResult.initContent);
      } else {
        console.log('\n⚠️ No Python packages found for comparison');
      }
      
      // Write comparison files
      const nodeOutputPath = join(OUTPUT_DIR, 'nodejs-package-comparison.json');
      writeFileSync(nodeOutputPath, JSON.stringify({
        package: nodePackage,
        result: nodeResult
      }, null, 2));
      console.log(`\n✅ Node.js output written to: ${nodeOutputPath}`);
      
      if (pythonResult) {
        const pythonOutputPath = join(OUTPUT_DIR, 'python-package-comparison.json');
        writeFileSync(pythonOutputPath, JSON.stringify({
          package: pythonPackage,
          result: pythonResult
        }, null, 2));
        console.log(`✅ Python output written to: ${pythonOutputPath}`);
      }
      
      // Create a side-by-side comparison
      const comparisonPath = join(OUTPUT_DIR, 'package-comparison.md');
      const comparisonContent = `# Package Output Comparison

## Node.js Package: ${nodePackage}

### Metadata
- Type: ${nodeResult.type}
- Has initContent: ${!!nodeResult.initContent}
- Content Length: ${nodeResult.initContent?.length || 0}
- File Count: ${nodeResult.fileCount || 'N/A'}

### InitContent Preview (first 1000 chars)
\`\`\`
${nodeResult.initContent?.substring(0, 1000) || 'No content'}
\`\`\`

## Python Package: ${pythonPackage || 'None found'}

### Metadata
- Type: ${pythonResult?.type || 'N/A'}
- Has initContent: ${!!pythonResult?.initContent}
- Content Length: ${pythonResult?.initContent?.length || 0}
- File Count: ${pythonResult?.fileCount || 'N/A'}

### InitContent Preview (first 1000 chars)
\`\`\`
${pythonResult?.initContent?.substring(0, 1000) || 'No content'}
\`\`\`

## Key Differences

1. **Content Type**: 
   - Node.js returns: ${nodeResult.initContent ? 'package.json metadata' : 'nothing'}
   - Python returns: ${pythonResult?.initContent ? 'actual source code' : 'nothing'}

2. **Usefulness for LLMs**:
   - Node.js: Can see dependencies but not implementation
   - Python: Can see actual code, functions, classes
`;
      
      writeFileSync(comparisonPath, comparisonContent);
      console.log(`✅ Comparison written to: ${comparisonPath}`);
      console.log('='.repeat(50));
    }
    
    // Assertions
    expect(nodeResult.success).toBe(true);
    expect(nodeResult.initContent).toBeDefined();
    
    // Log what we're actually getting
    console.log('\n📊 Content Analysis:');
    if (nodeResult.initContent?.includes('"name"') && nodeResult.initContent?.includes('"version"')) {
      console.log('❌ Node.js returns only package.json (metadata, not source code)');
    } else if (nodeResult.initContent?.includes('function') || nodeResult.initContent?.includes('export')) {
      console.log('✅ Node.js returns actual source code');
    }
    
    if (pythonResult?.initContent?.includes('def ') || pythonResult?.initContent?.includes('class ')) {
      console.log('✅ Python returns actual source code');
    }
  });

  test('Test multiple package types with verbose output', async () => {
    const packages = [
      '@modelcontextprotocol/sdk',  // Scoped package
      'vitest',                      // Testing framework
      'typescript',                  // TypeScript compiler
      'express',                     // Web framework (if exists)
    ];
    
    console.log('\n🔄 Testing multiple package types');
    
    for (const pkg of packages) {
      try {
        const result = await readPackageTool({ packageName: pkg });
        
        if (VERBOSE) {
          console.log(`\n--- ${pkg} ---`);
          console.log(`Success: ${result.success}`);
          console.log(`Type: ${result.type}`);
          console.log(`InitContent length: ${result.initContent?.length || 0}`);
          
          // Check what type of content we're getting
          if (result.initContent) {
            const isPackageJson = result.initContent.includes('"name"') && 
                                 result.initContent.includes('"version"');
            const hasSourceCode = result.initContent.includes('function') || 
                                 result.initContent.includes('export') ||
                                 result.initContent.includes('require');
            
            console.log(`Content type: ${isPackageJson ? 'package.json' : hasSourceCode ? 'source code' : 'unknown'}`);
            
            // Write each to separate file
            const outputPath = join(OUTPUT_DIR, `package-${pkg.replace('/', '-')}.txt`);
            writeFileSync(outputPath, result.initContent);
            console.log(`Written to: ${outputPath}`);
          }
        }
      } catch (error) {
        console.log(`❌ Failed to read ${pkg}: ${error.message}`);
      }
    }
  });
});

// Summary test to show what we need to fix
test('SUMMARY: Current vs Expected Behavior', async () => {
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY: Current vs Expected Behavior');
  console.log('='.repeat(60));
  
  const testPackage = '@modelcontextprotocol/sdk';
  const result = await readPackageTool({ packageName: testPackage });
  
  console.log('\n🔍 Testing with:', testPackage);
  console.log('\n📊 Current Behavior:');
  console.log('- Returns:', result.initContent ? 'initContent exists' : 'No initContent');
  
  if (result.initContent) {
    const isPackageJson = result.initContent.includes('"name"') && result.initContent.includes('"version"');
    const hasSourceCode = result.initContent.includes('function') || result.initContent.includes('export');
    
    console.log('- Content type:', isPackageJson ? '📦 package.json only' : hasSourceCode ? '✅ Source code' : '❓ Unknown');
    console.log('- Content length:', result.initContent.length, 'chars');
  }
  
  console.log('\n✅ Expected Behavior:');
  console.log('- Should return BOTH package.json AND main source file');
  console.log('- Should include actual JavaScript/TypeScript code');
  console.log('- Should match Python behavior (returns __init__.py content)');
  
  console.log('\n🎯 Fix Required:');
  console.log('- Modify src/tools/read-package.ts lines 140-149');
  console.log('- Parse package.json to find main entry point');
  console.log('- Read and return the actual source file');
  
  if (VERBOSE) {
    // Create a fix preview file
    const fixPreviewPath = join(OUTPUT_DIR, 'FIX-PREVIEW.md');
    const fixContent = `# Fix Preview for Node.js Package Reading

## Current Output (package.json only):
\`\`\`json
${result.initContent?.substring(0, 500) || 'No content'}
\`\`\`

## Expected Output Structure:
\`\`\`json
{
  "packageJson": { /* package.json content */ },
  "mainSource": "// Actual JavaScript source code here\\nfunction example() { ... }",
  "mainFile": "dist/index.js"
}
\`\`\`

## Implementation Location:
File: src/tools/read-package.ts
Lines: 140-149

## Test Command:
\`\`\`bash
VERBOSE_TEST=true npm test tests/tools/read-package-verbose.test.ts
\`\`\`
`;
    
    writeFileSync(fixPreviewPath, fixContent);
    console.log(`\n📄 Fix preview written to: ${fixPreviewPath}`);
  }
  
  console.log('\n' + '='.repeat(60));
});