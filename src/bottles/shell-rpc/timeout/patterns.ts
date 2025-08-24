/**
 * Pattern matching engine for Shell-RPC resilient timeout system
 *
 * Provides regex-based pattern matching with compiled pattern caching
 * and default patterns for common package managers (pip, uv, npm)
 */
import type { PatternAction, TimeoutConfig } from './types.js';

/**
 * Pattern cache for compiled regex patterns to improve performance
 */
class PatternCache {
  private cache = new Map<string, RegExp>();
  private maxCacheSize = 100; // Prevent unbounded growth

  /**
   * Get or compile a regex pattern
   */
  get(pattern: string | RegExp): RegExp {
    if (pattern instanceof RegExp) {
      return pattern;
    }

    const cached = this.cache.get(pattern);
    if (cached) {
      return cached;
    }

    // Compile new pattern
    const compiled = new RegExp(pattern);

    // Cache management - remove oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(pattern, compiled);
    return compiled;
  }

  /**
   * Clear the pattern cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
    };
  }
}

// Global pattern cache instance
const patternCache = new PatternCache();

/**
 * Pattern matcher that processes output and determines actions
 */
export class PatternMatcher {
  private readonly config: TimeoutConfig;
  private readonly debug: boolean;

  constructor(config: TimeoutConfig) {
    this.config = config;
    this.debug = config.debug ?? false;
  }

  /**
   * Process output data and determine the appropriate action
   */
  processOutput(data: string): PatternAction {
    // Check error patterns first - immediate termination
    for (const pattern of this.config.errorPatterns) {
      const regex = patternCache.get(pattern);
      if (regex.test(data)) {
        if (this.debug) {
          console.error(`[PatternMatcher] Error pattern matched: ${regex.source}`);
        }
        return {
          action: 'terminate',
          pattern: regex,
          patternSource: regex.source,
        };
      }
    }

    // Check progress patterns - full confidence reset
    for (const pattern of this.config.progressPatterns) {
      const regex = patternCache.get(pattern);
      if (regex.test(data)) {
        if (this.debug) {
          console.error(`[PatternMatcher] Progress pattern matched: ${regex.source}`);
        }
        return {
          action: 'reset',
          pattern: regex,
          patternSource: regex.source,
        };
      }
    }

    // No specific pattern matched - default action is extend
    return {
      action: 'extend',
    };
  }

  /**
   * Test if data matches any error pattern
   */
  matchesErrorPattern(data: string): boolean {
    return this.config.errorPatterns.some((pattern) => {
      const regex = patternCache.get(pattern);
      return regex.test(data);
    });
  }

