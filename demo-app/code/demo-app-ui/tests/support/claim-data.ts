import type { ClaimResponse, ClaimStatus, ClaimSummaryResponse } from '@/src/lib/api/bff-client';
import { ResponseError } from '@/src/lib/api/generated/runtime';

/** The 7 status transitions the server allows today; mirrors ClaimStatusTest in claims-service. */
export const ALLOWED_TRANSITIONS: ReadonlyArray<readonly [ClaimStatus, ClaimStatus]> = [
  ['SUBMITTED', 'UNDER_REVIEW'],
  ['SUBMITTED', 'REJECTED'],
  ['UNDER_REVIEW', 'APPROVED'],
  ['UNDER_REVIEW', 'REJECTED'],
  ['UNDER_REVIEW', 'SUBMITTED'],
  ['APPROVED', 'CLOSED'],
  ['REJECTED', 'CLOSED'],
];

export const ALL_STATUSES: ClaimStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED'];

export const VALID_STEP_1 = {
  incidentLocation: '12 Orchard Road, Singapore',
  claimAmount: 1234.56,
};

export const VALID_DESCRIPTION = 'Burst pipe flooded the kitchen floor';

export function aClaimSummary(overrides: Partial<ClaimSummaryResponse> = {}): ClaimSummaryResponse {
  return {
    claimId: crypto.randomUUID(),
    incidentDate: new Date('2026-10-20'),
    description: VALID_DESCRIPTION,
    claimAmount: VALID_STEP_1.claimAmount,
    status: 'SUBMITTED',
    createdAt: new Date('2026-10-21T10:00:00Z'),
    ...overrides,
  };
}

export function aClaim(overrides: Partial<ClaimResponse> = {}): ClaimResponse {
  return {
    claimId: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    incidentDate: new Date('2026-10-20'),
    incidentLocation: VALID_STEP_1.incidentLocation,
    description: VALID_DESCRIPTION,
    claimAmount: VALID_STEP_1.claimAmount,
    status: 'SUBMITTED',
    createdAt: new Date('2026-10-21T10:00:00Z'),
    updatedAt: new Date('2026-10-21T10:00:00Z'),
    ...overrides,
  };
}

/** An API error as the generated client throws it for a non-2xx response. */
export function apiError(status: number, body: unknown = {}): ResponseError {
  const response = new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
  return new ResponseError(response, `Response returned an error code: ${status}`);
}
