import { aClaimRequest } from '../support/claim-requests';
import { RealtimeListener } from '../support/realtime-listener';
import { expect, knownDefect, test } from '../support/fixtures';

/** Each allowed transition, with the statuses needed to reach its starting point. */
const VALID_TRANSITIONS: Array<{ path: string[]; to: string }> = [
  { path: [], to: 'UNDER_REVIEW' },
  { path: [], to: 'REJECTED' },
  { path: ['UNDER_REVIEW'], to: 'APPROVED' },
  { path: ['UNDER_REVIEW'], to: 'REJECTED' },
  { path: ['UNDER_REVIEW', 'APPROVED'], to: 'CLOSED' },
  { path: ['REJECTED'], to: 'CLOSED' },
];

test.describe('Claims › 1.4 Change claim status (API)', () => {
  for (const { path, to } of VALID_TRANSITIONS) {
    const from = path.at(-1) ?? 'SUBMITTED';
    test(`TC-STA-02 admin moves a claim from ${from} to ${to}`, async ({ claimant, admin }) => {
      const claim = await claimant.createClaim(aClaimRequest());
      await admin.moveClaimThrough(claim.claimId, ...path);

      const response = await admin.changeStatus(claim.claimId, to);

      expect(response.status()).toBe(200);
      const updated = await response.json();
      expect(updated.status).toBe(to);
      expect(Date.parse(updated.updatedAt)).toBeGreaterThan(Date.parse(claim.updatedAt));
    });
  }

  test('TC-STA-03 an invalid transition is refused with 400 and the status is kept', async ({ claimant, admin }) => {
    knownDefect('B3');
    const claim = await claimant.createClaim(aClaimRequest());
    await admin.moveClaimThrough(claim.claimId, 'UNDER_REVIEW', 'APPROVED');

    const response = await admin.changeStatus(claim.claimId, 'SUBMITTED');

    expect(response.status()).toBe(400);
    expect((await (await claimant.getClaim(claim.claimId)).json()).status).toBe('APPROVED');
  });

  test('TC-STA-04 a CLOSED claim cannot move again', async ({ claimant, admin }) => {
    knownDefect('B3');
    const claim = await claimant.createClaim(aClaimRequest());
    await admin.moveClaimThrough(claim.claimId, 'REJECTED', 'CLOSED');

    const codes = [];
    for (const status of ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']) {
      codes.push((await admin.changeStatus(claim.claimId, status)).status());
    }

    expect(codes).toEqual([400, 400, 400, 400]);
  });

  test('TC-STA-05 a claimant cannot change a status, even on their own claim', async ({ claimant }) => {
    const claim = await claimant.createClaim(aClaimRequest());

    const response = await claimant.changeStatus(claim.claimId, 'APPROVED');

    expect(response.status()).toBe(403);
    expect((await (await claimant.getClaim(claim.claimId)).json()).status).toBe('SUBMITTED');
  });

  test('TC-STA-06 an unknown claim gives 404', async ({ admin }) => {
    expect((await admin.changeStatus(crypto.randomUUID(), 'UNDER_REVIEW')).status()).toBe(404);
  });

  for (const [label, value] of [['a missing status', undefined], ['an unknown status', 'PENDING']] as const) {
    test(`TC-STA-07 ${label} is refused with 400`, async ({ claimant, admin }) => {
      const claim = await claimant.createClaim(aClaimRequest());

      expect((await admin.changeStatus(claim.claimId, value)).status()).toBe(400);
    });
  }

  test('TC-STA-09 the owner and admins are told about a status change', async ({ claimant, admin }) => {
    const claim = await claimant.createClaim(aClaimRequest());
    const ownerFeed = await RealtimeListener.open((await claimant.accessToken())!);
    const adminFeed = await RealtimeListener.open((await admin.accessToken())!);
    try {
      await admin.moveClaimThrough(claim.claimId, 'UNDER_REVIEW');

      const isThisChange = (m: { type: string; claimId: string; newStatus?: string }) =>
        m.type === 'CLAIM_STATUS_CHANGED' && m.claimId === claim.claimId && m.newStatus === 'UNDER_REVIEW';
      expect(await ownerFeed.waitFor(isThisChange)).toMatchObject({ oldStatus: 'SUBMITTED' });
      expect(await adminFeed.waitFor(isThisChange)).toBeDefined();
    } finally {
      ownerFeed.close();
      adminFeed.close();
    }
  });
});
