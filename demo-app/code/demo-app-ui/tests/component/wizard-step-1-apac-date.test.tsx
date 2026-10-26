import { afterAll, beforeAll, beforeEach, describe, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WizardStep1 } from '@/src/features/claims/components/wizard-step-1';
import { useClaimWizardStore } from '@/src/features/claims/stores/use-claim-wizard-store';
import { knownDefect } from '../support/known-defect';

/** 07:00 on 27 Oct in Singapore is still 26 Oct in UTC. */
const SINGAPORE_MORNING = new Date('2026-10-26T23:00:00Z');
const LOCAL_TODAY = '2026-10-27';
const originalTimeZone = process.env.TZ;

describe('TC-SUB-04 a claimant in UTC+8 can report an incident from today', () => {
  beforeAll(() => {
    process.env.TZ = 'Asia/Singapore';
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(SINGAPORE_MORNING);
  });

  afterAll(() => {
    vi.useRealTimers();
    process.env.TZ = originalTimeZone;
  });

  beforeEach(() => {
    useClaimWizardStore.getState().resetWizard();
    render(<WizardStep1 />);
  });

  knownDefect('B5', "the date picker allows the claimant's local today", () => {
    expect(screen.getByLabelText(/when did the incident occur/i)).toHaveAttribute('max', LOCAL_TODAY);
  });

  knownDefect('B5', "choosing the local today raises no 'future date' error", async () => {
    fireEvent.change(screen.getByLabelText(/when did the incident occur/i), { target: { value: LOCAL_TODAY } });

    await waitFor(() => expect(screen.queryByText('Incident date cannot be in the future')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByLabelText(/when did the incident occur/i)).toHaveAttribute('aria-invalid', 'false'));
  });
});
