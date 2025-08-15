import { PythonScanner } from '#scanners/python';
import { NodeJSScanner } from '#scanners/nodejs';
import type { LanguageScanner } from '#types';

/**
 * Registry of available scanners
 */
const SCANNERS: Array<new (basePath: string) => LanguageScanner> = [
  NodeJSScanner,
  PythonScanner,
];

/**
 * Detects the project type and creates the appropriate scanner
 * @param basePath The base path to scan from (defaults to cwd)
 * @returns The appropriate scanner for the detected environment
 */
export async function detectAndCreateScanner(basePath: string = process.cwd()): Promise<LanguageScanner> {
  // Try each scanner in order
  for (const ScannerClass of SCANNERS) {
    const scanner = new ScannerClass(basePath);
    if (await scanner.canHandle(basePath)) {
      console.error(`[SCAN] Detected ${scanner.language} project (${scanner.supportedPackageManagers.join('/')} support)`);
      return scanner;
    }
  }

  // Default to Python scanner for backward compatibility
  console.error('[SCAN] No specific environment detected, defaulting to Python scanner');
  return new PythonScanner(basePath);
}