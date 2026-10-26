import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClaimStatusSelect } from '@/src/features/admin/components/claim-status-select';
import type { ClaimStatus } from '@/src/lib/api/bff-client';

const CLAIM_ID = '2cef5ea4-c6c1-4bd3-aebd-574c60f965cc';

const renderFor = (currentStatus: ClaimStatus) =>
  render(<ClaimStatusSelect claimId={CLAIM_ID} currentStatus={currentStatus} />);

const offeredStatuses = () =>
  screen.getAllByRole('option').map((option) => option.textContent).filter((label) => label !== 'Update Status');

describe('TC-STA-08 status select offers only valid next statuses', () => {
  it.each([
    ['SUBMITTED', ['Under Review', 'Rejected']],
    ['UNDER_REVIEW', ['Approved', 'Rejected', 'Submitted']],
    ['APPROVED', ['Closed']],
    ['REJECTED', ['Closed']],
  ] as const)('a %s claim offers %j', (status, expected) => {
    renderFor(status);

    expect(offeredStatuses()).toEqual(expected);
  });

  it('offers nothing for a CLOSED claim', () => {
    renderFor('CLOSED');

    expect(screen.getByLabelText('No status transitions available')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('asks for confirmation before changing the status', async () => {
    renderFor('SUBMITTED');

    await userEvent.selectOptions(screen.getByRole('combobox'), 'UNDER_REVIEW');

    expect(await screen.findByText('Change status to Under Review?')).toBeInTheDocument();
  });
});
