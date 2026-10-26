# Running the test suites

Four suites cover the claims app, from unit tests to browser journeys. Unit and component
suites need no running services; the API and end-to-end suites run against the Docker
Compose stack.

| Suite | Where | Tool | Needs the stack |
| --- | --- | --- | --- |
| claims-service unit | `demo-app/code/claims-service/src/test` | JUnit 5, AssertJ, Mockito | No |
| BFF unit | `demo-app/code/bff-service/src/test` | JUnit 5, Mockito | No |
| UI unit and component | `demo-app/code/demo-app-ui/tests/unit`, `tests/component` | Vitest, Testing Library | No |
| API and end to end | `demo-app/code/demo-app-ui/tests/api`, `tests/e2e` | Playwright | Yes |

## Commands

```bash
# Unit tests (no services)
cd demo-app/code/claims-service && mvn test -Dcheckstyle.skip -Dpmd.skip
cd demo-app/code/bff-service && mvn test -Dcheckstyle.skip -Dpmd.skip
cd demo-app/code/demo-app-ui && npm ci && npx vitest run

# API and end-to-end tests (start the stack first: ./start-infra.sh, then ./start-app.sh)
cd demo-app/code/demo-app-ui && npx playwright install chromium
npx playwright test                 # both projects
npx playwright test --project=api   # API only
npx playwright test --project=e2e   # browser journeys only
```

Reports: `target/surefire-reports/` per service, `test-results/vitest-junit.xml`,
`test-results/playwright-junit.xml` and `playwright-report/index.html`.

## Known defects

A test for a defect that is still open asserts the correct behaviour and carries a
known-defect marker with the defect id (`@KnownDefect("B1")` in Java, `knownDefect('B5', …)`
in Vitest and Playwright). While the defect reproduces, the suite stays green and reports
the test as an expected failure; once the defect is fixed, the test fails and asks for the
marker to be removed. Run with `SHOW_KNOWN_DEFECTS=1` to treat them as ordinary tests and
see each failing assertion.

## Test data

The API and end-to-end suites use the demo accounts from the Keycloak realm import (see
`demo-app/README.md`); override them with `QA_CLAIMANT_EMAIL`, `QA_CLAIMANT_PASSWORD`,
`QA_ADMIN_EMAIL` and `QA_ADMIN_PASSWORD`. Each test creates its own claims through the API
with a unique marker in the description, so runs do not depend on existing data.
`UI_URL` and `BFF_URL` point the suite at another environment.
