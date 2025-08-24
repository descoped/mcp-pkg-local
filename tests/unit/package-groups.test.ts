import { describe, it, expect } from 'vitest';
import { isInGroup } from '#utils/package-groups.js';

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
});
