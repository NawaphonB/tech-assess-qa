import { aClaimRequest } from '../support/claim-requests';
import { expect, knownDefect, test } from '../support/fixtures';

const claimIds = (claims: Array<{ claimId: string }>) => claims.map((claim) => claim.claimId);

test.describe('Claims › 1.2 My claims list and detail (API)', () => {
  test("TC-MY-02 each user's list holds only their own claims", async ({ claimant, admin }) => {
    const claim = await claimant.createClaim(aClaimRequest());

    const claimantList = await (await claimant.listMyClaims()).json();
    const adminList = await (await admin.listMyClaims()).json();

    expect(claimIds(claimantList)).toContain(claim.claimId);
    expect(claimIds(adminList)).not.toContain(claim.claimId);
  });

  test('TC-MY-02 lists claims newest first', async ({ claimant }) => {
    await claimant.createClaim(aClaimRequest());
    await claimant.createClaim(aClaimRequest());

    const created = (await (await claimant.listMyClaims()).json()).map((c: { createdAt: string }) => Date.parse(c.createdAt));

    expect(created).toEqual([...created].sort((a, b) => b - a));
  });

  test('TC-MY-04 the owner gets the full claim', async ({ claimant }) => {
    const body = aClaimRequest();
    const claim = await claimant.createClaim(body);

    const response = await claimant.getClaim(claim.claimId);

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ claimId: claim.claimId, ...body });
  });

  test("TC-MY-05 another user is refused someone else's claim with 403", async ({ claimant, admin }) => {
    knownDefect('B4');
    const claim = await claimant.createClaim(aClaimRequest());

    const response = await admin.getClaim(claim.claimId);

    expect(response.status()).toBe(403);
  });

  test('TC-MY-06 an unknown claim id gives 404', async ({ claimant }) => {
    knownDefect('B4');
    const response = await claimant.getClaim(crypto.randomUUID());

    expect(response.status()).toBe(404);
  });
});
