/**
 * Test utility functions for consistent test environment setup
 */
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdir, rm, mkdtemp } from 'node:fs/promises';
import { existsSync } from 'node:fs';

/**
 * Configuration for test directory handling
 */
export interface TestDirConfig {
  /** Whether to preserve directories on test failure */
  preserveOnFailure?: boolean;
  /** Whether to use system temp directory (forced in CI) */
  useSystemTemp?: boolean;
  /** Base directory for non-system temp (defaults to process.cwd()) */
  baseDir?: string;
}

/**
 * Global test configuration from environment
 */
export const TEST_CONFIG: TestDirConfig = {
  preserveOnFailure: process.env.PRESERVE_TEST_DIRS_ON_FAILURE !== 'false',
  useSystemTemp: process.env.CI === 'true' || process.env.USE_SYSTEM_TEMP === 'true',
  baseDir: process.env.TEST_BASE_DIR ?? join(process.cwd(), 'output', 'test-temp'),
};

/**
 * Create a test directory with consistent naming and location strategy
 *
 * @param prefix - Prefix for the directory name (e.g., 'pip-adapter', 'uv-adapter')
 * @param config - Optional config overrides
 * @returns Path to the created directory
 */
export async function createTestDir(prefix: string, config: TestDirConfig = {}): Promise<string> {
  const finalConfig = { ...TEST_CONFIG, ...config };

  if (finalConfig.useSystemTemp) {
    // Use system temp directory (better for CI, cross-platform)
    return await mkdtemp(join(tmpdir(), `${prefix}-`));
  } else {
    // Use local test directory under output/ folder (better for debugging)
    const baseDir = finalConfig.baseDir ?? join(process.cwd(), 'output', 'test-temp');

    // Ensure base directory exists
    if (!existsSync(baseDir)) {
      await mkdir(baseDir, { recursive: true });
    }

    const testDir = join(baseDir, `${prefix}-${Date.now()}`);

    // Clean up existing directory if it exists
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }

    await mkdir(testDir, { recursive: true });
    return testDir;
  }
}

/**
 * Clean up a test directory, respecting preservation settings
 *
 * @param testDir - Directory to clean up
 * @param testFailed - Whether the test failed
 * @param config - Optional config overrides
 */
export async function cleanupTestDir(
  testDir: string,
  testFailed = false,
  config: TestDirConfig = {},
): Promise<void> {
  const finalConfig = { ...TEST_CONFIG, ...config };

  // Preserve directory if test failed and preservation is enabled
  if (testFailed && finalConfig.preserveOnFailure && !finalConfig.useSystemTemp) {
    console.warn(`[Test] Preserving test directory for debugging: ${testDir}`);
    return;
  }

  // Clean up the directory
  try {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.warn(`[Test] Failed to clean up test directory: ${testDir}`, error);
  }
}

/**
 * Create a test context that tracks test state for cleanup
 */
export class TestContext {
  private testDirs = new Set<string>();
  private testFailed = false;

  /**
   * Create a test directory and track it for cleanup
   */
  async createDir(prefix: string, config?: TestDirConfig): Promise<string> {
    const dir = await createTestDir(prefix, config);
    this.testDirs.add(dir);
    return dir;
  }

  /**
   * Mark that a test has failed (affects cleanup behavior)
   */
  markFailed(): void {
    this.testFailed = true;
  }

  /**
   * Clean up all tracked directories
   */
  async cleanup(config?: TestDirConfig): Promise<void> {
    for (const dir of this.testDirs) {
      await cleanupTestDir(dir, this.testFailed, config);
    }
    this.testDirs.clear();
  }
}

/**
 * Environment variable documentation:
 *
 * PRESERVE_TEST_DIRS_ON_FAILURE - Keep test directories when tests fail (default: true locally, false in CI)
 * USE_SYSTEM_TEMP - Force use of system temp directory (default: false locally, true in CI)
 * TEST_BASE_DIR - Base directory for test-temp folders (default: process.cwd())
 * CI - Standard CI environment variable (when true, uses system temp)
 */
