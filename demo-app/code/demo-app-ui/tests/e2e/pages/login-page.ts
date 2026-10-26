import type { Page } from '@playwright/test';
import type { TestAccount } from '../../support/test-accounts';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async logInAs(account: TestAccount): Promise<void> {
    await this.page.getByLabel('Email').fill(account.email);
    await this.page.getByLabel('Password', { exact: true }).fill(account.password);
    await this.page.getByRole('button', { name: 'Log In' }).click();
  }
}
