/**
 * CI Environment Validation Tests
 *
 * These tests specifically validate the issues we're seeing in CI:
 * - Virtual environment activation and PATH setup
 * - Package discovery timing
 * - UV lock file generation
 * - Scanner integration with bottle environments
 */

import { describe, it, expect, afterEach } from 'vitest';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';

import { PipAdapter } from '#bottles/package-managers/pip';
import { UVAdapter } from '#bottles/package-managers/uv';
import { PythonScanner } from '#scanners/python.js';
import type { PythonScannerInternal } from './types.js';
import {
  createTestEnvironment,
  createPyprojectToml,
  TEST_TIMEOUTS,
  type TestEnvironment,
} from './test-utils.js';
import { isPackageManagerAvailable } from '../../../helpers/environment-cache.js';

describe('CI Environment Validation', () => {
  const testEnvironments: TestEnvironment[] = [];

  afterEach(async () => {
    await Promise.allSettled(testEnvironments.splice(0).map((env) => env.cleanup()));
  });

  describe('Virtual Environment Activation', () => {
    it(
      'should use virtual environment Python, not system Python',
      async () => {
        const env = await createTestEnvironment('ci-venv-activation');
        testEnvironments.push(env);

        if (!(await isPackageManagerAvailable('pip'))) {
          console.warn('Skipping - pip not available');
          return;
        }

        const adapter = new PipAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );

        // Get system Python location before creating venv
        const systemPythonResult = await env.shellRPC.execute(
          'which python3 || which python',
          5000,
        );
        const systemPython = systemPythonResult.stdout.trim();

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // Activate environment and check Python location
        const activationEnv = await adapter.activateEnvironment(env.projectDir);

        // Apply activation environment and check Python
        const envVars = Object.entries(activationEnv)
          .map(([k, v]) => `export ${k}="${v}"`)
          .join('; ');

        const activatedPythonResult = await env.shellRPC.execute(`${envVars}; which python`, 5000);
        const activatedPython = activatedPythonResult.stdout.trim();

        // Virtual environment Python should be different from system Python
        expect(activatedPython).not.toBe(systemPython);
        expect(activatedPython).toContain('.venv');

        // PATH should have venv/bin first
        expect(activationEnv.PATH).toBeDefined();
        const pathParts = activationEnv.PATH?.split(':') ?? [];
        expect(pathParts[0]).toContain('.venv');

        // Log for debugging
        if (process.env.CI || process.env.DEBUG_BOTTLES) {
          /* eslint-disable no-console */
          console.log('[CI Test] System Python:', systemPython);
          console.log('[CI Test] Activated Python:', activatedPython);
          console.log('[CI Test] PATH first entry:', pathParts[0]);
          /* eslint-enable no-console */
        }
      },
      TEST_TIMEOUTS.venv,
    );

    it(
      'should have pip/uv use virtual environment by default',
      async () => {
        const env = await createTestEnvironment('ci-venv-default');
        testEnvironments.push(env);

        if (!(await isPackageManagerAvailable('pip'))) {
          console.warn('Skipping - pip not available');
          return;
        }

        const adapter = new PipAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // Install a package
        await adapter.installPackages(['six'], { cwd: env.projectDir });

        // Check where package was installed
        const locationResult = await env.shellRPC.execute(
          'python -c "import six; print(six.__file__)"',
          5000,
        );
        const sixLocation = locationResult.stdout.trim();

        // Should be in virtual environment, not system
        expect(sixLocation).toContain('.venv');
        expect(sixLocation).not.toContain('/usr/');
        expect(sixLocation).not.toContain('/System/');

        if (process.env.CI || process.env.DEBUG_BOTTLES) {
          /* eslint-disable no-console */
          console.log('[CI Test] Package installed at:', sixLocation);
          /* eslint-enable no-console */
        }
      },
      TEST_TIMEOUTS.install,
    );
  });

  describe('Package Discovery Timing', () => {
    it(
      'should discover packages immediately after pip installation',
      async () => {
        const env = await createTestEnvironment('ci-pip-discovery-timing');
        testEnvironments.push(env);

        if (!(await isPackageManagerAvailable('pip'))) {
          console.warn('Skipping - pip not available');
          return;
        }

        const adapter = new PipAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );
        const scanner = new PythonScanner(env.projectDir);

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // Install packages
        const testPackages = ['six', 'click'];
        await adapter.installPackages(testPackages, { cwd: env.projectDir });

        // Immediately scan without any delay
        const scanResult = await scanner.scan();
        const foundPackages = Object.keys(scanResult.packages ?? {});

        // Log what was found for debugging
        if (process.env.CI || process.env.DEBUG_BOTTLES) {
          /* eslint-disable no-console */
          console.log('[CI Test] Installed packages:', testPackages);
          console.log('[CI Test] Scanner found:', foundPackages);
          console.log('[CI Test] Package count:', foundPackages.length);

          // Also check with pip list
          const pipListResult = await env.shellRPC.execute('pip list --format=json', 5000);
          const pipPackages = JSON.parse(pipListResult.stdout) as Array<{
            name: string;
            version: string;
          }>;
          console.log(
            '[CI Test] Pip list shows:',
            pipPackages.map((p) => p.name),
          );
          /* eslint-enable no-console */
        }

        // Should find all installed packages immediately
        for (const pkg of testPackages) {
          expect(foundPackages).toContain(pkg);
        }
      },
      TEST_TIMEOUTS.install,
    );

    it(
      'should discover packages immediately after UV installation',
      async () => {
        const env = await createTestEnvironment('ci-uv-discovery-timing');
        testEnvironments.push(env);

        if (!(await isPackageManagerAvailable('uv'))) {
          console.warn('Skipping - UV not available');
          return;
        }

        const adapter = new UVAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );
        const scanner = new PythonScanner(env.projectDir);

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // Install packages (UV in venv mode)
        const testPackages = ['six', 'click'];
        await adapter.installPackages(testPackages, { cwd: env.projectDir });

        // Immediately scan without any delay
        const scanResult = await scanner.scan();
        const foundPackages = Object.keys(scanResult.packages ?? {});

        // Log what was found for debugging
        if (process.env.CI || process.env.DEBUG_BOTTLES) {
          /* eslint-disable no-console */
          console.log('[CI Test] UV installed packages:', testPackages);
          console.log('[CI Test] Scanner found:', foundPackages);
          console.log('[CI Test] Package count:', foundPackages.length);

          // Also check with uv pip list
          const uvListResult = await env.shellRPC.execute('uv pip list --format=json', 5000);
          const uvPackages = JSON.parse(uvListResult.stdout) as Array<{
            name: string;
            version: string;
          }>;
          console.log(
            '[CI Test] UV pip list shows:',
            uvPackages.map((p) => p.name),
          );
          /* eslint-enable no-console */
        }

        // Should find all installed packages immediately
        for (const pkg of testPackages) {
          expect(foundPackages).toContain(pkg);
        }
      },
      TEST_TIMEOUTS.install,
    );
  });

  describe('UV Lock File Generation', () => {
    it(
      'should generate UV lock file when using UV sync',
      async () => {
        const env = await createTestEnvironment('ci-uv-lock-generation');
        testEnvironments.push(env);

        if (!(await isPackageManagerAvailable('uv'))) {
          console.warn('Skipping - UV not available');
          return;
        }

        const adapter = new UVAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );

        // Create UV project (not just venv)
        await createPyprojectToml(env.projectDir, { dependencies: ['six', 'click'] });

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // Run UV sync (should create lock file)
        await adapter.installPackages([], { cwd: env.projectDir });

        // Check if lock file was created
        const lockFilePath = join(env.projectDir, 'uv.lock');
        let lockFileExists = false;
        let lockFileContent = '';

        try {
          lockFileContent = await readFile(lockFilePath, 'utf-8');
          lockFileExists = true;
        } catch {
          // File doesn't exist
        }

        if (process.env.CI || process.env.DEBUG_BOTTLES) {
          /* eslint-disable no-console */
          console.log('[CI Test] Lock file exists:', lockFileExists);
          if (lockFileExists) {
            console.log('[CI Test] Lock file size:', lockFileContent.length);
            console.log('[CI Test] Lock file is TOML:', lockFileContent.includes('version ='));

            // Extract version from TOML
            const versionMatch = /^version\s*=\s*(\d+)/m.exec(lockFileContent);
            if (versionMatch) {
              console.log('[CI Test] Lock file version:', versionMatch[1]);
            }

            // Count packages
            const packageCount = (lockFileContent.match(/\[\[package]]/g) ?? []).length;
            console.log('[CI Test] Lock file packages:', packageCount);
          }
          /* eslint-enable no-console */
        }

        // Lock file should exist and be TOML format
        expect(lockFileExists).toBe(true);
        // Check for TOML format markers
        expect(lockFileContent).toContain('version =');
        expect(lockFileContent).toMatch(/\[\[package]]/); // TOML array of tables syntax
      },
      TEST_TIMEOUTS.sync,
    );
  });

  describe('Scanner Site-Packages Discovery', () => {
    it(
      'should find correct site-packages directory in virtual environment',
      async () => {
        const env = await createTestEnvironment('ci-site-packages-discovery');
        testEnvironments.push(env);

        if (!(await isPackageManagerAvailable('pip'))) {
          console.warn('Skipping - pip not available');
          return;
        }

        const adapter = new PipAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // Get Python version in venv
        const pythonVersionResult = await env.shellRPC.execute(
          'python -c "import sys; print(f\\"{sys.version_info.major}.{sys.version_info.minor}\\")"',
          5000,
        );
        const pythonVersion = pythonVersionResult.stdout.trim();

        // Expected site-packages path
        const expectedPath = join(
          env.projectDir,
          '.venv',
          'lib',
          `python${pythonVersion}`,
          'site-packages',
        );

        // Check if scanner finds this path
        const scanner = new PythonScanner(env.projectDir);
        await scanner.scan(); // This initializes the scanner

        // Use scanner's internal property (accessing for test validation)
        const scannerPath = (scanner as unknown as PythonScannerInternal).sitePackagesPath;

        if (process.env.CI || process.env.DEBUG_BOTTLES) {
          /* eslint-disable no-console */
          console.log('[CI Test] Python version:', pythonVersion);
          console.log('[CI Test] Expected site-packages:', expectedPath);
          console.log('[CI Test] Scanner found path:', scannerPath);

          // List what's in the site-packages directory
          const lsResult = await env.shellRPC.execute(`ls -la "${expectedPath}" | head -20`, 5000);
          console.log('[CI Test] Site-packages contents:', lsResult.stdout);
          /* eslint-enable no-console */
        }

        expect(scannerPath).toBeDefined();
        expect(scannerPath).toContain('site-packages');
        expect(scannerPath).toContain('.venv');
      },
      TEST_TIMEOUTS.venv,
    );
  });
});
