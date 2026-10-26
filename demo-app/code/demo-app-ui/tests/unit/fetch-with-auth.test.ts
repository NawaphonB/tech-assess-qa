import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { claimsApi } from '@/src/lib/api/bff-client';
import { useAuthStore } from '@/src/features/auth/stores/use-auth-store';

const PARALLEL_REQUESTS = 3;

/** A fake BFF: claims calls fail with 401 until the session is refreshed. */
function fakeBff({ refreshSucceeds }: { refreshSucceeds: boolean }) {
  const calls = { refresh: 0, claims: 0 };
  let refreshed = false;
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith('/api/auth/refresh')) {
      calls.refresh++;
      refreshed = refreshSucceeds;
      return new Response(null, { status: refreshSucceeds ? 204 : 401 });
    }
    calls.claims++;
    return refreshed
      ? new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } })
      : new Response(null, { status: 401 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

describe('UT-AUTH-03 expired access token handling', () => {
  beforeEach(() => {
    useAuthStore.getState().login({ userId: 'u1', email: 'claimant@demo.com', name: 'Test Claimant', role: 'CLAIMANT' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('refreshes once for parallel requests and retries each of them once', async () => {
    const calls = fakeBff({ refreshSucceeds: true });

    const results = await Promise.all(Array.from({ length: PARALLEL_REQUESTS }, () => claimsApi.listClaims()));

    expect(results).toEqual(Array(PARALLEL_REQUESTS).fill([]));
    expect(calls.refresh).toBe(1);
    expect(calls.claims).toBe(PARALLEL_REQUESTS * 2);
  });

  it('logs the user out when the refresh is refused', async () => {
    fakeBff({ refreshSucceeds: false });

    await expect(claimsApi.listClaims()).rejects.toThrow();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
