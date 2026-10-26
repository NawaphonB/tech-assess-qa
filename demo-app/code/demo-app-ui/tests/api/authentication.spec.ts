import { CLAIMANT } from '../support/test-accounts';
import { expect, knownDefect, test } from '../support/fixtures';

const SESSION_COOKIES = ['access_token', 'refresh_token'];

const setCookieHeaders = (headers: Array<{ name: string; value: string }>) =>
  headers.filter((header) => header.name.toLowerCase() === 'set-cookie').map((header) => header.value);

test.describe('Authentication (API)', () => {
  test('TC-AUTH-02 login sets HttpOnly, SameSite=Strict session cookies', async ({ anonymous }) => {
    const response = await anonymous.login(CLAIMANT.email, CLAIMANT.password);

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ email: CLAIMANT.email, role: 'CLAIMANT' });
    const cookies = setCookieHeaders(response.headersArray());
    for (const name of SESSION_COOKIES) {
      const cookie = cookies.find((value) => value.startsWith(`${name}=`));
      expect(cookie, `${name} cookie`).toBeDefined();
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Strict');
    }
  });

  test('TC-AUTH-03 a wrong password gives 401 and no session cookies', async ({ anonymous }) => {
    const response = await anonymous.login(CLAIMANT.email, `${CLAIMANT.password}-wrong`);

    expect(response.status()).toBe(401);
    expect((await response.json()).detail).toBe('Invalid email or password');
    expect(await anonymous.accessToken()).toBeUndefined();
  });

  test('TC-AUTH-04 refresh issues a new token pair', async ({ claimant }) => {
    const before = await claimant.cookie('refresh_token');

    const response = await claimant.refresh();

    expect(response.status()).toBe(204);
    expect(await claimant.cookie('refresh_token')).not.toBe(before);
  });

  test('TC-AUTH-05 refresh without a session gives 401', async ({ anonymous }) => {
    expect((await anonymous.refresh()).status()).toBe(401);
  });

  test('TC-AUTH-06 after logout the old refresh token no longer works', async ({ claimant }) => {
    knownDefect('B10');
    const oldRefreshToken = await claimant.cookie('refresh_token');

    expect((await claimant.logout()).status()).toBe(204);

    const replay = await claimant.http.post('/api/auth/refresh', {
      headers: { Cookie: `refresh_token=${oldRefreshToken}` },
    });
    expect(replay.status()).toBe(401);
  });
});
