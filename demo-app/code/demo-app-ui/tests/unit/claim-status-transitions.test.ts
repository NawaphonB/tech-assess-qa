import { describe, expect, it } from 'vitest';
import { getValidTransitions } from '@/src/features/admin/utils/claim-status-transitions';
import { ALL_STATUSES, ALLOWED_TRANSITIONS } from '../support/claim-data';

const isAllowed = (from: string, to: string) =>
  ALLOWED_TRANSITIONS.some(([allowedFrom, allowedTo]) => allowedFrom === from && allowedTo === to);

const everyPair = ALL_STATUSES.flatMap((from) => ALL_STATUSES.map((to) => [from, to] as const));

describe('UT-STA-04 the UI transition table matches the server', () => {
  it.each(everyPair)('%s -> %s', (from, to) => {
    expect(getValidTransitions(from).includes(to)).toBe(isAllowed(from, to));
  });

  it('offers nothing once a claim is CLOSED', () => {
    expect(getValidTransitions('CLOSED')).toEqual([]);
  });
});