  /**
   * Test if data matches any progress pattern
   */
  matchesProgressPattern(data: string): boolean {
    return this.config.progressPatterns.some((pattern) => {
      const regex = patternCache.get(pattern);
      return regex.test(data);
    });
  }
}

/**
 * Default pattern configurations for common package managers
 */
export const DEFAULT_PATTERNS = {
  /**
   * pip install patterns
   */
  PIP_INSTALL: {
    progressPatterns: [
      /Collecting .+/,
      /Downloading .+/,
      /Building wheel/,
      /Installing collected/,
      /Running setup\.py/,
      /Preparing metadata/,
      /Building wheels for collected packages/,
      /Successfully installed/,
    ],
    errorPatterns: [
      /ERROR: .+/,
      /Failed building wheel/,
      /No matching distribution/,
      /Could not find a version/,
      /Package .+ requires .+/,
      /ERROR: pip's dependency resolver does not currently take into account/,
    ],
  },

  /**
   * uv patterns (modern Python package manager)
   */
  UV: {
    progressPatterns: [
      /Resolved \d+ packages?/,
      /Downloaded .+/,
      /Installed \d+ packages?/,
      /Added \d+ packages?/,
      /Removed \d+ packages?/,
      /Updated \d+ packages?/,
      /[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/, // Spinner characters
      /\d+\/\d+ packages? cached/,
    ],
    errorPatterns: [
      /error: .+/,
      /failed to .+/,
      /No solution found/,
      /Because .+ depends on .+/,
      /Cannot install .+/,
    ],
  },

  /**
   * npm patterns
   */
  NPM: {
    progressPatterns: [
      /npm WARN/,
      /added \d+ packages?/,
      /removed \d+ packages?/,
      /updated \d+ packages?/,
      /found \d+ vulnerabilities/,
      /audited \d+ packages?/,
      /up to date/,
      /Installing dependencies/,
    ],
    errorPatterns: [
      /npm ERR!/,
      /ERESOLVE/,
      /ENOTFOUND/,
      /EACCES/,
      /EPERM/,
      /Could not resolve dependency/,
      /Package .+ not found/,
    ],
  },

  /**
   * pip uninstall patterns
   */
  PIP_UNINSTALL: {
    progressPatterns: [
      /Found existing installation/,
      /Uninstalling .+/,
      /Successfully uninstalled/,
      /Proceed \(Y\/n\)?/,
    ],
    errorPatterns: [/ERROR: .+/, /Cannot uninstall/, /No such file or directory/],
  },

  /**
   * Maven patterns
   */
  MAVEN: {
    progressPatterns: [
      /\[INFO] Downloading from/,
      /\[INFO] Downloaded from/,
      /\[INFO] Building .+/,
      /\[INFO] Compiling \d+ source files/,
      /\[INFO] BUILD SUCCESS/,
    ],
    errorPatterns: [/\[ERROR]/, /\[FATAL]/, /BUILD FAILURE/, /Failed to execute goal/],
  },

  /**
   * Quick commands (no expected progress output)
   */
  QUICK_COMMAND: {
    progressPatterns: [],
    errorPatterns: [
      /command not found/,
      /not recognized/,
      /No such file or directory/,
      /Permission denied/,
      /Access denied/,
    ],
  },
} as const;

/**
 * Create a timeout config with default patterns for a specific package manager
 */
export function createPatternConfig(
  packageManager: keyof typeof DEFAULT_PATTERNS,
  baseConfig: Omit<TimeoutConfig, 'progressPatterns' | 'errorPatterns'>,
): TimeoutConfig {
  const patterns = DEFAULT_PATTERNS[packageManager];

  return {
    ...baseConfig,
    progressPatterns: [...patterns.progressPatterns],
    errorPatterns: [...patterns.errorPatterns],
  };
}

/**
 * Merge multiple pattern sets into a single configuration
 */
export function mergePatterns(...patternSets: Array<keyof typeof DEFAULT_PATTERNS>): {
  progressPatterns: RegExp[];
  errorPatterns: RegExp[];
} {
  const progressPatterns: RegExp[] = [];
  const errorPatterns: RegExp[] = [];

  for (const patternSet of patternSets) {
    const patterns = DEFAULT_PATTERNS[patternSet];
    progressPatterns.push(...patterns.progressPatterns);
    errorPatterns.push(...patterns.errorPatterns);
  }

  return { progressPatterns, errorPatterns };
}

/**
 * Validate patterns for common issues
 */
export function validatePatterns(config: TimeoutConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for valid regex patterns
  for (let i = 0; i < config.progressPatterns.length; i++) {
    try {
      const pattern = config.progressPatterns[i];
      if (pattern) {
        // Test compilation
        pattern.test('');
      }
    } catch (error) {
      errors.push(
        `Progress pattern ${i} is invalid: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  for (let i = 0; i < config.errorPatterns.length; i++) {
    try {
      const pattern = config.errorPatterns[i];
      if (pattern) {
        // Test compilation
        pattern.test('');
      }
    } catch (error) {
      errors.push(
        `Error pattern ${i} is invalid: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Check for conflicting patterns
  for (const progressPattern of config.progressPatterns) {
    for (const errorPattern of config.errorPatterns) {
      if (progressPattern.source === errorPattern.source) {
        errors.push(
          `Pattern conflict: "${progressPattern.source}" is both progress and error pattern`,
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Clear the pattern cache (useful for testing)
 */
export function clearPatternCache(): void {
  patternCache.clear();
}
