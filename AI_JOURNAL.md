# AI working journal

AI (Claude Code) did most of the reading, writing and test generation in this assessment. This log records where I accepted its output, where I challenged it, and where I overrode it. It was compiled from the session transcripts of 26 Oct 2026 (times are GMT+7, Bangkok time).

## Log

| Time | What I asked | Outcome | Accepted / challenged / overrode | Why |
| --- | --- | --- | --- | --- |
| 17:02 | Recap the brief and a step-by-step plan | Slide deck with a timed plan | Accepted | Clear plan; I treated its test targets as guesses until I had read the code |
| 17:05 | Walk through the code, split risks into business and technical, list features, APIs and a system diagram | System Specification, 14 suspected defects with file and line | Accepted, then challenged | AI pointed out the brief says Angular but the UI is Next.js/React, so I switched to Vitest and Testing Library. Every defect was treated as unproven until a test or a live run showed it |
| 17:21 | Start the stack, smoke both journeys, confirm B1, B2, B3, B6 | All 4 confirmed live; B15 (dashboard cache never hits) found | Challenged | B1 showed nothing at 600 parallel requests and only 5 of 3,000 at higher load. A black-box test would be flaky, so I had it written as a BFF reproducer that forces the overlap (489 of 1,000 crossed) |
| 17:21 | (same run) | Some long responses were cut off mid-run | Checked | I verified what had actually been saved: `SMOKE-EVIDENCE.md` held only a header, so the chat results stayed the record |
| 17:45–19:50 | Test Strategy and Test Cases documents | Cases per feature with priority and automation level | Overrode several times | I merged the claim features into one "Claims management" feature (1.1–1.6), renamed "Log in, refresh, log out" to Authentication, and rebuilt the summary table to my 5 columns |
| 20:19 | Does the app have user management? | AI found it was rated P3 but shows every customer's email | Overrode | I raised User management to P2 and had 6 cases added, including a 403 check for claimants |
| 20:31 | Exit criteria | AI added a sign-off line I hadn't asked for and flagged it | Accepted, as flagged | Kept, since AI said it was its own addition and I agreed with it |
| 20:34 | Testing scope | AI assumed Chromium only and penetration testing out of scope, and said so | Accepted | Both fit a 3-hour sprint; listed as assumptions |
| 20:35 | Write all counts as digits | 84 changes; AI found a stale total and a spec overview out of line with the register | Accepted, then fixed the overview | Overview now says 16 defects, 6 confirmed live |
| 20:39 | B16 (admin calls drop the correlation ID) | AI held it as pending instead of adding it to the register | Overrode, then logged it | I wanted the defect register to change only on my say-so; I then told it to log B16 |
| 21:38 | Unit and component suites | 135 tests; known-defect markers for B1, B5, B9 | Challenged | Some `ClaimTest` groups reported 0 tests. I had AI confirm all 19 run (Surefire reports them under display names), so no silent pass |
| 21:43 | API and end-to-end suite against the stack | 197 tests, 181 passed, 16 known defects; N1 and N2 found | Challenged | First run with known-defect markers off, so each marker matches a defect seen live, not one assumed. A CSRF caching bug in our own test client was found and fixed. 3 green runs in a row before I accepted the results |
| 21:51 | Sign up business impact | AI had Sign up at High under its own criteria | Overrode | New customers being unable to register is Critical for the business; criteria and rollup updated to match |
| 22:00 | Where to record N1, N2 | — | Overrode | N-defects found by test scripts stay in the Defect Retest doc only; the spec register holds B1–B16 found before scripting |
| 22:05 | TC-ADM-01 expected result | The document expected owner names, the page shows IDs | Accepted | The automated test checks what the page shows; the document was corrected |

## Patterns

- **AI is good at:** reading a large codebase fast, cross-referencing documents, generating test scaffolding, and flagging its own assumptions when asked.
- **What I always checked:** that a failing test fails for the reason it names, that 0-test runs aren't silent passes, flakiness over repeated runs, and that counts match across documents.
- **Where I kept control:** priorities and business impact, what goes in the defect register, and test structure. AI proposed; I decided.
