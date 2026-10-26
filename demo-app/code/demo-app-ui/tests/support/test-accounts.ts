/**
 * Demo accounts seeded by the Keycloak realm import (see demo-app/README.md).
 * Override with environment variables to run against another environment.
 */
export interface TestAccount {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'CLAIMANT';
}

export const CLAIMANT: TestAccount = {
  email: process.env.QA_CLAIMANT_EMAIL ?? 'claimant@demo.com',
  password: process.env.QA_CLAIMANT_PASSWORD ?? 'Claimant123!',
  name: 'Test Claimant',
  role: 'CLAIMANT',
};

export const ADMIN: TestAccount = {
  email: process.env.QA_ADMIN_EMAIL ?? 'admin@demo.com',
  password: process.env.QA_ADMIN_PASSWORD ?? 'Admin123!',
  name: 'Admin User',
  role: 'ADMIN',
};

/** A unique email for signup tests, so reruns never collide. */
export function uniqueEmail(prefix = 'qa.signup'): string {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1000)}@demo.com`;
}
