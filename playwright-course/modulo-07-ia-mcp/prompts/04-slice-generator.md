# 04 - Slice Generator

```text
ROLE:
You generate one vertical slice at a time in an existing Playwright + TypeScript harness.

VARIABLES:
SLICE=<replace with one slice folder name from TEST_PLAN.md>
SEED_SLICE=<replace with empty for the first slice, otherwise a completed slice to mirror>

CONTEXT:
Read AGENTS.md first.
Read PROJECT_BRIEF.md.
Read TEST_PLAN.md.
Use the Target App UI/API URLs from PROJECT_BRIEF.md.
If SEED_SLICE is not empty, read src/features/SEED_SLICE and mirror its style, naming, test structure, and comment density.

MANDATORY DISCOVERY CHECK:
Before writing code:
1. Find SLICE in TEST_PLAN.md and list the exact UI/API cases assigned to it.
2. Use Playwright MCP to navigate the UI URL and inspect only the UI area needed for SLICE.
3. Confirm real selectors from accessibility snapshots, labels, roles, or test ids.
4. If TEST_PLAN.md says the app has a shared menu/navigation component, create or reuse `MenuPage`.
5. For API cases in TEST_PLAN.md, confirm the endpoint/method/body from TEST_PLAN.md, OpenAPI/docs, or one lightweight probe.
Do not invent selectors, endpoints, request bodies, response shapes, entities, or credentials.

TASK:
Generate src/features/SLICE as one vertical slice.

TYPICAL FILES:
- SLICE.page.ts when the slice has UI behavior
- SLICE.service.ts when the slice has confirmed API behavior
- SLICE.factory.ts only when real test data creation is needed
- SLICE.builder.ts only when a discovered entity is complex
- SLICE.flow.ts when the test needs multi-step orchestration
- SLICE.spec.ts when TEST_PLAN.md contains UI cases for this slice
- SLICE.api.spec.ts when TEST_PLAN.md contains confirmed API cases for this slice
- src/shared/data/SLICE.json only when the slice has data-driven cases (varying only by input)
- src/shared/pages/MenuPage.ts only when TEST_PLAN.md confirms shared menu/navigation exists

RULES:
- Do not edit unrelated slices.
- Do not create files for cases that are blocked or unknown in TEST_PLAN.md.
- Specs import test and expect from ../../shared/fixtures.
- Tests depend on flows or page-level public methods, not direct locator internals.
- UI specs use SLICE.spec.ts.
- API specs use SLICE.api.spec.ts and run under the api project.
- Specs are co-located in the slice folder; do not create a separate tests/ folder.
- Implement only cases listed for SLICE in TEST_PLAN.md.
- If a planned API case is blocked by missing endpoint evidence, document it in the delivery and do not create a fake passing test.
- Locators prefer getByRole/getByLabel/getByTestId.
- No waitForTimeout.
- No deep CSS.
- No XPath.
- No TODOs.
- Follow AGENTS.md code/test design: guard clauses / early return and Clean Code (clear names, small single-purpose units).
- Assert one behavior per test - 1 assertion, at most 2 (per AGENTS.md). Web-first sync waits and named Page/Flow assertion methods do not count; a unit object-shape test uses a single object assertion (toEqual).
- Data-driven: when SLICE cases in TEST_PLAN.md differ only by input, implement them as ONE parametrized test over typed data in src/shared/data/SLICE.json (for (const c of cases) test(...)).
- Keep the slice small enough to review.

VERIFY:
Run:
- pnpm typecheck
- if SLICE.spec.ts exists: pnpm exec playwright test src/features/SLICE --project=ui-chromium
- if SLICE.api.spec.ts exists: pnpm exec playwright test src/features/SLICE --project=api

DELIVERY:
Return:
- files written
- TEST_PLAN.md cases implemented
- selectors confirmed by MCP
- API endpoints confirmed
- whether `MenuPage` was created/reused
- verification result
- if failing, smallest next fix
```
