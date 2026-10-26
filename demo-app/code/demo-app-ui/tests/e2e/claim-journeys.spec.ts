import { aClaimRequest, utcDate } from '../support/claim-requests';
import { AdminClaimsPage } from './pages/admin-claims-page';
import { MyClaimsPage } from './pages/my-claims-page';
import { NewClaimWizard } from './pages/new-claim-wizard';
import { expect, test } from './e2e-fixtures';

test.describe('Claims management journeys (UI)', () => {
  test('TC-SUB-01 a claimant submits a claim and sees it at the top of My Claims', async ({ claimantPage }) => {
    const claim = aClaimRequest({ incidentDate: utcDate(-2) });
    const myClaims = new MyClaimsPage(claimantPage);
    await myClaims.submitNewClaimButton.click();

    await new NewClaimWizard(claimantPage).submit(claim);

    await expect(claimantPage.getByText(/Claim submitted successfully/)).toBeVisible();
    await claimantPage.waitForURL('**/claims');
    await expect(myClaims.statusBadge(claim.description, 'Submitted')).toBeVisible();
    expect(await myClaims.positionsOf(claim.description)).toEqual([0]);
  });

  test('TC-MY-01 My Claims lists the newest claim first', async ({ claimant, claimantPage }) => {
    const older = await claimant.createClaim(aClaimRequest());
    const newer = await claimant.createClaim(aClaimRequest());
    const myClaims = new MyClaimsPage(claimantPage);

    await myClaims.goto();

    await expect(myClaims.rowFor(newer.description)).toBeVisible();
    const [newerAt, olderAt] = await myClaims.positionsOf(newer.description, older.description);
    expect(newerAt).toBeLessThan(olderAt);
  });

  test('TC-ADM-01 an admin sees every new claim with its claim and user IDs', async ({ claimant, adminPage }) => {
    const claim = await claimant.createClaim(aClaimRequest());
    const adminClaims = new AdminClaimsPage(adminPage);

    await adminClaims.goto();

    const row = adminClaims.rowFor(claim.claimId);
    await expect(row).toBeVisible();
    await expect(row).toContainText(claim.userId.slice(0, 8));
    await expect(row.getByLabel('Claim status: Submitted')).toBeVisible();
  });

  test('TC-STA-01 an admin approves a claim and the claimant sees it live', async ({ claimant, claimantPage, adminPage }) => {
    const claim = await claimant.createClaim(aClaimRequest());
    const myClaims = new MyClaimsPage(claimantPage);
    await myClaims.goto();
    await expect(myClaims.statusBadge(claim.description, 'Submitted')).toBeVisible();
    const adminClaims = new AdminClaimsPage(adminPage);
    await adminClaims.goto();

    await adminClaims.changeStatus(claim.claimId, 'UNDER_REVIEW');
    await expect(adminClaims.rowFor(claim.claimId).getByLabel('Claim status: Under Review')).toBeVisible();
    await adminClaims.changeStatus(claim.claimId, 'APPROVED');

    await expect(adminClaims.rowFor(claim.claimId).getByLabel('Claim status: Approved')).toBeVisible();
    await expect(claimantPage.getByText(`status changed to APPROVED`)).toBeVisible();
    await expect(myClaims.statusBadge(claim.description, 'Approved')).toBeVisible();
  });
});
