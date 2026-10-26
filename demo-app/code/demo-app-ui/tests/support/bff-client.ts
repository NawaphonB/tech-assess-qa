import { request, type APIRequestContext, type APIResponse } from '@playwright/test';
import { BFF_URL } from '../../playwright.config';
import type { SubmitClaimBody } from './claim-requests';
import type { TestAccount } from './test-accounts';

export interface Claim {
  claimId: string;
  userId: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * The BFF's public API as one signed-in user sees it. Holds that user's cookies
 * and CSRF token, so tests talk in business terms instead of HTTP plumbing.
 */
export class BffClient {
  private constructor(readonly http: APIRequestContext) {}

  static async anonymous(): Promise<BffClient> {
    const http = await request.newContext({ baseURL: BFF_URL });
    return new BffClient(http);
  }

  static async signedInAs(account: TestAccount): Promise<BffClient> {
    const client = await BffClient.anonymous();
    const response = await client.login(account.email, account.password);
    if (!response.ok()) {
      throw new Error(`Login as ${account.email} failed: HTTP ${response.status()}`);
    }
    return client;
  }

  async login(email: string, password: string): Promise<APIResponse> {
    const response = await this.http.post('/api/auth/login', { data: { email, password } });
    await this.loadCsrfToken();
    return response;
  }

  /** Asks the BFF for a CSRF cookie; it replaces the token after each write, so writes re-read it. */
  async loadCsrfToken(): Promise<void> {
    await this.http.get('/api/auth/csrf');
  }

  async cookie(name: string): Promise<string | undefined> {
    const { cookies } = await this.http.storageState();
    return cookies.find((cookie) => cookie.name === name)?.value;
  }

  accessToken(): Promise<string | undefined> {
    return this.cookie('access_token');
  }

  // Claimant endpoints
  async submitClaim(body: SubmitClaimBody): Promise<APIResponse> {
    return this.http.post('/api/claims', { data: body, headers: await this.csrfHeader() });
  }

  listMyClaims(): Promise<APIResponse> {
    return this.http.get('/api/claims');
  }

  getClaim(claimId: string): Promise<APIResponse> {
    return this.http.get(`/api/claims/${claimId}`);
  }

  // Admin endpoints
  listAllClaims(params: { status?: string; userId?: string } = {}): Promise<APIResponse> {
    return this.http.get('/api/admin/claims', { params });
  }

  async changeStatus(claimId: string, newStatus: unknown): Promise<APIResponse> {
    return this.http.patch(`/api/admin/claims/${claimId}/status`, {
      data: newStatus === undefined ? {} : { newStatus },
      headers: await this.csrfHeader(),
    });
  }

  dashboardStats(bypassCache = false): Promise<APIResponse> {
    return this.http.get('/api/admin/dashboard/stats', { params: { bypassCache } });
  }

  async flushDashboardCache(): Promise<APIResponse> {
    return this.http.post('/api/admin/dashboard/flush-cache', { headers: await this.csrfHeader() });
  }

  // Session endpoints
  signup(body: { name: string; email: string; password: string }): Promise<APIResponse> {
    return this.http.post('/api/auth/signup', { data: body });
  }

  refresh(): Promise<APIResponse> {
    return this.http.post('/api/auth/refresh');
  }

  async logout(): Promise<APIResponse> {
    return this.http.post('/api/auth/logout', { headers: await this.csrfHeader() });
  }

  /** Submits a valid claim and returns it, failing loudly if the API refuses. */
  async createClaim(body: SubmitClaimBody): Promise<Claim> {
    const response = await this.submitClaim(body);
    if (response.status() !== 201) {
      throw new Error(`Claim setup failed: HTTP ${response.status()} ${await response.text()}`);
    }
    return response.json();
  }

  /** Moves a claim through the given statuses as an admin, failing loudly on any refusal. */
  async moveClaimThrough(claimId: string, ...statuses: string[]): Promise<void> {
    for (const status of statuses) {
      const response = await this.changeStatus(claimId, status);
      if (!response.ok()) {
        throw new Error(`Status setup ${status} failed: HTTP ${response.status()}`);
      }
    }
  }

  dispose(): Promise<void> {
    return this.http.dispose();
  }

  async csrfHeader(): Promise<Record<string, string>> {
    return { 'X-XSRF-TOKEN': (await this.cookie('XSRF-TOKEN')) ?? '' };
  }
}
