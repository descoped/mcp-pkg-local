import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

async function buildProject(): Promise<void> {
  console.error('Building mcp-pkg-local...');

  // Clean dist directory
  const distPath = join(projectRoot, 'dist');
  try {
    await fs.rm(distPath, { recursive: true, force: true });
  } catch {
    // Directory might not exist
  }
  await fs.mkdir(distPath, { recursive: true });

  // Use TypeScript compiler to build
  console.error('Compiling TypeScript...');
  try {
    await execAsync('npx tsc -p tsconfig.build.json', { cwd: projectRoot });
  } catch (error) {
    console.error('TypeScript compilation failed:', error);
    throw error; // Re-throw to be handled by the main catch
  }

  // Copy SQL schema file
  console.error('Copying SQL schema file...');
  await fs.mkdir(join(distPath, 'schemas'), { recursive: true });
  await fs.copyFile('src/schemas/cache-schema.sql', join(distPath, 'schemas/cache-schema.sql'));

  // Fix imports in the compiled JavaScript files
  console.error('Fixing imports in compiled files...');
  await fixImports(distPath);

  // Make the entry file executable
  const indexPath = join(distPath, 'index.js');
  await fs.chmod(indexPath, 0o755);

  console.error('Build complete!');
}

async function fixImports(dir: string): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await fixImports(fullPath);
    } else if (entry.name.endsWith('.js')) {
      let content = await fs.readFile(fullPath, 'utf-8');
      
      // Replace # imports with relative imports
      content = content.replace(/#server/g, './server.js');
      content = content.replace(/#types/g, './types.js');
      content = content.replace(/#scanners\/([^'"\s;]+)/g, './scanners/$1.js');
      content = content.replace(/#tools\/([^'"\s;]+)/g, './tools/$1.js');
      content = content.replace(/#utils\/([^'"\s;]+)/g, './utils/$1.js');
      
      // Fix nested imports
      if (fullPath.includes('/scanners/') || fullPath.includes('/tools/') || fullPath.includes('/utils/')) {
        content = content.replace(/\.\/types\.js/g, '../types.js');
        content = content.replace(/\.\/scanners\//g, '../scanners/');
        content = content.replace(/\.\/tools\//g, '../tools/');
        content = content.replace(/\.\/utils\//g, '../utils/');
      }
      
      await fs.writeFile(fullPath, content, 'utf-8');
    }
  }
}

buildProject().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});