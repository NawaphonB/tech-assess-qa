import { CLAIMANT, uniqueEmail } from '../support/test-accounts';
import { expect, knownDefect, test } from '../support/fixtures';

const VALID_PASSWORD = 'Smoke1234';

test.describe('Sign up (API)', () => {
  test('TC-SIGN-02 creates a CLAIMANT who can then log in', async ({ anonymous }) => {
    knownDefect('B6');
    const email = uniqueEmail();

    const response = await anonymous.signup({ name: 'QA Signup', email, password: VALID_PASSWORD });

    expect(response.status()).toBe(201);
    expect(await response.json()).toMatchObject({ email, role: 'CLAIMANT' });
    expect((await anonymous.login(email, VALID_PASSWORD)).status()).toBe(200);
  });

  test('TC-SIGN-03 an email that is already registered gives 409', async ({ anonymous }) => {
    knownDefect('B6');
    const response = await anonymous.signup({ name: 'Duplicate', email: CLAIMANT.email, password: VALID_PASSWORD });

    expect(response.status()).toBe(409);
  });

  test('TC-SIGN-05 a password shorter than 8 characters gives 400', async ({ anonymous }) => {
    const response = await anonymous.signup({ name: 'QA Signup', email: uniqueEmail(), password: 'Short1' });

    expect(response.status()).toBe(400);
  });

  for (const email of ['jane@', 'jane.doe']) {
    test(`TC-SIGN-06 the malformed email "${email}" gives 400`, async ({ anonymous }) => {
      const response = await anonymous.signup({ name: 'QA Signup', email, password: VALID_PASSWORD });

      expect(response.status()).toBe(400);
    });
  }
});
