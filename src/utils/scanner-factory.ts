import { PythonScanner } from '#scanners/python.js';
import { NodeJSScanner } from '#scanners/nodejs.js';
import type { IPackageScanner } from '#scanners/types.js';

/**
 * Registry of available scanners
 */
const SCANNERS = [NodeJSScanner, PythonScanner] as const;

/**
 * Detects the project type and creates the appropriate scanner
 * @param basePath The base path to scan from (defaults to cwd)
 * @returns The appropriate scanner for the detected environment
 */
export async function detectAndCreateScanner(
  basePath: string = process.cwd(),
): Promise<IPackageScanner> {
  // Try each scanner in order
  for (const ScannerClass of SCANNERS) {
    const scanner = new ScannerClass(basePath);
    if (await scanner.canHandle(basePath)) {
      console.error(
        `[SCAN] Detected ${scanner.language} project (${scanner.supportedPackageManagers.join('/')} support)`,
      );
      return scanner as IPackageScanner;
    }
  }

  // Default to Python scanner for backward compatibility
  console.error('[SCAN] No specific environment detected, defaulting to Python scanner');
  return new PythonScanner(basePath) as IPackageScanner;
}
