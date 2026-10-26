import { CLAIMANT, uniqueEmail } from '../support/test-accounts';
import { LoginPage } from './pages/login-page';
import { MyClaimsPage } from './pages/my-claims-page';
import { SignupPage } from './pages/signup-page';
import { expect, knownDefect, test } from './e2e-fixtures';

test.describe('Authentication, sign up and access (UI)', () => {
  test('TC-AUTH-01 a claimant logs in and lands on My Claims', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.logInAs(CLAIMANT);

    await page.waitForURL('**/claims');
    await expect(new MyClaimsPage(page).heading).toBeVisible();
    await expect(page.getByText(`Welcome, ${CLAIMANT.name}`)).toBeVisible();
  });

  test('TC-AUTH-08 a visitor without a session is sent to login, keeping the page they wanted', async ({ page }) => {
    await page.goto('/claims');

    await page.waitForURL('**/login?redirect=%2Fclaims');
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
  });

  test('TC-ADM-06 a claimant who opens the admin claims page is turned away', async ({ claimantPage }) => {
    await claimantPage.goto('/admin/claims');

    await expect(claimantPage.getByText('Access denied')).toBeVisible();
    await claimantPage.waitForURL('**/claims');
  });

  test('TC-SIGN-01 a new customer signs up and then logs in', async ({ page }) => {
    knownDefect('B6');
    const account = { name: 'QA Signup', email: uniqueEmail('qa.ui.signup'), password: 'Smoke1234' };
    const signup = new SignupPage(page);
    await signup.goto();

    await signup.signUp(account);

    await expect(page.getByText('Account created! Please log in.')).toBeVisible();
    await page.waitForURL('**/login');
    await new LoginPage(page).logInAs({ ...account, role: 'CLAIMANT' });
    await page.waitForURL('**/claims');
  });
});
