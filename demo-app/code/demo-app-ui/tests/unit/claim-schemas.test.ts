import { describe, expect, it } from 'vitest';
import { step1Schema, step2Schema } from '@/src/features/claims/schemas/claim-schemas';
import { VALID_DESCRIPTION, VALID_STEP_1 } from '../support/claim-data';

const yesterday = () => new Date(Date.now() - 24 * 60 * 60 * 1000);
const tomorrow = () => new Date(Date.now() + 24 * 60 * 60 * 1000);
const textOfLength = (length: number) => 'x'.repeat(length);

const step1 = (overrides: Record<string, unknown> = {}) =>
  step1Schema.safeParse({ incidentDate: yesterday(), ...VALID_STEP_1, ...overrides });

describe('UT-SUB-06 wizard field rules match the server', () => {
  it.each([0.01, 1_000_000])('accepts amount %d', (claimAmount) => {
    expect(step1({ claimAmount }).success).toBe(true);
  });

  it.each([0, -1, 1_000_000.01])('rejects amount %d', (claimAmount) => {
    expect(step1({ claimAmount }).success).toBe(false);
  });

  it.each([5, 200])('accepts a location of %d characters', (length) => {
    expect(step1({ incidentLocation: textOfLength(length) }).success).toBe(true);
  });

  it.each([4, 201])('rejects a location of %d characters', (length) => {
    expect(step1({ incidentLocation: textOfLength(length) }).success).toBe(false);
  });

  it('rejects an incident date in the future', () => {
    expect(step1({ incidentDate: tomorrow() }).success).toBe(false);
  });

  it.each([10, 1000])('accepts a description of %d characters', (length) => {
    expect(step2Schema.safeParse({ description: textOfLength(length) }).success).toBe(true);
  });

  it.each([9, 1001])('rejects a description of %d characters', (length) => {
    expect(step2Schema.safeParse({ description: textOfLength(length) }).success).toBe(false);
  });

  it('accepts a realistic description', () => {
    expect(step2Schema.safeParse({ description: VALID_DESCRIPTION }).success).toBe(true);
  });
});
