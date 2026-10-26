import type { Locator, Page } from '@playwright/test';

/** The admin "Claims" page with the status select on each row. */
export class AdminClaimsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/admin/claims');
  }

  rowFor(claimId: string): Locator {
    return this.page.locator('tbody tr').filter({ visible: true }).filter({ hasText: claimId.slice(0, 8) });
  }

  async changeStatus(claimId: string, newStatus: string): Promise<void> {
    await this.page.getByTestId(`status-select-${claimId.slice(0, 8)}`).filter({ visible: true }).selectOption(newStatus);
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }
}
