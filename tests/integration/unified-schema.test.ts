import { describe, it, expect, beforeAll } from 'vitest';
import { readPackageTool } from '../../src/tools/read-package.js';
import { scanPackagesTool } from '../../src/tools/scan-packages.js';
import { join } from 'node:path';
import { promises as fs } from 'node:fs';

describe('Unified Schema Integration', () => {
  beforeAll(async () => {
    // Clean cache before tests
    try {
      await fs.rm('.pkg-local-cache', { recursive: true });
    } catch {
      // Ignore if doesn't exist
    }
    try {
      await fs.rm('.pkg-local-cache.db', { recursive: true });
    } catch {
      // Ignore if doesn't exist
    }
  });

  it('should extract classes and functions from Node.js packages', async () => {
    // First trigger a scan to process content
    const scanResult = await scanPackagesTool({
      forceRefresh: true,
      filter: '^minimist$',
      limit: 1,
    });
    
    expect(scanResult.success).toBe(true);
    expect(scanResult.packages).toHaveProperty('minimist');
    
    // Now read the package - should use cached unified content
    const result = await readPackageTool({ packageName: 'minimist' });
    
    expect(result.type).toBe('tree');
    expect(result.success).toBe(true);
    
    if (result.type === 'tree' && result.initContent) {
      const content = result.initContent;
      
      // Check for unified schema sections
      expect(content).toContain('## 📦 Package Information');
      expect(content).toContain('## 🏗️ Core Components');
      expect(content).toContain('## 🔌 Exports');
      
      // Check that we have actual components extracted
      const hasClasses = content.includes('### ') && content.includes('(class)');
      const hasFunctions = content.includes('### ') && content.includes('()');
      const hasExports = content.includes('main_export:') || content.includes('named_exports:');
      
      expect(hasClasses || hasFunctions).toBe(true);
      expect(hasExports).toBe(true);
      
      console.log('Sample content (first 2000 chars):');
      console.log(content.substring(0, 2000));
    }
  });
  
  it('should produce consistent output for TypeScript packages', async () => {
    // Test with TypeScript package
    const scanResult = await scanPackagesTool({
      forceRefresh: true,
      filter: '^typescript$',
      limit: 1,
    });
    
    expect(scanResult.success).toBe(true);
    
    const result = await readPackageTool({ packageName: 'typescript' });
    
    if (result.type === 'tree' && result.initContent) {
      const content = result.initContent;
      
      // Check TypeScript-specific features
      expect(content).toContain('type_annotations: available');
      
      // Should have the same structure as JavaScript packages
      expect(content).toContain('## 📦 Package Information');
      expect(content).toContain('## 🏗️ Core Components');
    }
  });
});