import { aClaimRequest } from '../support/claim-requests';
import { expect, knownDefect, test } from '../support/fixtures';

interface AdminClaim {
  claimId: string;
  userId: string;
  status: string;
  createdAt: string;
}

test.describe('Claims › 1.3 Admin claims table (API)', () => {
  test('TC-ADM-02 lists every claim newest first when no filter is set', async ({ claimant, admin }) => {
    knownDefect('B14');
    await claimant.createClaim(aClaimRequest());
    await claimant.createClaim(aClaimRequest());

    const created = ((await (await admin.listAllClaims()).json()) as AdminClaim[]).map((c) => Date.parse(c.createdAt));

    expect(created).toEqual([...created].sort((a, b) => b - a));
  });

  test('TC-ADM-03 filters by status', async ({ claimant, admin }) => {
    const claim = await claimant.createClaim(aClaimRequest());
    await admin.moveClaimThrough(claim.claimId, 'UNDER_REVIEW');

    const claims = (await (await admin.listAllClaims({ status: 'UNDER_REVIEW' })).json()) as AdminClaim[];

    expect(claims.map((c) => c.claimId)).toContain(claim.claimId);
    expect(new Set(claims.map((c) => c.status))).toEqual(new Set(['UNDER_REVIEW']));
  });

  test('TC-ADM-04 filters by status and user together', async ({ claimant, admin }) => {
    const claim = await claimant.createClaim(aClaimRequest());

    const claims = (await (await admin.listAllClaims({ status: 'SUBMITTED', userId: claim.userId })).json()) as AdminClaim[];

    expect(claims.map((c) => c.claimId)).toContain(claim.claimId);
    expect(claims.every((c) => c.status === 'SUBMITTED' && c.userId === claim.userId)).toBe(true);
  });

  test('TC-ADM-06 a claimant is refused the admin claims list with 403', async ({ claimant }) => {
    expect((await claimant.listAllClaims()).status()).toBe(403);
  });
});
