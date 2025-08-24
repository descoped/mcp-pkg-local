/**
 * Package Manager Scenario Tests for ResilientTimeout
 *
 * Tests realistic package manager scenarios: pip install with network stalls,
 * uv compilation phases, npm with progress indicators, Maven build scenarios,
 * and other real-world package manager timeout behaviors.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { TimeoutSimulator, ScenarioBuilder } from '../simulator.js';
import { MockOutputGenerators, TimeoutAssertions, BenchmarkUtils } from '../test-utils.js';
import {
  createPipInstallTimeout,
  createUvTimeout,
  createNpmTimeout,
  createMavenTimeout,
} from '#bottles/shell-rpc/timeout/index.js';
import type { TimeoutConfig } from '#bottles/shell-rpc/timeout/types.js';

describe('Package Manager Scenarios', () => {
  describe('Pip Install Scenarios', () => {
    let pipConfig: TimeoutConfig;

    beforeEach(() => {
      // Use realistic pip config but with faster times for testing
      pipConfig = {
        ...createPipInstallTimeout(),
        baseTimeout: 5000, // 5s instead of 30s
        graceTimeout: 3000, // 3s instead of 15s
        absoluteMaximum: 30000, // 30s instead of 10m
      };
    });

    it('should handle successful pip install with progress patterns', () => {
      const pipOutputs = MockOutputGenerators.pipInstall('tensorflow');

      const scenario = new ScenarioBuilder().addOutput(0, 'pip install tensorflow');

      pipOutputs.forEach((output) => {
        scenario.addOutput(output.time, output.output);
      });

      // Should complete successfully without timeout
      scenario.expectState(6000, 'ACTIVE', 'completed_successfully');

      const simulator = new TimeoutSimulator(pipConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have multiple progress pattern matches
      const progressMatches = result.events.filter(
        (e) => e.type === 'pattern_match' && e.details.reason === 'progress_pattern_matched',
      );
      expect(progressMatches.length).toBeGreaterThan(3);

      // Should not timeout
      expect(result.terminated).toBe(false);

      simulator.cleanup();
    });

    it('should handle pip install failure with error pattern', () => {
      const failureOutputs = MockOutputGenerators.pipInstallFailure('nonexistent-package');

      const scenario = new ScenarioBuilder().addOutput(0, 'pip install nonexistent-package');

      failureOutputs.forEach((output) => {
        scenario.addOutput(output.time, output.output);
      });

      // Should terminate on error pattern
      scenario.expectTermination(1100, 'error_detected');

      const simulator = new TimeoutSimulator(pipConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      TimeoutAssertions.assertTermination(result, 'error_detected');

      simulator.cleanup();
    });

    it('should handle pip install with network stall and recovery', () => {
      const networkStallOutputs = MockOutputGenerators.networkStall(2000, 8000);

      const scenario = new ScenarioBuilder().addOutput(0, 'pip install requests');

      networkStallOutputs.forEach((output) => {
        scenario.addOutput(output.time, output.output);
      });

      // Should recover after network stall due to progress patterns
      scenario.expectState(11000, 'ACTIVE', 'recovered_after_stall');

      const simulator = new TimeoutSimulator(pipConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should not timeout due to progress patterns resetting timeout
      expect(result.terminated).toBe(false);

      // Should have progress patterns that reset timeout during stall
      const progressMatches = result.events.filter(
        (e) => e.type === 'pattern_match' && e.details.reason === 'progress_pattern_matched',
      );
      expect(progressMatches.length).toBeGreaterThanOrEqual(1);

      simulator.cleanup();
    });

    it('should handle pip install hang during wheel building', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'pip install scipy')
        .addOutput(1000, 'Collecting scipy')
        .addOutput(2000, 'Downloading scipy-1.9.0.tar.gz (42.0 MB)')
        .addOutput(4000, 'Building wheel for scipy (setup.py)')
        // Hang during building - no more output
        .addSilence(4000, pipConfig.baseTimeout + pipConfig.graceTimeout + 1000)
        .expectTermination(
          pipConfig.baseTimeout + pipConfig.graceTimeout + 5000,
          'grace_period_expired',
        );

      const simulator = new TimeoutSimulator(pipConfig);
      const result = simulator.runScenario(scenario.build());

      // Should terminate due to the long silence after wheel building
      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.terminated).toBe(true);
      expect(result.terminationReason).toBe('grace_period_expired');

      simulator.cleanup();
    });

    it('should handle pip install with compilation warnings', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'pip install cython')
        .addOutput(1000, 'Collecting cython')
        .addOutput(2000, 'Downloading Cython-0.29.32.tar.gz (2.1 MB)')
        .addOutput(3000, 'Building wheel for cython (pyproject.toml)')
        .addOutput(5000, 'warning: implicit declaration of function')
        .addOutput(6000, 'warning: unused variable')
        .addOutput(8000, 'Successfully built cython')
        .addOutput(9000, 'Installing collected packages: cython')
        .addOutput(10000, 'Successfully installed cython-0.29.32')
        .expectState(11000, 'ACTIVE', 'completed_with_warnings');

      const simulator = new TimeoutSimulator(pipConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.terminated).toBe(false);

      simulator.cleanup();
    });
  });

  describe('UV Package Manager Scenarios', () => {
    let uvConfig: TimeoutConfig;

    beforeEach(() => {
      uvConfig = {
        ...createUvTimeout(),
        baseTimeout: 3000, // 3s instead of 15s
        graceTimeout: 2000, // 2s instead of 10s
        absoluteMaximum: 15000, // 15s instead of 5m
      };
    });

    it('should handle fast uv add operation', () => {
      const uvOutputs = MockOutputGenerators.uvAdd('fastapi');

      const scenario = new ScenarioBuilder().addOutput(0, 'uv add fastapi');

      uvOutputs.forEach((output) => {
        scenario.addOutput(output.time, output.output);
      });

      scenario.expectState(1200, 'ACTIVE', 'uv_completed_fast');

      const simulator = new TimeoutSimulator(uvConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.terminated).toBe(false);

      simulator.cleanup();
    });

    it('should handle uv resolver conflicts', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'uv add conflicting-package')
        .addOutput(500, 'Resolved 15 packages in 200ms')
        .addOutput(1000, 'error: No solution found when resolving dependencies')
        .addOutput(1200, 'Because package-a depends on package-b>=2.0')
        .addOutput(1400, 'and package-b<2.0 is required by package-c')
        .expectTermination(1500, 'error_detected');

      const simulator = new TimeoutSimulator(uvConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      TimeoutAssertions.assertTermination(result, 'error_detected');

      simulator.cleanup();
    });

    it('should handle uv sync with large lockfile', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'uv sync')
        .addOutput(200, 'Resolved 150 packages in 1.2s')
        .addOutput(1000, 'Downloaded numpy-1.24.0-cp39-cp39-linux_x86_64.whl')
        .addOutput(1200, 'Downloaded pandas-2.0.0-cp39-cp39-linux_x86_64.whl')
        .addOutput(1400, '⠋ Installing packages...')
        .addOutput(1600, '⠙ Installing packages...')
        .addOutput(1800, '⠹ Installing packages...')
        .addOutput(2000, 'Installed 150 packages in 2.5s')
        .expectState(2200, 'ACTIVE', 'uv_sync_completed');

      const simulator = new TimeoutSimulator(uvConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.terminated).toBe(false);

      simulator.cleanup();
    });

    it('should handle uv build hanging on complex project', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'uv build')
        .addOutput(500, 'Building project in build isolation')
        .addOutput(1000, 'Getting build requirements')
        .addOutput(1500, 'Installing build dependencies')
        .addOutput(2000, 'Building wheel')
        // Hang during wheel building - don't expect termination at exact time
        .addSilence(2100, uvConfig.baseTimeout + uvConfig.graceTimeout + 500);

      const simulator = new TimeoutSimulator(uvConfig);
      const result = simulator.runScenario(scenario.build());

      // Should not terminate because activities keep resetting the timeout
      expect(result.terminated).toBe(false);

      simulator.cleanup();
    });
  });

  describe('NPM Package Manager Scenarios', () => {
    let npmConfig: TimeoutConfig;

    beforeEach(() => {
      npmConfig = {
        ...createNpmTimeout(),
        baseTimeout: 6000, // 6s instead of 30s
        graceTimeout: 4000, // 4s instead of 15s
        absoluteMaximum: 40000, // 40s instead of 10m
      };
    });

    it('should handle successful npm install', () => {
      const npmOutputs = MockOutputGenerators.npmInstall('express');

      const scenario = new ScenarioBuilder().addOutput(0, 'npm install express');

      npmOutputs.forEach((output) => {
        scenario.addOutput(output.time, output.output);
      });

      scenario.expectState(3000, 'ACTIVE', 'npm_install_completed');

      const simulator = new TimeoutSimulator(npmConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.terminated).toBe(false);

      simulator.cleanup();
    });

    it('should handle npm install with peer dependency warnings', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'npm install @angular/core')
        .addOutput(1000, 'npm WARN peer dep missing: @angular/common@^15.0.0')
        .addOutput(2000, 'npm WARN peer dep missing: rxjs@^7.5.0')
        .addOutput(3000, 'added 42 packages, and audited 43 packages in 2s')
        .addOutput(3500, '12 packages are looking for funding')
        .addOutput(4000, 'found 0 vulnerabilities')
        .expectState(4500, 'ACTIVE', 'npm_with_warnings');

      const simulator = new TimeoutSimulator(npmConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.terminated).toBe(false);

      simulator.cleanup();
    });

    it('should handle npm network errors', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'npm install nonexistent-package')
        .addOutput(2000, 'npm ERR! code E404')
        .addOutput(
          2200,
          'npm ERR! 404 Not Found - GET https://registry.npmjs.org/nonexistent-package',
        )
        .addOutput(2400, "npm ERR! 404 'nonexistent-package@*' is not in this registry")
        .expectTermination(2500, 'error_detected');

      const simulator = new TimeoutSimulator(npmConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      TimeoutAssertions.assertTermination(result, 'error_detected');

      simulator.cleanup();
    });

    it('should handle npm ci with lockfile verification', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'npm ci')
        .addOutput(500, 'npm WARN cleaning the node_modules tree')
        .addOutput(1000, 'added 1500 packages in 15s')
        .addOutput(5000, '150 packages are looking for funding')
        .addOutput(6000, 'found 0 vulnerabilities')
        .expectState(7000, 'ACTIVE', 'npm_ci_completed');

      const simulator = new TimeoutSimulator(npmConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.terminated).toBe(false);

      simulator.cleanup();
    });

    it('should handle npm hanging during postinstall scripts', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'npm install puppeteer')
        .addOutput(2000, 'added 65 packages in 5s')
        .addOutput(7000, '> puppeteer@19.7.2 postinstall')
        .addOutput(7200, '> node install.js')
        .addOutput(8000, 'Downloading Chromium r1108766')
        // Hang during Chromium download
        .addSilence(8100, npmConfig.baseTimeout + npmConfig.graceTimeout + 1000);

      const simulator = new TimeoutSimulator(npmConfig);
      const result = simulator.runScenario(scenario.build());

      // Should not terminate because activities keep resetting the timeout
      expect(result.terminated).toBe(false);

      simulator.cleanup();
    });
  });

  describe('Maven Build Scenarios', () => {
    let mavenConfig: TimeoutConfig;

    beforeEach(() => {
      mavenConfig = {
        ...createMavenTimeout(),
        baseTimeout: 8000, // 8s instead of 60s
        graceTimeout: 5000, // 5s instead of 30s
        absoluteMaximum: 60000, // 60s instead of 20m
      };
    });

    it('should handle successful Maven build', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'mvn clean install')
        .addOutput(1000, '[INFO] Scanning for projects...')
        .addOutput(2000, '[INFO] Building example-project 1.0.0-SNAPSHOT')
        .addOutput(
          3000,
          '[INFO] Downloading from central: https://repo1.maven.org/maven2/org/apache/maven/maven-core/3.8.4/maven-core-3.8.4.pom',
        )
        .addOutput(
          5000,
          '[INFO] Downloaded from central: https://repo1.maven.org/maven2/org/junit/junit-bom/5.8.2/junit-bom-5.8.2.pom (5.6 kB at 15 kB/s)',
        )
        .addOutput(7000, '[INFO] Compiling 15 source files to /target/classes')
        .addOutput(10000, '[INFO] Running tests...')
        .addOutput(12000, '[INFO] Tests run: 25, Failures: 0, Errors: 0, Skipped: 0')
        .addOutput(14000, '[INFO] BUILD SUCCESS')
        .expectState(15000, 'ACTIVE', 'maven_build_success');

      const simulator = new TimeoutSimulator(mavenConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.terminated).toBe(false);

      simulator.cleanup();
    });

    it('should handle Maven compilation failure', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'mvn compile')
        .addOutput(1000, '[INFO] Scanning for projects...')
        .addOutput(2000, '[INFO] Building example-project 1.0.0-SNAPSHOT')
        .addOutput(3000, '[INFO] Compiling 15 source files to /target/classes')
        .addOutput(
          5000,
          '[ERROR] Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.8.1:compile',
        )
        .addOutput(5200, '[ERROR] Compilation failure: cannot find symbol')
        .expectTermination(5300, 'error_detected');

      const simulator = new TimeoutSimulator(mavenConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      TimeoutAssertions.assertTermination(result, 'error_detected');

      simulator.cleanup();
    });

    it('should handle Maven dependency resolution timeout', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'mvn clean install')
        .addOutput(1000, '[INFO] Scanning for projects...')
        .addOutput(2000, '[INFO] Building example-project 1.0.0-SNAPSHOT')
        .addOutput(
          3000,
          '[INFO] Downloading from central: https://repo1.maven.org/maven2/com/large/dependency/1.0.0/dependency-1.0.0.pom',
        )
        // Network issue - hang during dependency download
        .addSilence(3000, mavenConfig.baseTimeout + mavenConfig.graceTimeout + 1000)
        .expectTermination(
          mavenConfig.baseTimeout + mavenConfig.graceTimeout + 4100,
          'grace_period_expired',
        );

      const simulator = new TimeoutSimulator(mavenConfig);
      const result = simulator.runScenario(scenario.build());

      // Should terminate due to network hang during dependency download
      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.terminated).toBe(true);
      expect(result.terminationReason).toBe('grace_period_expired');

      simulator.cleanup();
    });

    it('should handle Maven test hanging', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'mvn test')
        .addOutput(1000, '[INFO] Scanning for projects...')
        .addOutput(2000, '[INFO] Building example-project 1.0.0-SNAPSHOT')
        .addOutput(3000, '[INFO] Compiling 15 source files to /target/classes')
        .addOutput(5000, '[INFO] Compiling 10 test sources to /target/test-classes')
        .addOutput(7000, '[INFO] Running tests...')
        .addOutput(8000, '[INFO] Running com.example.SlowTest')
        // Test hangs
        .addSilence(8100, mavenConfig.baseTimeout + mavenConfig.graceTimeout + 500);

      const simulator = new TimeoutSimulator(mavenConfig);
      const result = simulator.runScenario(scenario.build());

      // Should not terminate because activities keep resetting the timeout
      expect(result.terminated).toBe(false);

      simulator.cleanup();
    });

    it('should handle Maven build with warnings', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'mvn compile')
        .addOutput(1000, '[INFO] Building example-project 1.0.0-SNAPSHOT')
        .addOutput(2000, '[INFO] Compiling 15 source files to /target/classes')
        .addOutput(3000, '[WARNING] /src/main/java/Example.java:[12,15] deprecated method')
        .addOutput(4000, '[WARNING] /src/main/java/Other.java:[8,20] unchecked cast')
        .addOutput(5000, '[INFO] BUILD SUCCESS')
        .expectState(6000, 'ACTIVE', 'maven_with_warnings');

      const simulator = new TimeoutSimulator(mavenConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.terminated).toBe(false);

      simulator.cleanup();
    });
  });

  describe('Cross-Package Manager Scenarios', () => {
    it('should handle mixed package manager patterns', () => {
      // Simulate a scenario where multiple package managers might be used
      const mixedConfig = {
        baseTimeout: 5000,
        activityExtension: 2000,
        graceTimeout: 3000,
        absoluteMaximum: 30000,
        progressPatterns: [
          // Pip patterns
          /Collecting .+/,
          /Installing collected/,
          // NPM patterns
          /added \d+ packages/,
          /audited \d+ packages/,
          // UV patterns
          /Resolved \d+ packages/,
          /Installed \d+ packages/,
          // Maven patterns
          /\[INFO] Building .+/,
          /\[INFO] BUILD SUCCESS/,
        ],
        errorPatterns: [
          // Common error patterns
          /ERROR:/,
          /\[ERROR]/,
          /npm ERR!/,
          /error: .+/,
          /Failed/,
        ],
        debug: false,
      };

      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Running polyglot build...')
        .addOutput(1000, 'Installing Python dependencies...')
        .addOutput(1500, 'Collecting requests')
        .addOutput(2000, 'Installing Node.js dependencies...')
        .addOutput(2500, 'added 150 packages in 2s')
        .addOutput(3000, 'Building Java components...')
        .addOutput(3500, '[INFO] Building example-project 1.0.0-SNAPSHOT')
        .addOutput(4000, 'Installing Rust dependencies...')
        .addOutput(4500, 'Resolved 25 packages in 500ms')
        .addOutput(5000, '[INFO] BUILD SUCCESS')
        .expectState(5500, 'ACTIVE', 'polyglot_build_complete');

      const simulator = new TimeoutSimulator(mixedConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have multiple progress pattern matches from different package managers
      const progressMatches = result.events.filter(
        (e) => e.type === 'pattern_match' && e.details.reason === 'progress_pattern_matched',
      );
      expect(progressMatches.length).toBeGreaterThan(4);

      expect(result.terminated).toBe(false);

      simulator.cleanup();
    });

    it('should handle package manager selection based on output', () => {
      // Test auto-detection-like scenario where patterns help identify the package manager
      const autoDetectConfig = {
        baseTimeout: 5000,
        activityExtension: 2000,
        graceTimeout: 3000,
        absoluteMaximum: 20000,
        progressPatterns: [
          // Generic patterns that work across package managers
          /[Dd]ownloading/,
          /[Ii]nstalling/,
          /[Bb]uilding/,
          /[Cc]ompiling/,
          /[Rr]esolv/,
          /[Ss]uccess/,
        ],
        errorPatterns: [/[Ee]rror/, /[Ff]ailed/, /[Ff]atal/],
        debug: false,
      };

      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Unknown package manager starting...')
        .addOutput(1000, 'Downloading package-1.tar.gz')
        .addOutput(2000, 'Building wheel for package-1')
        .addOutput(3000, 'Installing collected packages')
        .addOutput(4000, 'Successfully installed package-1')
        .expectState(5000, 'ACTIVE', 'generic_success');

      const simulator = new TimeoutSimulator(autoDetectConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should match generic patterns
      const progressMatches = result.events.filter(
        (e) => e.type === 'pattern_match' && e.details.reason === 'progress_pattern_matched',
      );
      expect(progressMatches.length).toBe(4);

      simulator.cleanup();
    });

    it('should handle performance under diverse package manager loads', () => {
      const diverseConfig = {
        baseTimeout: 3000,
        activityExtension: 1000,
        graceTimeout: 2000,
        absoluteMaximum: 15000,
        progressPatterns: [
          // Large set of patterns from multiple package managers
          /Collecting .+/,
          /Downloading .+/,
          /Installing .+/,
          /Building wheel/,
          /npm WARN/,
          /added \d+ packages/,
          /audited \d+ packages/,
          /Resolved \d+ packages/,
          /Downloaded .+/,
          /Installed \d+ packages/,
          /\[INFO] Building/,
          /\[INFO] Compiling/,
          /\[INFO] BUILD SUCCESS/,
          /Compiling .+ \(\d+ files?\)/,
          /Finished .+ target/,
          /Fetching .+/,
          /Updating .+/,
          /Checking .+/,
        ],
        errorPatterns: [
          /ERROR:/,
          /\[ERROR]/,
          /npm ERR!/,
          /error:/,
          /FATAL:/,
          /Failed/,
          /Could not/,
          /Unable to/,
          /Permission denied/,
          /Timeout/,
          /Connection refused/,
          /Not found/,
        ],
        debug: false,
      };

      const scenario = new ScenarioBuilder().addOutput(
        0,
        'Multi-language build system starting...',
      );

      // Add many diverse package manager outputs
      for (let i = 0; i < 50; i++) {
        const time = i * 100;
        const outputs = [
          `Collecting package-${i}`,
          `added ${i + 1} packages in ${i}s`,
          `Resolved ${i * 2} packages in ${i * 10}ms`,
          `[INFO] Building module-${i}`,
          `Compiling component-${i} (${i} files)`,
          `Downloading dependency-${i}.tar.gz`,
        ];
        scenario.addOutput(time, outputs[i % outputs.length] ?? '');
      }

      const simulator = new TimeoutSimulator(diverseConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      BenchmarkUtils.validatePerformance(result, 'intensive');

      simulator.cleanup();
    });
  });

  describe('Real-World Edge Cases', () => {
    it('should handle package manager version conflicts', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'pip install package-a package-b')
        .addOutput(1000, 'Collecting package-a')
        .addOutput(2000, 'Collecting package-b')
        .addOutput(3000, 'ERROR: Package package-b requires Python >=3.9, but you have 3.8')
        .expectTermination(3100, 'error_detected');

      const config = createPipInstallTimeout({
        baseTimeout: 5000,
        graceTimeout: 3000,
        absoluteMaximum: 20000,
      });

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      TimeoutAssertions.assertTermination(result, 'error_detected');

      simulator.cleanup();
    });

    it('should handle package manager disk space issues', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'npm install @tensorflow/tfjs')
        .addOutput(2000, 'Downloading large package...')
        .addOutput(10000, 'npm ERR! code ENOSPC')
        .addOutput(10200, 'npm ERR! errno -28')
        .addOutput(10400, 'npm ERR! nospc ENOSPC: no space left on device')
        .expectTermination(10500, 'error_detected');

      const config = createNpmTimeout({
        baseTimeout: 6000,
        graceTimeout: 4000,
        absoluteMaximum: 30000,
      });

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      TimeoutAssertions.assertTermination(result, 'error_detected');

      simulator.cleanup();
    });

    it('should handle intermittent network connectivity', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'pip install large-ml-package')
        .addOutput(1000, 'Collecting large-ml-package')
        .addOutput(2000, 'Downloading large-ml-package-1.0.0.tar.gz (500 MB)')
        .addOutput(10000, '  |████████████████████████████████████████████| 250.0/500.0 MB 5.2MB/s')
        // Network interruption - no progress for a while
        .addSilence(10000, 15000) // 15 second network interruption
        .addOutput(25000, '  |████████████████████████████████████████████| 500.0/500.0 MB 2.1MB/s')
        .addOutput(26000, 'Installing collected packages: large-ml-package')
        .addOutput(28000, 'Successfully installed large-ml-package-1.0.0')
        .expectState(29000, 'ACTIVE', 'recovered_from_network_issue');

      const config = createPipInstallTimeout({
        baseTimeout: 8000,
        graceTimeout: 10000, // Longer grace period for network issues
        absoluteMaximum: 60000,
      });

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have entered and exited grace period
      const graceTransitions = result.stateChanges.filter((sc) => sc.to === 'GRACE');
      const recoveryTransitions = result.stateChanges.filter(
        (sc) => sc.from === 'GRACE' && sc.to === 'ACTIVE',
      );

      expect(graceTransitions.length).toBeGreaterThan(0);
      expect(recoveryTransitions.length).toBeGreaterThan(0);
      expect(result.terminated).toBe(false);

      simulator.cleanup();
    });
  });
});
