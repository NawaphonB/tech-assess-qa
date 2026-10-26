import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { adminDashboardApi } from '@/src/lib/api/bff-client';
import { AdminClaimsFilters } from '@/src/features/admin/components/admin-claims-filters';
import { useAdminClaimsStore } from '@/src/features/admin/stores/use-admin-claims-store';

const USER_ID_FRAGMENT = '3495ae57';

describe('TC-ADM-05 admin claims search and filters', () => {
  let listAllClaims: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    useAdminClaimsStore.setState({ claims: [], isLoading: false, error: null, statusFilter: null, searchQuery: '' });
    listAllClaims = vi.spyOn(adminDashboardApi, 'listAllClaims').mockResolvedValue([]);
    render(<AdminClaimsFilters />);
  });

  it('refetches with the chosen status', async () => {
    await userEvent.selectOptions(screen.getByLabelText('Filter claims by status'), 'SUBMITTED');

    expect(listAllClaims).toHaveBeenLastCalledWith({ status: 'SUBMITTED' });
  });

  it('applies the user ID search after typing stops', async () => {
    await userEvent.type(screen.getByLabelText('Search claims by user ID'), USER_ID_FRAGMENT);

    await waitFor(() => expect(useAdminClaimsStore.getState().searchQuery).toBe(USER_ID_FRAGMENT));
  });

  it('clears both filters and reloads every claim', async () => {
    await userEvent.selectOptions(screen.getByLabelText('Filter claims by status'), 'APPROVED');

    await userEvent.click(screen.getByRole('button', { name: 'Clear Filters' }));

    expect(useAdminClaimsStore.getState()).toMatchObject({ statusFilter: null, searchQuery: '' });
    expect(listAllClaims).toHaveBeenLastCalledWith({});
    expect(screen.queryByRole('button', { name: 'Clear Filters' })).not.toBeInTheDocument();
  });
});
