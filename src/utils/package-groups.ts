/**
 * Predefined package groups for common development tasks
 */

export type PackageGroup = 'testing' | 'building' | 'linting' | 'typescript' | 'framework' | 'utility';

export const PACKAGE_GROUPS: Record<PackageGroup, string[]> = {
  testing: [
    // Test runners
    'jest', '@jest/.*', 'jest-.*',
    'mocha', 'mocha-.*',
    'vitest', '@vitest/.*',
    'ava', 'ava-.*',
    'tape', 'tape-.*',
    'qunit', 'qunit-.*',
    'jasmine', 'jasmine-.*',
    'karma', 'karma-.*',
    'cypress', 'cypress-.*',
    'playwright', '@playwright/.*',
    'puppeteer', 'puppeteer-.*',
    '@testing-library/.*',
    
    // Assertion libraries
    'chai', 'chai-.*',
    'expect', 'expect-.*',
    'should', 'should-.*',
    'assert', 'assert-.*',
    
    // Mocking
    'sinon', 'sinon-.*',
    'nock', 'nock-.*',
    'mockery', 'mock-.*',
    
    // Coverage
    'nyc', 'c8', 'istanbul', 'istanbul-.*',
    '@istanbuljs/.*',
    'coveralls', 'codecov',
  ],
  
  building: [
    // Bundlers
    'webpack', 'webpack-.*',
    'rollup', '@rollup/.*', 'rollup-.*',
    'parcel', 'parcel-.*',
    'esbuild', 'esbuild-.*',
    'vite', 'vite-.*', '@vitejs/.*',
    'snowpack', 'snowpack-.*',
    'tsup', 'tsup-.*',
    'microbundle', 'microbundle-.*',
    
    // Compilers/Transpilers
    'babel', '@babel/.*', 'babel-.*',
    'swc', '@swc/.*',
    'sucrase', 'sucrase-.*',
    
    // Build tools
    'gulp', 'gulp-.*',
    'grunt', 'grunt-.*',
    'brunch', 'brunch-.*',
    'turbo', 'turborepo',
    'nx', '@nrwl/.*',
    'lerna', 'lerna-.*',
    'rush', '@microsoft/rush-.*',
  ],
  
  linting: [
    // Linters
    'eslint', 'eslint-.*', '@eslint/.*', '@eslint-community/.*',
    'tslint', 'tslint-.*',
    'jshint', 'jshint-.*',
    'jscs', 'jscs-.*',
    'standard', 'standard-.*',
    'xo', 'xo-.*',
    
    // Formatters
    'prettier', 'prettier-.*',
    'pretty-quick', 'pretty-.*',
    
    // Style linters
    'stylelint', 'stylelint-.*',
    'sass-lint', 'sass-lint-.*',
    'lesshint', 'lesshint-.*',
    
    // Commit linters
    'commitlint', '@commitlint/.*',
    'commitizen', 'commitizen-.*',
    'cz-.*',
    
    // Other quality tools
    'husky', 'husky-.*',
    'lint-staged', 'lint-staged-.*',
  ],
  
  typescript: [
    // TypeScript core
    'typescript', 'ts-node', 'ts-node-.*',
    'tsx', 'tslib',
    
    // TypeScript tools
    '@types/.*',
    '@typescript-eslint/.*',
    'typedoc', 'typedoc-.*',
    'tsc-watch', 'tsc-.*',
    'ts-jest', 'ts-mocha',
    'ts-loader', 'ts-.*',
    
    // Type checking
    'type-fest', 'type-.*',
    'io-ts', 'io-ts-.*',
    'runtypes', 'runtypes-.*',
    'zod', 'zod-.*',
    'yup', 'joi', 'ajv',
    'superstruct', 'ow',
  ],
  
  framework: [
    // Frontend frameworks
    'react', 'react-.*', '@react-.*',
    'vue', 'vue-.*', '@vue/.*',
    'angular', '@angular/.*',
    'svelte', 'svelte-.*', '@sveltejs/.*',
    'solid-js', 'solid-.*',
    'preact', 'preact-.*',
    'lit', 'lit-.*', '@lit/.*',
    'alpine', 'alpinejs',
    
    // Backend frameworks
    'express', 'express-.*',
    'koa', 'koa-.*', '@koa/.*',
    'fastify', 'fastify-.*',
    'hapi', '@hapi/.*',
    'nestjs', '@nestjs/.*',
    'next', 'next-.*',
    'nuxt', 'nuxt-.*', '@nuxt/.*',
    'gatsby', 'gatsby-.*',
    'remix', '@remix-run/.*',
    'astro', 'astro-.*',
    
    // Mobile frameworks
    'react-native', 'react-native-.*',
    'expo', 'expo-.*',
    'ionic', '@ionic/.*',
    'nativescript', '@nativescript/.*',
  ],
  
  utility: [
    // Common utilities
    'lodash', 'lodash-.*',
    'underscore', 'underscore-.*',
    'ramda', 'ramda-.*',
    
    // Date utilities
    'moment', 'moment-.*',
    'date-fns', 'date-fns-.*',
    'dayjs', 'dayjs-.*',
    'luxon', 'luxon-.*',
    
    // HTTP/Network
    'axios', 'axios-.*',
    'node-fetch', 'fetch-.*',
    'got', 'got-.*',
    'request', 'request-.*',
    'superagent', 'superagent-.*',
    
    // Validation
    'validator', 'validator-.*',
    'joi', 'joi-.*',
    'yup', 'yup-.*',
    
    // Other common utilities
    'uuid', 'nanoid', 'shortid',
    'chalk', 'colors', 'kleur', 'picocolors',
    'dotenv', 'dotenv-.*',
    'cross-env', 'cross-.*',
    'rimraf', 'del', 'del-.*',
    'glob', 'glob-.*', 'globby',
    'fs-extra', 'fs-.*',
    'commander', 'yargs', 'minimist',
    'inquirer', 'prompts', 'enquirer',
  ],
};

/**
 * Check if a package belongs to a specific group
 */
export function isInGroup(packageName: string, group: PackageGroup): boolean {
  const patterns = PACKAGE_GROUPS[group];
  if (!patterns) return false;
  
  for (const pattern of patterns) {
    // Handle exact matches first
    if (pattern === packageName) {
      return true;
    }
    
    // Check if pattern contains wildcards (. is used as wildcard in our patterns)
    if (pattern.includes('.*')) {
      // Pattern already uses .* for wildcards, just escape other special chars
      const regexPattern = pattern
        .replace(/[+?^${}()|[\]\\]/g, '\\$&');  // Escape regex special chars except . and *
      
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(packageName)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Get all groups a package belongs to
 */
export function getPackageGroups(packageName: string): PackageGroup[] {
  const groups: PackageGroup[] = [];
  
  for (const group of Object.keys(PACKAGE_GROUPS) as PackageGroup[]) {
    if (isInGroup(packageName, group)) {
      groups.push(group);
    }
  }
  
  return groups;
}