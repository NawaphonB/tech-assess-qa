import { beforeEach, describe, expect, it, vi } from 'vitest';
import { claimsApi } from '@/src/lib/api/bff-client';
import { useClaimsStore } from '@/src/features/claims/stores/use-claims-store';
import { aClaimSummary } from '../support/claim-data';

const older = aClaimSummary({ createdAt: new Date('2026-10-01T00:00:00Z') });
const newer = aClaimSummary({ createdAt: new Date('2026-10-20T00:00:00Z') });

describe('UT-MY-02 claimant claims store', () => {
  beforeEach(() => {
    useClaimsStore.setState({ claims: [], isLoading: false, error: null });
  });

  it('lists claims newest first', async () => {
    vi.spyOn(claimsApi, 'listClaims').mockResolvedValue([older, newer]);

    await useClaimsStore.getState().fetchClaims();

    expect(useClaimsStore.getState().claims.map((claim) => claim.claimId)).toEqual([newer.claimId, older.claimId]);
  });

  it('updates the status of the matching claim only', () => {
    useClaimsStore.setState({ claims: [older, newer] });

    useClaimsStore.getState().updateClaimStatus(newer.claimId, 'APPROVED');

    const byId = Object.fromEntries(useClaimsStore.getState().claims.map((claim) => [claim.claimId, claim.status]));
    expect(byId).toEqual({ [older.claimId]: 'SUBMITTED', [newer.claimId]: 'APPROVED' });
  });
});
