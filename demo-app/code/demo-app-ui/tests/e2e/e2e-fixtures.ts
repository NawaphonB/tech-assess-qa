import type { Browser, Page } from '@playwright/test';
import { test as apiTest } from '../support/fixtures';
import { ADMIN, CLAIMANT, type TestAccount } from '../support/test-accounts';
import { LoginPage } from './pages/login-page';

interface E2eFixtures {
  claimantPage: Page;
  adminPage: Page;
}

/** Opens a fresh browser context and logs in through the real login page. */
async function signedInPage(browser: Browser, account: TestAccount, landingPath: string): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
  const login = new LoginPage(page);
  await login.goto();
  await login.logInAs(account);
  await page.waitForURL(`**${landingPath}`);
  return page;
}

/** API clients from the shared fixtures, plus browser pages already signed in per role. */
export const test = apiTest.extend<E2eFixtures>({
  claimantPage: async ({ browser }, use) => {
    const page = await signedInPage(browser, CLAIMANT, '/claims');
    await use(page);
    await page.context().close();
  },
  adminPage: async ({ browser }, use) => {
    const page = await signedInPage(browser, ADMIN, '/admin/dashboard');
    await use(page);
    await page.context().close();
  },
});

export { expect, knownDefect } from '../support/fixtures';
