import type { Page } from '@playwright/test';

export class SignupPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/signup');
  }

  async signUp(details: { name: string; email: string; password: string }): Promise<void> {
    await this.page.getByLabel('Name').fill(details.name);
    await this.page.getByLabel('Email').fill(details.email);
    await this.page.getByLabel('Password', { exact: true }).fill(details.password);
    await this.page.getByRole('button', { name: 'Sign Up' }).click();
  }
}
