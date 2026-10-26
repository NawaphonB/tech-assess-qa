import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WizardStep1 } from '@/src/features/claims/components/wizard-step-1';
import { useClaimWizardStore } from '@/src/features/claims/stores/use-claim-wizard-store';

const nextButton = () => screen.getByRole('button', { name: 'Next' });

describe('TC-SUB-09 wizard step 1 blocks invalid input', () => {
  beforeEach(() => {
    useClaimWizardStore.getState().resetWizard();
    render(<WizardStep1 />);
  });

  it('keeps Next disabled until every field is valid', () => {
    expect(nextButton()).toBeDisabled();
  });

  it('explains a location that is too short', async () => {
    await userEvent.type(screen.getByLabelText(/where did the incident occur/i), 'abcd');

    expect(await screen.findByText('Location must be at least 5 characters')).toBeInTheDocument();
    expect(nextButton()).toBeDisabled();
  });

  it('explains an amount below the minimum', async () => {
    await userEvent.type(screen.getByLabelText(/claim amount/i), '0');

    expect(await screen.findByText('Claim amount must be at least $0.01')).toBeInTheDocument();
  });

  it('enables Next once date, location and amount are valid', async () => {
    fireEvent.change(screen.getByLabelText(/when did the incident occur/i), { target: { value: '2026-10-01' } });
    await userEvent.type(screen.getByLabelText(/where did the incident occur/i), '12 Orchard Road, Singapore');
    await userEvent.type(screen.getByLabelText(/claim amount/i), '1234.56');

    await waitFor(() => expect(nextButton()).toBeEnabled());
  });
});
