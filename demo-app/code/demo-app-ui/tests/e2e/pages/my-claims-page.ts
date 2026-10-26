import type { Locator, Page } from '@playwright/test';

/** The claimant's "My Claims" page (desktop layout, so the table is the visible view). */
export class MyClaimsPage {
  readonly heading: Locator;
  readonly submitNewClaimButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'My Claims' });
    this.submitNewClaimButton = page.getByRole('button', { name: 'Submit New Claim' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/claims');
  }

  rows(): Locator {
    return this.page.locator('tbody tr').filter({ visible: true });
  }

  rowFor(description: string): Locator {
    return this.rows().filter({ hasText: description.slice(0, 40) });
  }

  statusBadge(description: string, statusLabel: string): Locator {
    return this.rowFor(description).getByLabel(`Claim status: ${statusLabel}`);
  }

  /** Row index of each description in the table, top to bottom. */
  async positionsOf(...descriptions: string[]): Promise<number[]> {
    const texts = await this.rows().allInnerTexts();
    return descriptions.map((description) => texts.findIndex((text) => text.includes(description.slice(0, 40))));
  }
}
