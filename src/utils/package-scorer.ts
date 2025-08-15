import type { PackageInfo } from '#types';

/**
 * Package relevance scoring system
 * Calculates relevance scores based on multiple factors
 */
export class PackageScorer {
  // Popular packages that should have higher scores
  private static readonly POPULAR_PACKAGES = new Set([
    // JavaScript ecosystem
    'react',
    'vue',
    'angular',
    '@angular/core',
    'svelte',
    'express',
    'fastify',
    'koa',
    'next',
    'nuxt',
    'gatsby',
    'webpack',
    'vite',
    'rollup',
    'esbuild',
    'parcel',
    'typescript',
    '@types/node',
    'eslint',
    'prettier',
    'jest',
    'vitest',
    'mocha',
    'chai',
    '@testing-library/react',
    'axios',
    'lodash',
    'moment',
    'dayjs',
    'date-fns',
    'rxjs',
    'redux',
    '@reduxjs/toolkit',
    'mobx',
    'zustand',
    'tailwindcss',
    'postcss',
    'sass',
    'styled-components',
    '@babel/core',
    '@babel/preset-env',
    '@babel/preset-react',

    // Python ecosystem
    'django',
    'flask',
    'fastapi',
    'tornado',
    'pyramid',
    'numpy',
    'pandas',
    'scipy',
    'matplotlib',
    'seaborn',
    'requests',
    'httpx',
    'aiohttp',
    'urllib3',
    'sqlalchemy',
    'peewee',
    'tortoise-orm',
    'pymongo',
    'pytest',
    'unittest',
    'nose',
    'tox',
    'black',
    'flake8',
    'pylint',
    'mypy',
    'ruff',
    'celery',
    'redis',
    'pydantic',
    'marshmallow',
    'beautifulsoup4',
    'scrapy',
    'selenium',
    'tensorflow',
    'torch',
    'scikit-learn',
    'keras',
    'pillow',
    'opencv-python',
    'imageio',
  ]);

  // Framework detection patterns
  private static readonly FRAMEWORK_PATTERNS = {
    javascript: {
      react: ['react', 'react-dom', '@types/react'],
      vue: ['vue', '@vue/core', 'nuxt'],
      angular: ['@angular/core', '@angular/common'],
      node: ['express', 'fastify', 'koa', '@types/node'],
      testing: ['jest', 'vitest', 'mocha', '@testing-library'],
    },
    python: {
      web: ['django', 'flask', 'fastapi'],
      data: ['numpy', 'pandas', 'matplotlib'],
      ml: ['tensorflow', 'torch', 'scikit-learn'],
      testing: ['pytest', 'unittest'],
    },
  };

  /**
   * Calculate relevance score for a package
   * Score range: 0-1000
   */
  static calculateRelevanceScore(packageInfo: PackageInfo, context: ScoringContext): number {
    let score = 0;

    // 1. Direct dependency bonus (300 points)
    if (packageInfo.isDirectDependency) {
      score += 300;
    }

    // 2. Production dependency bonus (200 points)
    if (packageInfo.category === 'production') {
      score += 200;
    } else if (packageInfo.category === 'development') {
      score += 100;
    }

    // 3. Framework/core package bonus (150 points)
    if (this.isFrameworkPackage(packageInfo.name, packageInfo.language)) {
      score += 150;
    }

    // 4. Popular package bonus (100 points)
    if (this.POPULAR_PACKAGES.has(packageInfo.name)) {
      score += 100;
    }

    // 5. Has TypeScript definitions (50 points for JS packages)
    if (packageInfo.language === 'javascript' && packageInfo.hasTypes) {
      score += 50;
    }

    // 6. Package size factor (up to 50 points)
    // Prefer smaller, focused packages
    if (packageInfo.sizeBytes) {
      if (packageInfo.sizeBytes < 100_000) {
        // < 100KB
        score += 50;
      } else if (packageInfo.sizeBytes < 1_000_000) {
        // < 1MB
        score += 30;
      } else if (packageInfo.sizeBytes < 10_000_000) {
        // < 10MB
        score += 10;
      }
    }

    // 7. Main file accessibility (30 points)
    if (packageInfo.mainFile) {
      score += 30;
    }

    // 8. Project-specific relevance (up to 100 points)
    score += this.calculateProjectRelevance(packageInfo, context);

    // 9. Namespace/scope bonus (20 points)
    if (packageInfo.name.startsWith('@')) {
      score += 20; // Scoped packages are often more maintained
    }

    // 10. Version stability bonus (up to 30 points)
    score += this.calculateVersionStabilityScore(packageInfo.version);

    // Cap at 1000
    return Math.min(score, 1000);
  }

