import { beforeEach, describe, expect, vi } from 'vitest';
import { claimsApi } from '@/src/lib/api/bff-client';
import { useClaimWizardStore } from '@/src/features/claims/stores/use-claim-wizard-store';
import { apiError, VALID_DESCRIPTION, VALID_STEP_1 } from '../support/claim-data';
import { knownDefect } from '../support/known-defect';

/** The body the BFF actually sends for a request-validation failure (AuthExceptionHandler). */
const BFF_VALIDATION_ERROR = {
  type: 'https://api.demo-app.com/errors/validation-error',
  title: 'Validation Error',
  status: 400,
  detail: 'Validation failed',
  errors: ['claimAmount: must be less than or equal to 1000000'],
};

describe('TC-SUB-11 server validation errors reach the wizard form', () => {
  beforeEach(() => {
    useClaimWizardStore.getState().resetWizard();
    useClaimWizardStore.getState().updateFormData({
      incidentDate: new Date('2026-10-20'),
      ...VALID_STEP_1,
      description: VALID_DESCRIPTION,
    });
  });

  knownDefect('B9', 'a field error from the BFF is shown against that field', async () => {
    vi.spyOn(claimsApi, 'submitClaim').mockRejectedValue(apiError(400, BFF_VALIDATION_ERROR));

    await useClaimWizardStore.getState().submitClaim();

    expect(useClaimWizardStore.getState().fieldErrors.claimAmount).toBeDefined();
  });
});
