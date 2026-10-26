import { aClaimRequest, textOfLength, utcDate } from '../support/claim-requests';
import { RealtimeListener } from '../support/realtime-listener';
import { expect, knownDefect, test } from '../support/fixtures';

test.describe('Claims › 1.1 Submit a claim (API)', () => {
  test('TC-SUB-02 creates a SUBMITTED claim owned by the caller', async ({ claimant }) => {
    const body = aClaimRequest();

    const response = await claimant.submitClaim(body);

    expect(response.status()).toBe(201);
    const claim = await response.json();
    expect(claim).toMatchObject({ status: 'SUBMITTED', description: body.description, claimAmount: body.claimAmount });
    const mine = await (await claimant.listMyClaims()).json();
    expect(mine.map((c: { claimId: string }) => c.claimId)).toContain(claim.claimId);
  });

  test("TC-SUB-04 accepts today's date (UTC)", async ({ claimant }) => {
    const response = await claimant.submitClaim(aClaimRequest({ incidentDate: utcDate(0) }));

    expect(response.status()).toBe(201);
  });

  test('TC-SUB-03 refuses an incident date in the future with 400', async ({ claimant }) => {
    knownDefect('N1');
    const response = await claimant.submitClaim(aClaimRequest({ incidentDate: utcDate(1) }));

    expect(response.status()).toBe(400);
  });

  for (const claimAmount of [0.01, 1_000_000]) {
    test(`TC-SUB-05 accepts amount ${claimAmount}`, async ({ claimant }) => {
      expect((await claimant.submitClaim(aClaimRequest({ claimAmount }))).status()).toBe(201);
    });
  }

  for (const claimAmount of [0, 1_000_000.01]) {
    test(`TC-SUB-05 refuses amount ${claimAmount} with 400`, async ({ claimant }) => {
      expect((await claimant.submitClaim(aClaimRequest({ claimAmount }))).status()).toBe(400);
    });
  }

  for (const length of [10, 1000]) {
    test(`TC-SUB-06 accepts a description of ${length} characters`, async ({ claimant }) => {
      expect((await claimant.submitClaim(aClaimRequest({ description: textOfLength(length) }))).status()).toBe(201);
    });
  }

  for (const length of [9, 1001]) {
    test(`TC-SUB-06 refuses a description of ${length} characters with 400`, async ({ claimant }) => {
      expect((await claimant.submitClaim(aClaimRequest({ description: textOfLength(length) }))).status()).toBe(400);
    });
  }

  test('TC-SUB-06 checks the description length after trimming spaces', async ({ claimant }) => {
    knownDefect('N1');
    const paddedTooShort = `   ${textOfLength(9)}   `;

    expect((await claimant.submitClaim(aClaimRequest({ description: paddedTooShort }))).status()).toBe(400);
  });

  for (const length of [5, 200]) {
    test(`TC-SUB-07 accepts a location of ${length} characters`, async ({ claimant }) => {
      expect((await claimant.submitClaim(aClaimRequest({ incidentLocation: textOfLength(length) }))).status()).toBe(201);
    });
  }

  for (const length of [4, 201]) {
    test(`TC-SUB-07 refuses a location of ${length} characters with 400`, async ({ claimant }) => {
      expect((await claimant.submitClaim(aClaimRequest({ incidentLocation: textOfLength(length) }))).status()).toBe(400);
    });
  }

  for (const missing of ['incidentDate', 'incidentLocation', 'description', 'claimAmount'] as const) {
    test(`TC-SUB-08 refuses a claim without ${missing} with 400`, async ({ claimant }) => {
      const body: Record<string, unknown> = { ...aClaimRequest() };
      delete body[missing];

      const response = await claimant.http.post('/api/claims', { data: body, headers: await claimant.csrfHeader() });

      expect(response.status()).toBe(400);
    });
  }

  test('TC-SUB-12 announces a new claim to admins after it is saved, and nothing for a refused one', async ({ claimant, admin }) => {
    const adminFeed = await RealtimeListener.open((await admin.accessToken())!);
    try {
      const saved = await claimant.createClaim(aClaimRequest());
      await claimant.submitClaim(aClaimRequest({ claimAmount: 0 }));

      const announced = await adminFeed.waitFor((m) => m.type === 'CLAIM_SUBMITTED' && m.claimId === saved.claimId);
      expect(announced).toBeDefined();
      expect(adminFeed.messages.filter((m) => m.type === 'CLAIM_SUBMITTED')).toHaveLength(1);
    } finally {
      adminFeed.close();
    }
  });
});
