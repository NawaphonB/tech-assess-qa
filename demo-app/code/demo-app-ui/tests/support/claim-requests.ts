/** Request bodies for POST /api/claims. Defaults are valid; each test overrides one field. */
export interface SubmitClaimBody {
  incidentDate: string;
  incidentLocation: string;
  description: string;
  claimAmount: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** ISO date (yyyy-mm-dd) in UTC, offset from today by the given number of days. */
export function utcDate(offsetDays = 0): string {
  return new Date(Date.now() + offsetDays * DAY_MS).toISOString().slice(0, 10);
}

/** A marker unique to this test run, so tests can find the claims they created. */
export function runMarker(): string {
  return `QA-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

export function aClaimRequest(overrides: Partial<SubmitClaimBody> = {}): SubmitClaimBody {
  return {
    incidentDate: utcDate(-1),
    incidentLocation: '12 Orchard Road, Singapore',
    description: `${runMarker()} burst pipe flooded the kitchen`,
    claimAmount: 1234.56,
    ...overrides,
  };
}

export const textOfLength = (length: number) => 'x'.repeat(length);
