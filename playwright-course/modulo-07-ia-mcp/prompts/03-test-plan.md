# 03 - App Discovery and Test Plan

```text
ROLE:
You are a senior QA automation architect. You discover the SUT and create the test plan before writing feature code.

CONTEXT:
Read PROJECT_BRIEF.md first.
Read AGENTS.md.
Navigate only the UI and API URLs given in PROJECT_BRIEF.md (do not wander to other sites), but use the rest of the brief - including any "## Discovered Project Design (from source)" section - to inform the plan.
The generic harness foundation should already exist.

TASK:
Explore the target system and create TEST_PLAN.md. Do not create feature implementation files yet.

DISCOVERY:
1. Use Playwright MCP to navigate the UI URL.
2. Identify the main user journeys from visible navigation, menus, forms, tables, buttons, routes, and page titles.
3. If a menu, sidebar, header navigation, tab bar, or app shell navigation exists, record it as a shared component and name its page object `MenuPage`.
4. Discover API capabilities from the API URL:
   - try /openapi.json
   - try /docs
   - try /health
   - try the root URL
   - use Playwright request or curl only for lightweight GET/OPTIONS probes
5. Do not brute-force endpoints. Stop after reasonable discovery and document what is confirmed.

FEATURE NAMING:
- Derive feature names from the SUT, not from this prompt.
- Use short, domain-oriented names in kebab/lowercase for folders.
- Use PascalCase for class names.
- Examples of format only, not required features:
  - folder `account-settings` -> `AccountSettingsPage`, `AccountSettingsFlow`
  - shared menu -> `MenuPage`

TEST_PLAN.md MUST INCLUDE:
1. Scope
   - UI URL
   - API URL
   - discovered product/domain summary
2. Discovered UI map
   - route/page
   - visible purpose
   - stable roles, labels, or test ids
   - shared components such as `MenuPage`
   - risks or unknowns
3. Discovered API map
   - endpoint
   - method
   - auth requirement if confirmed
   - expected status/body shape if confirmed
   - source of evidence: openapi/docs/probe/inference
4. Proposed slices
   - slice folder name
   - class prefix
   - reason this slice exists
   - expected files later
   - whether UI spec, API spec, or both are expected
5. Test matrix
   - ID
   - layer: ui | api
   - slice
   - priority: smoke | regression
   - scenario
   - preconditions
   - expected result
   - data-driven: yes when this case differs from a sibling only by input data, else no
   - files expected later
   - evidence source
6. Slice order
   - start with the smallest stable smoke path
   - then add high-value flows
   - then add API coverage where endpoints are confirmed
7. Blocked or unknown
   - anything not confirmed by UI/API evidence

RULES:
- Keep TEST_PLAN.md concise. It is a working contract, not a long test strategy document.
- Group cases that differ only by input data as ONE data-driven case and name its dataset (src/shared/data/<slice>.json) so slices parametrize it instead of duplicating tests.
- Mark inferred API facts clearly as "inference"; do not present them as confirmed.
- If API discovery is limited, define API candidate cases only as blocked/unknown. Do not invent passing API tests later.
- Do not write src/features/* yet.
- When you enumerate "expected files later" (per slice and per test-matrix row), use ONLY co-located vertical-slice paths: src/features/<slice>/<slice>.page.ts | .service.ts | .flow.ts | .factory.ts | .spec.ts | .api.spec.ts, src/shared/data/<slice>.json, and src/shared/MenuPage.ts for shared navigation. NEVER name layer folders (src/pages, src/services, src/flows, src/data, src/tests) — this is a vertical-slice harness (see AGENTS.md).
- Do not edit AGENTS.md unless discovery proves a generic contract is wrong.
- Do not mention example application names or domains unless they are visible in the current SUT.

VERIFY:
Run:
- pnpm typecheck

DELIVERY:
Return only:
- TEST_PLAN.md created
- discovered slices
- shared components found, including whether `MenuPage` is needed
- confirmed UI areas
- confirmed API areas
- blocked/unknown items
- next prompt to run
```
