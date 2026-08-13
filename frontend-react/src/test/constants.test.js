import { describe, it, expect } from 'vitest';
import { VALID_UNITS, EXERCISE_CONSTRAINTS, API_ENDPOINTS } from '../constants';

describe('Constants', () => {
  describe('VALID_UNITS', () => {
    it('exports array of valid units', () => {
      expect(Array.isArray(VALID_UNITS)).toBe(true);
      expect(VALID_UNITS.length).toBeGreaterThan(0);
    });

    it('includes kgs unit', () => {
      expect(VALID_UNITS).toContain('kgs');
    });

    it('includes lbs unit', () => {
      expect(VALID_UNITS).toContain('lbs');
    });

    it('includes miles unit', () => {
      expect(VALID_UNITS).toContain('miles');
    });

    it('contains exactly three units', () => {
      expect(VALID_UNITS.length).toBe(3);
    });
  });

  describe('EXERCISE_CONSTRAINTS', () => {
    it('defines name constraints', () => {
      expect(EXERCISE_CONSTRAINTS.name).toBeDefined();
      expect(EXERCISE_CONSTRAINTS.name.minLength).toBe(1);
      expect(EXERCISE_CONSTRAINTS.name.maxLength).toBe(255);
    });

    it('defines reps constraints', () => {
      expect(EXERCISE_CONSTRAINTS.reps).toBeDefined();
      expect(EXERCISE_CONSTRAINTS.reps.min).toBe(1);
    });

    it('defines weight constraints', () => {
      expect(EXERCISE_CONSTRAINTS.weight).toBeDefined();
      expect(EXERCISE_CONSTRAINTS.weight.min).toBe(0);
    });
  });

  describe('API_ENDPOINTS', () => {
    it('defines exercises endpoint', () => {
      expect(API_ENDPOINTS.EXERCISES).toBe('/exercises');
    });

    it('defines health endpoint', () => {
      expect(API_ENDPOINTS.HEALTH).toBe('/health');
    });

    it('defines config units endpoint', () => {
      expect(API_ENDPOINTS.CONFIG_UNITS).toBe('/config/units');
    });
  });
});
