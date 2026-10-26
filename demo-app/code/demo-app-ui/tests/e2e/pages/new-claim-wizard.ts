import type { Page } from '@playwright/test';
import type { SubmitClaimBody } from '../../support/claim-requests';

/** The 3-step claim wizard at /claims/new. */
export class NewClaimWizard {
  constructor(private readonly page: Page) {}

  async submit(claim: SubmitClaimBody): Promise<void> {
    const incident = this.page.getByTestId('wizard-step-1');
    await incident.getByLabel(/when did the incident occur/i).fill(claim.incidentDate);
    await incident.getByLabel(/where did the incident occur/i).fill(claim.incidentLocation);
    await incident.getByLabel(/claim amount/i).fill(String(claim.claimAmount));
    await incident.getByRole('button', { name: 'Next' }).click();

    const details = this.page.getByTestId('wizard-step-2');
    await details.getByLabel(/describe what happened/i).fill(claim.description);
    await details.getByRole('button', { name: 'Next' }).click();

    const review = this.page.getByTestId('wizard-step-3');
    await review.getByRole('button', { name: 'Submit Claim' }).click();
  }
}
