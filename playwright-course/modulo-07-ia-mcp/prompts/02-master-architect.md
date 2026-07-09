# 02 - Master Architect

```text
ROLE:
You are the architect for a new Playwright + TypeScript E2E harness.
Create a generic framework foundation that can attach to any SUT later.

CONTEXT:
Read PROJECT_BRIEF.md first.
Use the UI/API URLs only as environment defaults. Do not inspect or model the application yet.
This folder is empty or only contains setup files.

TASK:
Create the FOUNDATION only. Do not create TEST_PLAN.md, feature slices, app-specific auth, app-specific data, or app-specific page objects yet.

FILES TO CREATE:
1. AGENTS.md
   Include:
   - generic folder tree with CO-LOCATED specs: each feature's specs live inside its slice as `<slice>.spec.ts` and `<slice>.api.spec.ts`; there is NO separate top-level tests/ folder
   - MANDATORY LAYOUT: the only src/ children are `src/core/`, `src/shared/` (with `src/shared/data/`), and `src/features/<slice>/`. Everything a slice needs (page, service, flow, factory/builder, specs, data) lives INSIDE `src/features/<slice>/`. The only shared cross-feature POM allowed is a flat `src/shared/MenuPage.ts` (created later, only when TEST_PLAN.md confirms shared navigation) — never a `src/shared/pages/` folder.
   - FORBIDDEN LAYOUT (this is a vertical-slice harness, NOT a layered one): never create layer folders `src/pages/`, `src/services/`, `src/flows/`, `src/data/`, or `src/tests/` (including `src/tests/ui/` and `src/tests/api/`). If you catch yourself creating any of these, stop and put the file inside its feature slice instead.
   - note that playwright.config.ts runs fullyParallel with a cross-browser + responsive UI matrix (ui-chromium/firefox/webkit + ui-mobile-chrome/ui-mobile-safari) and a single browserless `api` project
   - pattern-to-home table
   - export naming rules
   - locator rules
   - API rules
   - SOLID/DRY/KISS rules
   - vertical slicing rules
   - Clean Code rules: intention-revealing names, small single-purpose units, guard clauses / early return. This is Clean Code practices, NOT layered Clean Architecture; keep the core/shared/features split.
   - test design rules: assert one behavior per test - 1 assertion, at most 2. Web-first sync waits (expect(locator).toBeVisible()) and named page/flow assertion methods (expectLoaded()) do NOT count. A unit object-shape test (builder/factory) uses a single object assertion (toEqual/toMatchObject).
   - data-driven rule: when cases differ only by input, implement ONE parametrized test over typed data in src/shared/data/*.json (for (const c of cases) test(...))
   - token efficiency rules
   - rule that application features, auth strategy, shared menu/navigation, entities, and test data are discovered later from TEST_PLAN.md
2. package.json
   Use pnpm, TypeScript, Playwright, dotenv.
   Include scripts:
   - test
   - test:ui              (project ui-chromium only — fast feedback loop)
   - test:cross           (the full UI matrix: ui-chromium + ui-firefox + ui-webkit + ui-mobile-chrome + ui-mobile-safari)
   - test:firefox         (project ui-firefox)
   - test:webkit          (project ui-webkit)
   - test:mobile          (projects ui-mobile-chrome + ui-mobile-safari)
   - test:api
   - test:smoke           (playwright test --grep @smoke --project=ui-chromium — smoke stays chromium-only for speed)
   - test:headed
   - typecheck
   - report
   - install:browsers
3. playwright.config.ts
   Enable parallel execution and a cross-browser + responsive UI matrix:
   - fullyParallel: true
   - forbidOnly: !!process.env.CI
   - retries: process.env.CI ? 2 : 0
   - workers: process.env.CI ? 2 : undefined   (CI pinned to 2 for stability; local uses ~50% of cores)
   Projects (all five UI projects share the SAME testIgnore: /.*\.api\.spec\.ts/ so API specs never launch a browser):
   - ui-chromium       use: { ...devices["Desktop Chrome"] }
   - ui-firefox        use: { ...devices["Desktop Firefox"] }
   - ui-webkit         use: { ...devices["Desktop Safari"] }
   - ui-mobile-chrome  use: { ...devices["Pixel 5"] }    (responsive viewport <768px — exercises the "-responsive" testid branch)
   - ui-mobile-safari  use: { ...devices["iPhone 13"] }
   - api for **/*.api.spec.ts via testMatch: /.*\.api\.spec\.ts/ and use: { baseURL: process.env.API_URL } (no browser)
   Use env-driven base URLs:
   - BASE_URL for UI
   - API_URL for API
4. tsconfig.json
5. .env.example
6. .gitignore
7. README.md
   Explain that the next step is prompts/03-test-plan.md, then prompts/04-slice-generator.md.
8. src/core/
   - env.ts
   - BasePage.ts
   - BaseService.ts
   - reporter.ts
9. src/shared/
   - fixtures.ts exporting base Playwright test/expect with no app-specific fixtures yet
   - types.ts with only generic reusable types if needed

ARCHITECTURE RULES:
- POM = app-specific page objects created after discovery.
- Shared navigation/menu POM = MenuPage (flat `src/shared/MenuPage.ts`) only when TEST_PLAN.md confirms a menu/navigation component exists.
- Service/Adapter = feature API clients created after API discovery.
- Template Method = src/core/BasePage.ts and src/core/BaseService.ts.
- Factory/Builder = only for discovered complex entities.
- Facade = feature flows created from TEST_PLAN.md.
- Singleton = src/core/env.ts.
- Observer = src/core/reporter.ts.
- DI = src/shared/fixtures.ts, expanded after real slices exist.

EXPORT NAMING:
- Page = <DiscoveredName>Page, e.g. MenuPage when a menu exists.
- Service = <DiscoveredName>Service.
- Flow = <DiscoveredName>Flow.
- Factory = <DiscoveredEntity>Factory only when real test data creation is needed.
- Builder = <DiscoveredEntity>Builder only when the entity is complex.
- env.ts exports frozen `env`.
- reporter.ts default export.

QUALITY RULES:
- No TODO placeholders.
- No feature imports in core.
- No app-specific assumptions in foundation files.
- Follow Clean Code practices: clear names, small single-purpose units, DRY/KISS. This is Clean Code, not layered Clean Architecture; keep the core/shared/features split.
- Use guard clauses / early returns; avoid deep nesting.
- Specs are co-located in each feature slice; no separate tests/ folder.
- Do NOT scaffold layer folders (src/pages, src/services, src/flows, src/data, src/tests). This is a vertical-slice harness: those homes are inside src/features/<slice>/. Creating any layer folder is a structural error to reject.
- Identifiers in English.
- Comments only when useful, in Spanish.
- Real compiling TypeScript.
- No waitForTimeout.
- Future locators: prefer getByRole, getByLabel, and getByTestId.

DELIVERY:
Write the files, then run:
- pnpm install
- pnpm typecheck
Return only:
- created tree
- command results
- confirmation that no app-specific feature code was created
- next prompt to run: prompts/03-test-plan.md
```
