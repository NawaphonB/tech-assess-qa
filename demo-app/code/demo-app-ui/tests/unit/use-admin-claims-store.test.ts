import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminDashboardApi } from '@/src/lib/api/bff-client';
import { useAdminClaimsStore } from '@/src/features/admin/stores/use-admin-claims-store';
import { aClaim, apiError } from '../support/claim-data';

describe('UT-ADM-02 admin claims store', () => {
  beforeEach(() => {
    useAdminClaimsStore.setState({ claims: [], isLoading: false, error: null, statusFilter: null, searchQuery: '' });
  });

  it('refetches with the chosen status filter', async () => {
    const listAllClaims = vi.spyOn(adminDashboardApi, 'listAllClaims').mockResolvedValue([]);

    useAdminClaimsStore.getState().setStatusFilter('SUBMITTED');

    await vi.waitFor(() => expect(listAllClaims).toHaveBeenCalledWith({ status: 'SUBMITTED' }));
  });

  it('restores the previous status when the server refuses a change', async () => {
    const claim = aClaim({ status: 'APPROVED' });
    useAdminClaimsStore.setState({ claims: [claim] });
    vi.spyOn(adminDashboardApi, 'updateClaimStatus').mockRejectedValue(
      apiError(400, { detail: 'Cannot transition from APPROVED to SUBMITTED' }),
    );

    await expect(useAdminClaimsStore.getState().updateClaimStatus(claim.claimId, 'SUBMITTED')).rejects.toThrow();

    expect(useAdminClaimsStore.getState().claims[0].status).toBe('APPROVED');
    expect(useAdminClaimsStore.getState().error).toBe('Cannot transition from APPROVED to SUBMITTED');
  });
});
