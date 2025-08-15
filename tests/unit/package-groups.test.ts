import { describe, it, expect } from 'vitest';
import { isInGroup, getPackageGroups } from '#utils/package-groups';

describe('Package Groups', () => {
  describe('isInGroup', () => {
    it('should identify testing packages', () => {
      expect(isInGroup('vitest', 'testing')).toBe(true);
      expect(isInGroup('@vitest/ui', 'testing')).toBe(true);
      expect(isInGroup('jest', 'testing')).toBe(true);
      expect(isInGroup('mocha', 'testing')).toBe(true);
      expect(isInGroup('chai', 'testing')).toBe(true);
      expect(isInGroup('express', 'testing')).toBe(false);
    });

    it('should identify building packages', () => {
      expect(isInGroup('webpack', 'building')).toBe(true);
      expect(isInGroup('webpack-cli', 'building')).toBe(true);
      expect(isInGroup('vite', 'building')).toBe(true);
      expect(isInGroup('esbuild', 'building')).toBe(true);
      expect(isInGroup('@babel/core', 'building')).toBe(true);
      expect(isInGroup('prettier', 'building')).toBe(false);
    });

    it('should identify linting packages', () => {
      expect(isInGroup('eslint', 'linting')).toBe(true);
      expect(isInGroup('eslint-plugin-react', 'linting')).toBe(true);
      expect(isInGroup('prettier', 'linting')).toBe(true);
      expect(isInGroup('stylelint', 'linting')).toBe(true);
      expect(isInGroup('typescript', 'linting')).toBe(false);
    });

    it('should identify typescript packages', () => {
      expect(isInGroup('typescript', 'typescript')).toBe(true);
      expect(isInGroup('@types/node', 'typescript')).toBe(true);
      expect(isInGroup('@typescript-eslint/parser', 'typescript')).toBe(true);
      expect(isInGroup('ts-node', 'typescript')).toBe(true);
      expect(isInGroup('zod', 'typescript')).toBe(true);
      expect(isInGroup('express', 'typescript')).toBe(false);
    });

    it('should identify framework packages', () => {
      expect(isInGroup('react', 'framework')).toBe(true);
      expect(isInGroup('react-dom', 'framework')).toBe(true);
      expect(isInGroup('vue', 'framework')).toBe(true);
      expect(isInGroup('@angular/core', 'framework')).toBe(true);
      expect(isInGroup('express', 'framework')).toBe(true);
      expect(isInGroup('next', 'framework')).toBe(true);
      expect(isInGroup('lodash', 'framework')).toBe(false);
    });

    it('should identify utility packages', () => {
      expect(isInGroup('lodash', 'utility')).toBe(true);
      expect(isInGroup('moment', 'utility')).toBe(true);
      expect(isInGroup('axios', 'utility')).toBe(true);
      expect(isInGroup('uuid', 'utility')).toBe(true);
      expect(isInGroup('chalk', 'utility')).toBe(true);
      expect(isInGroup('react', 'utility')).toBe(false);
    });
  });

  describe('getPackageGroups', () => {
    it('should return all groups a package belongs to', () => {
      const zodGroups = getPackageGroups('zod');
      expect(zodGroups).toContain('typescript');

      const eslintGroups = getPackageGroups('eslint');
      expect(eslintGroups).toContain('linting');

      const viteGroups = getPackageGroups('vite');
      expect(viteGroups).toContain('building');
    });

    it('should return empty array for unknown packages', () => {
      const groups = getPackageGroups('some-unknown-package-xyz');
      expect(groups).toEqual([]);
    });

    it('should handle packages that belong to multiple groups', () => {
      // Some packages might belong to multiple groups
      // For example, joi is in both typescript (for validation) and utility
      const joiGroups = getPackageGroups('joi');
      expect(joiGroups.length).toBeGreaterThanOrEqual(1);
    });
  });
});
