import { test as base, expect } from '@playwright/test';
import { BffClient } from './bff-client';
import { ADMIN, CLAIMANT } from './test-accounts';

interface ApiFixtures {
  claimant: BffClient;
  admin: BffClient;
  anonymous: BffClient;
}

/** Signed-in API clients for each role, created per test and disposed after it. */
export const test = base.extend<ApiFixtures>({
  claimant: async ({}, use) => {
    const client = await BffClient.signedInAs(CLAIMANT);
    await use(client);
    await client.dispose();
  },
  admin: async ({}, use) => {
    const client = await BffClient.signedInAs(ADMIN);
    await use(client);
    await client.dispose();
  },
  anonymous: async ({}, use) => {
    const client = await BffClient.anonymous();
    await use(client);
    await client.dispose();
  },
});

export { expect };

/**
 * Marks the current test as asserting the fix for an open defect: it is reported
 * as an expected failure while the defect reproduces, and fails once it is fixed.
 * Set SHOW_KNOWN_DEFECTS=1 to run it as an ordinary test and see the assertion.
 */
export function knownDefect(defectId: string): void {
  if (process.env.SHOW_KNOWN_DEFECTS !== '1') {
    test.fail(true, `Known defect ${defectId} still reproduces`);
  }
  test.info().annotations.push({ type: 'known-defect', description: defectId });
}
