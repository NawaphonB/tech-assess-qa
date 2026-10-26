import { expect, knownDefect, test } from '../support/fixtures';

/** Retests of confirmed defects on P2 features, kept with the API suite so every rerun rechecks them. */
test.describe('Defect retests outside the P1 scope (API)', () => {
  test('TC-DSH-02 the second dashboard request is served from the cache', async ({ admin }) => {
    knownDefect('B15');
    await admin.flushDashboardCache();

    const first = await (await admin.dashboardStats()).json();
    const second = await (await admin.dashboardStats()).json();

    expect(first.cacheHit).toBe(false);
    expect(second.cacheHit).toBe(true);
  });
});