  /**
   * Calculate popularity score (0-100)
   */
  static calculatePopularityScore(packageInfo: PackageInfo): number {
    let score = 0;

    // Known popular package
    if (this.POPULAR_PACKAGES.has(packageInfo.name)) {
      score += 50;
    }

    // Framework package
    if (this.isFrameworkPackage(packageInfo.name, packageInfo.language)) {
      score += 30;
    }

    // Has TypeScript definitions (indicates wide usage)
    if (packageInfo.hasTypes) {
      score += 10;
    }

    // Scoped package (often from reputable orgs)
    if (packageInfo.name.startsWith('@')) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Check if package is a framework/core package
   */
  private static isFrameworkPackage(name: string, language: 'python' | 'javascript'): boolean {
    const patterns = this.FRAMEWORK_PATTERNS[language];
    if (!patterns) return false;

    for (const category of Object.values(patterns)) {
      if (category.some((pattern) => name.includes(pattern))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate project-specific relevance
   */
  private static calculateProjectRelevance(
    packageInfo: PackageInfo,
    context: ScoringContext,
  ): number {
    let score = 0;

    // Check if package matches project framework
    if (context.detectedFrameworks) {
      for (const framework of context.detectedFrameworks) {
        if (packageInfo.name.toLowerCase().includes(framework.toLowerCase())) {
          score += 50;
        }
      }
    }

    // Check if package is in same namespace as other project packages
    if (context.projectPackages) {
      const namespace = this.extractNamespace(packageInfo.name);
      if (namespace) {
        const sameNamespaceCount = context.projectPackages.filter(
          (pkg) => this.extractNamespace(pkg) === namespace,
        ).length;

        if (sameNamespaceCount > 2) {
          score += 30; // Multiple packages from same namespace
        }
      }
    }

    // Recently accessed packages get a small boost
    if (context.recentlyAccessedPackages?.includes(packageInfo.name)) {
      score += 20;
    }

    return score;
  }

  /**
   * Calculate version stability score
   */
  private static calculateVersionStabilityScore(version: string): number {
    if (!version || version === 'unknown') return 0;

    // Major version 1+ is considered stable
    const majorVersion = parseInt(version.split('.')[0] ?? '0');
    if (majorVersion >= 1) {
      return 30;
    } else if (majorVersion === 0) {
      // 0.x.x versions
      const minorVersion = parseInt(version.split('.')[1] ?? '0');
      if (minorVersion >= 10) {
        return 20; // Relatively mature despite being 0.x
      }
      return 10;
    }

    return 0;
  }

  /**
   * Extract namespace from package name
   */
  private static extractNamespace(packageName: string): string | undefined {
    if (packageName.startsWith('@')) {
      const parts = packageName.split('/');
      return parts[0]; // Return @namespace part
    }

    // For non-scoped packages, check common prefixes
    const prefixes = ['react-', 'vue-', 'angular-', 'babel-', 'webpack-', 'rollup-', 'vite-'];
    for (const prefix of prefixes) {
      if (packageName.startsWith(prefix)) {
        return prefix.slice(0, -1); // Remove trailing dash
      }
    }

    return undefined;
  }

  /**
   * Detect frameworks from project dependencies
   */
  static detectFrameworks(packages: Record<string, PackageInfo>): string[] {
    const frameworks = new Set<string>();

    for (const [name] of Object.entries(packages)) {
      // JavaScript frameworks
      if (name === 'react' || name === 'react-dom') frameworks.add('react');
      if (name === 'vue' || name.startsWith('@vue/')) frameworks.add('vue');
      if (name.startsWith('@angular/')) frameworks.add('angular');
      if (name === 'svelte') frameworks.add('svelte');
      if (name === 'next') frameworks.add('nextjs');
      if (name === 'nuxt') frameworks.add('nuxt');
      if (name === 'gatsby') frameworks.add('gatsby');
      if (name === 'express') frameworks.add('express');
      if (name === 'fastify') frameworks.add('fastify');

      // Python frameworks
      if (name === 'django') frameworks.add('django');
      if (name === 'flask') frameworks.add('flask');
      if (name === 'fastapi') frameworks.add('fastapi');
      if (name === 'numpy' || name === 'pandas') frameworks.add('data-science');
      if (name === 'tensorflow' || name === 'torch') frameworks.add('machine-learning');
    }

    return Array.from(frameworks);
  }

  /**
   * Score all packages in a scan result
   */
  static scorePackages(
    packages: Record<string, PackageInfo>,
    projectPath?: string,
  ): Record<string, PackageInfo> {
    // Detect frameworks and create context
    const detectedFrameworks = this.detectFrameworks(packages);
    const projectPackages = Object.keys(packages);

    const context: ScoringContext = {
      detectedFrameworks,
      projectPackages,
    };

    if (projectPath) {
      context.projectPath = projectPath;
    }

    // Score each package
    const scoredPackages: Record<string, PackageInfo> = {};

    for (const [name, pkg] of Object.entries(packages)) {
      const relevanceScore = this.calculateRelevanceScore(pkg, context);
      const popularityScore = this.calculatePopularityScore(pkg);

      scoredPackages[name] = {
        ...pkg,
        relevanceScore,
        popularityScore,
      };
    }

    return scoredPackages;
  }
}

/**
 * Context for scoring packages
 */
export interface ScoringContext {
  detectedFrameworks?: string[];
  projectPackages?: string[];
  recentlyAccessedPackages?: string[];
  projectPath?: string;
}
